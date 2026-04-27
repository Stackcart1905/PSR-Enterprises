import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Cart from "../models/cartSchema.model.js";
import Product from "../models/productSchema.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import {
  ORDER_STATUS,
  VALID_STATUS_TRANSITIONS,
  PRICING_CONFIG,
  DELIVERY_CONFIG,
  DELIVERY_PRICING,
} from "../config/constants.js";
import { isWithinDeliveryRadius } from "../utils/geoUtils.js";
import { generateOrderNumber } from "../utils/orderNumberGenerator.js";
import { io } from "../lib/socket.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";
import { WHATSAPP_TEMPLATES } from "../constants/whatsappTemplates.js";
import { getCoordinatesFromAddress } from "../services/geocodingService.js";

/**
 * @desc    Place a new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res) => {
  try {
    const { deliveryInfo, cartItems } = req.body;
    const userId = req.user._id;

    console.log(
      "📥 Incoming Order Request Body:",
      JSON.stringify(req.body, null, 2),
    );
    // 1. Address Validation (Required)
    const addressText = deliveryInfo?.addressText?.trim();
    const pincode = deliveryInfo?.pincode?.trim();
    const { lat, lng } = deliveryInfo?.coordinates || {};

    // Address is now required
    if (!addressText) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    // Get coordinates from address if not provided
    let finalLat = lat;
    let finalLng = lng;

    if (!finalLat || !finalLng) {
      console.log(
        `📡 createOrder: Getting coordinates from address: "${addressText}" pincode: "${pincode}"`,
      );
      try {
        const resolveQuery = pincode
          ? `${addressText}, ${pincode}`
          : addressText;
        const resolved = await getCoordinatesFromAddress(resolveQuery);
        finalLat = resolved.lat;
        finalLng = resolved.lng;
      } catch (geoError) {
        console.error("Geocoding failed:", geoError.message);
        // Continue without coordinates - address is primary
      }
    }

    // 2. Distance Validation (if coordinates available)
    let radiusCheck = { isWithin: true, distance: null };

    if (finalLat && finalLng) {
      console.log(
        `📍 Validating Delivery Radius: Lat ${finalLat}, Lng ${finalLng} (Address: ${addressText})`,
      );
      radiusCheck = isWithinDeliveryRadius(finalLat, finalLng);
      console.log(
        `📏 Distance: ${radiusCheck.distance}km, Within Radius: ${radiusCheck.isWithin}`,
      );

      if (!radiusCheck.isWithin) {
        console.log(
          `❌ Radius check failed: ${radiusCheck.distance}km > ${DELIVERY_CONFIG.MAX_RADIUS_KM}km`,
        );
        return res.status(400).json({
          message: `Delivery location is out of range (${radiusCheck.distance}km). Max allowed is ${DELIVERY_CONFIG.MAX_RADIUS_KM}km.`,
        });
      }
    } else {
      console.log(
        `📍 Proceeding with address-based validation: ${addressText}`,
      );
    }

    // 2. Validate cart items from request body
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.log("❌ Order Failed: Empty cart items in request.");
      return res.status(400).json({ message: "Your cart is empty." });
    }

    console.log(
      `📦 Received ${cartItems.length} items from frontend. Validating prices from DB...`,
    );

    // 4. Build order items — fetch REAL prices from Product collection (never trust frontend)
    let subtotal = 0;
    const orderItems = [];

    // 5. Check if this is user's first order
    const existingOrders = await Order.countDocuments({ user: userId });
    const isFirstOrder = existingOrders === 0;

    // 6. Calculate delivery fee based on distance and special conditions
    let deliveryFee = 0;
    if (radiusCheck.distance) {
      const distance = parseFloat(radiusCheck.distance);

      // Base delivery fee calculation (1-5 km only)
      if (distance >= 1 && distance <= DELIVERY_PRICING.TIER_1_RADIUS_KM) {
        deliveryFee = DELIVERY_PRICING.TIER_1_FEE; // ₹40 for 1-3 km
      } else if (
        distance > DELIVERY_PRICING.TIER_1_RADIUS_KM &&
        distance <= DELIVERY_PRICING.TIER_2_RADIUS_KM
      ) {
        deliveryFee = DELIVERY_PRICING.TIER_2_FEE; // ₹60 for 3-5 km
      } else if (distance > DELIVERY_PRICING.TIER_2_RADIUS_KM) {
        deliveryFee = DELIVERY_PRICING.TIER_3_FEE; // ₹60 for >5 km
      }

      console.log(
        `📍 Distance: ${distance.toFixed(1)} km, Base delivery fee: ₹${deliveryFee}`,
      );
    }

    for (const cartItem of cartItems) {
      const product = await Product.findById(cartItem.productId);
      if (!product) {
        console.log(`❌ Product not found: ${cartItem.productId}`);
        return res.status(400).json({
          message: `Product not found: ${cartItem.productId}`,
        });
      }

      // Stock pre-check
      const quantity = Number(cartItem.quantity) || 1;
      if (product.stock < quantity) {
        console.log(
          `❌ Order Failed: Insufficient stock for ${product.name}. Req: ${quantity}, Available: ${product.stock}`,
        );
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const itemPrice = Number(product.price) || 0;
      subtotal += itemPrice * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: quantity,
        price: itemPrice,
        image: product.images?.[0]?.url || "",
      });
    }

    // 7. Apply special delivery rules
    // Rule 1: Free delivery for first order
    if (
      isFirstOrder &&
      PRICING_CONFIG.FIRST_ORDER_FREE_DELIVERY &&
      deliveryFee > 0
    ) {
      deliveryFee = 0;
      console.log("🎉 First order - FREE delivery applied!");
    }
    // Rule 2: Free delivery for orders above ₹500 (if not already free)
    else if (
      subtotal >= PRICING_CONFIG.FREE_SHIPPING_THRESHOLD &&
      deliveryFee > 0
    ) {
      deliveryFee = 0;
      console.log("🎉 Order above ₹500 - FREE delivery applied!");
    }

    // 8. Calculate GST based on individual product GST percentages
    let totalGST = 0;
    for (const cartItem of cartItems) {
      const product = await Product.findById(cartItem.productId);
      if (product) {
        const quantity = Number(cartItem.quantity) || 1;
        const itemPrice = Number(product.price) || 0;
        const itemSubtotal = itemPrice * quantity;
        const gstPercent = product.gstPercent || 18; // Default to 18% if not set
        const itemGST = (itemSubtotal * gstPercent) / 100;
        totalGST += itemGST;
      }
    }
    const taxAmount = Number(totalGST.toFixed(2));
    const totalAmount = Number((subtotal + taxAmount + deliveryFee).toFixed(2));

    console.log(
      `💰 Pricing: Subtotal ₹${subtotal}, Tax ₹${taxAmount}, Delivery Fee ₹${deliveryFee}, Total ₹${totalAmount}`,
    );

    if (isNaN(totalAmount) || totalAmount <= 0) {
      throw new Error("Invalid price calculation: Total is NaN or zero");
    }

    // 5. Create Order
    const newOrder = new Order({
      orderNumber: generateOrderNumber(),
      user: userId,
      items: orderItems,
      subtotal,
      taxAmount,
      totalAmount,
      deliveryFee,
      distance: radiusCheck.distance,
      deliveryInfo: {
        ...deliveryInfo,
        coordinates:
          finalLat && finalLng ? { lat: finalLat, lng: finalLng } : undefined, // Store coordinates if available
        contactNumber: deliveryInfo.contactNumber || req.user.contactNumber,
      },
      status: ORDER_STATUS.PENDING,
    });

    await newOrder.save();
    console.log("Order created successfully:", newOrder.orderNumber);
    console.log("Order items count:", newOrder.items.length);
    console.log("Order delivery info:", newOrder.deliveryInfo);
    console.log(
      "Order subtotal:",
      newOrder.subtotal,
      "GST:",
      newOrder.taxAmount,
      "Delivery fee:",
      newOrder.deliveryFee,
    );

    // 6. Create persistent notifications for all admins & emit socket events
    try {
      const admins = await User.find({ role: "admin" }).select("_id");
      const notificationPayload = {
        type: "ORDER_PLACED",
        message: `New order #${newOrder.orderNumber} placed by ${req.user.fullName} — ₹${newOrder.totalAmount.toLocaleString()}`,
        orderId: newOrder._id,
        orderNumber: newOrder.orderNumber,
      };

      // Create a notification record for each admin
      const adminNotifications = admins.map((admin) => ({
        user: admin._id,
        ...notificationPayload,
      }));
      await Notification.insertMany(adminNotifications);

      // Emit real-time socket events
      io.to("admins").emit("newOrder", {
        orderNumber: newOrder.orderNumber,
        customerName: req.user.fullName,
        totalAmount: newOrder.totalAmount,
        createdAt: newOrder.createdAt,
      });
      io.to("admins").emit("newNotification", notificationPayload);
      console.log("📡 Notifications created & socket events emitted to admins");

      // 8. WhatsApp Notifications (Twilio Sandbox) - Parallel Await
      const buyerNumber =
        newOrder.deliveryInfo.contactNumber || req.user.contactNumber;
      const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

      console.log(
        `📡 Preparing WhatsApp Notifications — Buyer: ${buyerNumber}, Admin: ${adminNumber}`,
      );
      console.log(
        "📞 Delivery Info Contact:",
        newOrder.deliveryInfo?.contactNumber,
      );
      console.log("👤 User Contact:", req.user?.contactNumber);
      console.log("📦 Order Number:", newOrder.orderNumber);

      const whatsappPromises = [];

      if (buyerNumber) {
        const buyerMsg = WHATSAPP_TEMPLATES.ORDER_PLACED(newOrder);
        console.log(
          "📝 Buyer Message Created:",
          buyerMsg.substring(0, 100) + "...",
        );
        console.log("📤 Sending Buyer WhatsApp Message...");
        whatsappPromises.push(
          sendWhatsAppMessage(buyerNumber, buyerMsg)
            .then((response) => {
              console.log("✅ Buyer WhatsApp Message Sent Successfully!");
              console.log("🧾 Message SID:", response.sid);
              return response;
            })
            .catch((err) => {
              console.error(
                "❌ WhatsApp Notification Failed (Buyer):",
                err.message,
              );
              console.error("🔍 Full Error:", err);
              throw err;
            }),
        );
      } else {
        console.log(
          "⚠️ No buyer phone number available - skipping customer WhatsApp",
        );
      }

      if (adminNumber) {
        const adminMsg = WHATSAPP_TEMPLATES.ADMIN_NEW_ORDER(
          newOrder,
          req.user.fullName,
        );
        console.log(`📡 Sending WhatsApp to admin: ${adminNumber}`);
        console.log(
          "📋 Admin message preview:",
          adminMsg.substring(0, 200) + "...",
        );
        whatsappPromises.push(
          sendWhatsAppMessage(adminNumber, adminMsg).catch((err) =>
            console.error(
              "❌ WhatsApp Notification Failed (Admin):",
              err.message,
            ),
          ),
        );
      }

      if (whatsappPromises.length > 0) {
        await Promise.all(whatsappPromises);
        console.log("📡 WhatsApp notification requests processed (awaited)");
      }
    } catch (notifError) {
      // Non-blocking: notification failure should not break order creation
      console.error("Failed to create/emit notifications:", notifError.message);
    }

    // 7. Clean up DB cart if it exists (best effort, non-blocking)
    try {
      await Cart.deleteOne({ user: userId });
    } catch (e) {
      // Ignore - cart cleanup is not critical
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * @desc    Get current user's orders
 * @route   GET /api/orders/my
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/all
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private (Owner or Admin)
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "fullName email",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ownership/Admin check
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * @desc    Approve order and decrement stock (with Transaction)
 * @route   PATCH /api/orders/:id/approve
 * @access  Private/Admin
 */
