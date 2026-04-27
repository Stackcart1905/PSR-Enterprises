/**
 * WhatsApp Message Templates for Order Lifecycle
 */
export const WHATSAPP_TEMPLATES = {
  ORDER_PLACED: (order) =>
    `
🛒 *Order Placed Successfully!*

*Order ID:* ${order.orderNumber}
*Total:* ₹${order.totalAmount.toLocaleString()}
*Status:* Pending Approval

We have received your order and will notify you once it is approved by the admin. 
Thank you for shopping with Swaadhbog Mewa Enterprises!
    `.trim(),

  ADMIN_NEW_ORDER: (order, customerName) => {
    // Format order items list
    const itemsList = order.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} × ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString()}`,
      )
      .join("\n   ");

    // Format delivery address
    const deliveryAddress =
      order.deliveryInfo?.addressText || "No address provided";
    const contactNumber =
      order.deliveryInfo?.contactNumber || "No contact provided";
    const coordinates = order.deliveryInfo?.coordinates
      ? `${order.deliveryInfo.coordinates.lat.toFixed(6)}, ${order.deliveryInfo.coordinates.lng.toFixed(6)}`
      : "Address-based delivery";

    return `
🔔 *NEW ORDER RECEIVED* 🛒

👤 *CUSTOMER DETAILS:*
   • Name: ${customerName}
   • Phone: ${contactNumber}

📍 *DELIVERY ADDRESS:*
   • ${deliveryAddress}
   • Coordinates: ${coordinates}

📦 *ORDER ITEMS:*
   ${itemsList}

💰 *ORDER SUMMARY:*
   • Subtotal: ₹${(order.subtotal || 0).toLocaleString()}
   • GST (18%): ₹${(order.taxAmount || 0).toLocaleString()}
   • Delivery Fee: ₹${(order.deliveryFee || 0).toLocaleString()}
   • Total: ₹${order.totalAmount.toLocaleString()}

🆔 *Order ID:* ${order.orderNumber}
⏰ *Time:* ${new Date(order.createdAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })}

Please log in to the dashboard to review and approve this order.
        
${(() => {
  // Generate Google Maps link for the location
  if (
    order.deliveryInfo?.coordinates?.lat &&
    order.deliveryInfo?.coordinates?.lng
  ) {
    return `\n\n*View Location:* https://www.google.com/maps?q=${order.deliveryInfo.coordinates.lat},${order.deliveryInfo.coordinates.lng}`;
  } else if (deliveryAddress && deliveryAddress !== "No address provided") {
    // Use address for Google Maps search if no coordinates
    const encodedAddress = encodeURIComponent(deliveryAddress);
    return `\n\n*View Location:* https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  }
  return "";
})()}`.trim();
  },

  ORDER_APPROVED: (order) =>
    `
✅ *Order Approved!*

*Order ID:* ${order.orderNumber}
*Expected Delivery:* ${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "TBD"}

Your order has been approved and is being prepared for dispatch.
    `.trim(),

  ORDER_REJECTED: (order) =>
    `
❌ *Order Rejected*

*Order ID:* ${order.orderNumber}

Unfortunately, your order could not be accepted at this time. Please contact our support team for more details.
    `.trim(),

  ORDER_CANCELLED_ADMIN: (order, customerName) =>
    `
⚠️ *Order Cancelled by Buyer*

*Order ID:* ${order.orderNumber}
*Customer:* ${customerName}

The buyer has cancelled this order. Please check the dashboard for details.
    `.trim(),

  ORDER_DELIVERED: (order) =>
    `
🎉 *Order Delivered Successfully!*

*Order ID:* ${order.orderNumber}
*Total:* ₹${order.totalAmount.toLocaleString()}

Your order has been delivered! Thank you for shopping with Swaadhbog Mewa Enterprises.
We hope you enjoy your purchase. Please leave a review on our website!

📞 *Need Help?* Contact us for any issues with your order.
    `.trim(),

  ORDER_CANCELLED_CUSTOMER: (order) =>
    `
⚠️ *Order Cancelled*

*Order ID:* ${order.orderNumber}
*Refund Amount:* ₹${order.totalAmount.toLocaleString()}

Your order has been cancelled as requested. If you paid online, your refund will be processed within 5-7 business days.

Thank you for your understanding.
    `.trim(),

  ORDER_OUT_FOR_DELIVERY: (order) =>
    `
🚚 *Order Out for Delivery!*

*Order ID:* ${order.orderNumber}
*Delivery Address:* ${order.deliveryInfo?.addressText || "Address on file"}

Great news! Your order is on the way and will be delivered soon.
Please keep your phone handy for delivery calls.

📞 *Contact:* Call us if you have any delivery instructions.
    `.trim(),
};