export const approveOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { deliveryDate, adminNotes } = req.body;

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    // 1. Status Transition Guard & Optimistic UI check
    if (order.status !== ORDER_STATUS.PENDING) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: `Cannot approve order with status: ${order.status}` });
    }

    // 2. Stock Re-validation and Atomic Decrement
    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);

      if (!product || product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}. Order cannot be approved.`,
        });
      }

      // Decrement stock
      product.stock -= item.quantity;
      await product.save({ session });
    }

    // 3. Update Order Status
    const previousStatus = order.status;
    order.status = ORDER_STATUS.APPROVED;
    order.deliveryDate = deliveryDate;
    order.adminNotes = adminNotes;

    order.statusHistory.push({
      status: ORDER_STATUS.APPROVED,
      updatedBy: req.user._id,
    });

    await order.save({ session });

    await session.commitTransaction();

    // Create persistent notification for the buyer & emit socket event
    try {
      const buyerNotification = await Notification.create({
        user: order.user,
        type: "ORDER_APPROVED",
        message: `Your order #${order.orderNumber} has been approved! Expected delivery: ${deliveryDate ? new Date(deliveryDate).toLocaleDateString() : "TBD"}`,
        orderId: order._id,
        orderNumber: order.orderNumber,
      });

      io.to(order.user.toString()).emit("newNotification", {
        type: "ORDER_APPROVED",
        message: buyerNotification.message,
        orderId: order._id,
        orderNumber: order.orderNumber,
      });

      io.to(order.user.toString()).emit("orderStatusUpdate", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        newStatus: ORDER_STATUS.APPROVED,
        deliveryDate: order.deliveryDate,
        adminNotes: order.adminNotes,
      });

      console.log(`📡 Approval notification sent to buyer: ${order.user}`);

      // 4. WhatsApp Notification (Buyer)
      const buyerNumber = order.deliveryInfo.contactNumber;
      if (buyerNumber) {
        const approvalMsg = WHATSAPP_TEMPLATES.ORDER_APPROVED(order);
        await sendWhatsAppMessage(buyerNumber, approvalMsg).catch((err) =>
          console.error("WhatsApp Async Error (Approval):", err.message),
        );
      }
    } catch (notifError) {
      console.error(
        "Failed to create/emit buyer notification:",
        notifError.message,
      );
    }

    res.status(200).json({
      success: true,
      message: "Order approved and stock updated",
      order,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Error in approveOrder:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Update order status (Reject, Deliver, etc.)
 * @route   PATCH /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Status Transition Guard
    const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${order.status} to ${status}`,
      });
    }

    // If manual cancellation by user (optional extension)
    // Check ownership here if you allow user to cancel

    order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;

    order.statusHistory.push({
      status,
      updatedBy: req.user._id,
    });

    await order.save();

    // 🟢 WhatsApp Notifications for Customer
    const buyerNumber = order.deliveryInfo.contactNumber;
    if (buyerNumber) {
      let customerMessage;

      switch (status) {
        case ORDER_STATUS.APPROVED:
          customerMessage = WHATSAPP_TEMPLATES.ORDER_APPROVED(order);
          break;
        case ORDER_STATUS.REJECTED:
          customerMessage = WHATSAPP_TEMPLATES.ORDER_REJECTED(order);
          break;
        case ORDER_STATUS.OUT_FOR_DELIVERY:
          customerMessage = WHATSAPP_TEMPLATES.ORDER_OUT_FOR_DELIVERY(order);
          break;
        case ORDER_STATUS.DELIVERED:
          customerMessage = WHATSAPP_TEMPLATES.ORDER_DELIVERED(order);
          break;
        case ORDER_STATUS.CANCELLED:
          customerMessage = WHATSAPP_TEMPLATES.ORDER_CANCELLED_CUSTOMER(order);
          break;
        default:
          customerMessage = null;
      }

      if (customerMessage) {
        await sendWhatsAppMessage(buyerNumber, customerMessage).catch((err) =>
          console.error(`WhatsApp Async Error (${status}):`, err.message),
        );
        console.log(
          `📡 WhatsApp notification sent to customer for status: ${status}`,
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * @desc    Cancel order (Customer Side)
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private (Owner only)
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ownership Check
    if (order.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // Status Check: Can only cancel if Pending
    if (order.status !== ORDER_STATUS.PENDING) {
      return res.status(400).json({
        message: `Cannot cancel order in ${order.status} status.`,
      });
    }

    order.status = ORDER_STATUS.CANCELLED;
    order.statusHistory.push({
      status: ORDER_STATUS.CANCELLED,
      updatedBy: userId,
    });

    await order.save();

    // 1️⃣ Create Admin Notifications in Database
    try {
      const admins = await User.find({ role: "admin" });

      await Notification.insertMany(
        admins.map((admin) => ({
          user: admin._id,
          title: "Order Cancelled",
          message: `Order ${order.orderNumber} was cancelled by the buyer.`,
          type: "ORDER_CANCELLED",
          orderId: order._id, // Using orderId as per existing schema (notification.model.js uses orderId, not referenceId)
          orderNumber: order.orderNumber,
        })),
      );

      // 2️⃣ Emit Real-Time Socket Event to Admin Room
      io.to("admins").emit("newNotification", {
        type: "ORDER_CANCELLED",
        orderId: order._id,
        orderNumber: order.orderNumber,
        message: `Order ${order.orderNumber} was cancelled by the buyer.`,
      });
      console.log("📡 Cancellation notification sent to all admins.");

      // 3. WhatsApp Notifications

      // 3a. WhatsApp Notification to Admin
      const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
      if (adminNumber) {
        // We need the buyer's name for the admin template
        const buyer = await User.findById(order.user).select("fullName");
        const cancelMsg = WHATSAPP_TEMPLATES.ORDER_CANCELLED_ADMIN(
          order,
          buyer?.fullName || "Buyer",
        );
        await sendWhatsAppMessage(adminNumber, cancelMsg).catch((err) =>
          console.error("WhatsApp Async Error (Cancellation):", err.message),
        );
      }

      // 3b. WhatsApp Notification to Customer
      const buyerNumber = order.deliveryInfo.contactNumber;
      if (buyerNumber) {
        const customerCancelMsg =
          WHATSAPP_TEMPLATES.ORDER_CANCELLED_CUSTOMER(order);
        await sendWhatsAppMessage(buyerNumber, customerCancelMsg).catch((err) =>
          console.error(
            "WhatsApp Async Error (Customer Cancellation):",
            err.message,
          ),
        );
        console.log(
          "📡 WhatsApp notification sent to customer for order cancellation",
        );
      }
    } catch (notifError) {
      console.error(
        "Failed to create/emit cancellation notification:",
        notifError.message,
      );
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * @desc    Validate delivery address range
 * @route   POST /api/orders/validate-delivery
 * @access  Private
 */
export const validateDelivery = async (req, res) => {
  try {
    const { address, pincode, coordinates: payloadCoordinates } = req.body;

    const trimmedAddress = address ? address.trim() : "";
    const trimmedPincode = pincode ? pincode.trim() : "";

    if (trimmedPincode && !/^\d{6}$/.test(trimmedPincode)) {
      return res.status(400).json({
        message:
          "Please enter a valid 6-digit pincode for delivery verification.",
      });
    }

    let coordinates = null;

    // Address is now required - prioritize it over coordinates
    if (!trimmedAddress) {
      return res.status(400).json({
        message: "Delivery address is required.",
      });
    }

    // Use coordinates if provided, otherwise geocode from address
    if (
      payloadCoordinates &&
      payloadCoordinates.lat != null &&
      payloadCoordinates.lng != null
    ) {
      coordinates = {
        lat: Number(payloadCoordinates.lat),
        lng: Number(payloadCoordinates.lng),
      };
    } else {
      // Geocode from address
      const resolveQuery = trimmedPincode
        ? `${trimmedAddress}, ${trimmedPincode}`
        : trimmedAddress;

      console.log(`validateDelivery: Resolving for address: "${resolveQuery}"`);
      coordinates = await getCoordinatesFromAddress(resolveQuery);
    }

    const radiusCheck = isWithinDeliveryRadius(
      coordinates.lat,
      coordinates.lng,
    );

    console.log(
      `📏 Validation Result: Distance ${radiusCheck.distance}km, Within: ${radiusCheck.isWithin}`,
    );

    if (!radiusCheck.isWithin) {
      return res.status(400).json({
        message: `Delivery location is out of range (${radiusCheck.distance}km). Max allowed is ${DELIVERY_CONFIG.MAX_RADIUS_KM}km.`,
        distance: radiusCheck.distance,
        isWithin: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Location verified for delivery",
      distance: radiusCheck.distance,
      isWithin: true,
      coordinates,
    });
  } catch (error) {
    console.error("❌ validateDelivery Error:", error.message);
    return res.status(400).json({
      message: error.message || "Address validation failed",
    });
  }
};
