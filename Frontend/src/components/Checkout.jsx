import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import api from "../lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    MapPin, Phone, ShoppingBag, Loader2, CheckCircle2,
    AlertCircle, PackageCheck, ArrowRight, ShieldCheck
} from "lucide-react";

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart, isCartLoading } = useCart();
    const navigate = useNavigate();

    // ─── State ─────────────────────────────────────
    const [formData, setFormData] = useState({
        addressText: "",
        contactNumber: "",
        coordinates: null
    });

    const [locationStatus, setLocationStatus] = useState("idle"); // idle | loading | success | error
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [distance, setDistance] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(null); // null | { orderNumber, totalAmount }

    // Ref to prevent double-submit
    const isSubmitLocked = useRef(false);

    // ─── Geocoding Handler ───────────────────────
    const handleVerifyLocation = async () => {
        if (!formData.addressText || formData.addressText.trim().length < 5) {
            setError("Please enter your full delivery address first.");
            return;
        }

        setLocationStatus("loading");
        setError("");

        try {
            console.log(`📡 Verifying address: "${formData.addressText}"`);
            const response = await api.post("/api/orders/validate-delivery", {
                address: formData.addressText.trim()
            });

            if (response.data.success) {
                setFormData(prev => ({
                    ...prev,
                    coordinates: response.data.coordinates
                }));
                setDistance(response.data.distance);
                setLocationStatus("success");
                // Success message or distance can be stored if needed, 
                // but setting status to success is enough for the button.
            }
        } catch (err) {
            setLocationStatus("error");
            const serverMessage = err.response?.data?.message;
            setError(serverMessage || "Could not verify this address. Please try being more specific.");
        }
    };

    // ─── Validation ───────────────────────────────
    const validateBeforeSubmit = () => {
        if (!cartItems || cartItems.length === 0) {
            setError("Your cart is empty. Please add items before placing an order.");
            return false;
        }
        if (!formData.contactNumber || formData.contactNumber.trim().length < 10) {
            setError("Please enter a valid contact number (at least 10 digits).");
            return false;
        }
        if (!formData.addressText || formData.addressText.trim().length < 5) {
            setError("Please enter a valid delivery address.");
            return false;
        }
        if (locationStatus !== "success") {
            setError("Please verify your delivery location before placing the order.");
            return false;
        }
        return true;
    };

    // ─── Controlled Submit Handler ────────────────
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Prevent double-submit
        if (isSubmitLocked.current || isSubmitting) return;

        // Run all validations
        if (!validateBeforeSubmit()) return;

        // Lock submission
        isSubmitLocked.current = true;
        setIsSubmitting(true);
        setError("");

        try {
            // Build cart payload — only IDs and quantities (backend validates prices)
            const cartItemsForOrder = cartItems.map(item => ({
                productId: item.id || item._id,
                quantity: item.quantity
            }));

            console.log("📦 Placing order with", cartItemsForOrder.length, "items:", cartItemsForOrder);

            const response = await api.post("/api/orders", {
                deliveryInfo: {
                    addressText: formData.addressText.trim(),
                    contactNumber: formData.contactNumber.trim(),
                    coordinates: formData.coordinates // Already resolved via handleVerifyLocation
                },
                cartItems: cartItemsForOrder
            });

            if (response.data.success) {
                // ✅ ORDER SUCCESSFUL — Show success state FIRST, then navigate
                const order = response.data.order;
                setOrderSuccess({
                    orderNumber: order.orderNumber,
                    totalAmount: order.totalAmount
                });

                // Clear cart (local + DB) AFTER setting success state
                clearCart();

                console.log("✅ Order placed successfully:", order.orderNumber);
            } else {
                // Unexpected non-success response
                setError(response.data.message || "Something went wrong. Please try again.");
            }
        } catch (err) {
            console.error("Checkout Error:", err);
            const serverMessage = err.response?.data?.message;
            if (serverMessage) {
                setError(serverMessage);
            } else if (err.code === "ERR_NETWORK") {
                setError("Connection failed. Please check if the server is running and try again.");
            } else {
                setError("Failed to place order. Please check your internet connection and try again.");
            }
        } finally {
            setIsSubmitting(false);
            isSubmitLocked.current = false;
        }
    };

    // ─── Loading State ────────────────────────────
    if (isCartLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading your secure checkout...</p>
                </div>
            </div>
        );
    }

    // ─── Empty Cart Guard (only when NOT after a successful order) ─────
    if (!orderSuccess && cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <Card className="max-w-md w-full text-center border-none shadow-xl">
                    <CardContent className="py-12">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
                        <p className="text-gray-500 mb-8">Add some products before proceeding to checkout.</p>
                        <Button
                            onClick={() => navigate("/products")}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-8"
                        >
                            Browse Products
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ─── Success Screen ───────────────────────────
    if (orderSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
                <Card className="max-w-lg w-full text-center border-none shadow-2xl overflow-hidden">
                    {/* Green accent bar */}
                    <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />

                    <CardContent className="py-12 px-8">
                        {/* Animated checkmark */}
                        <div className="relative mx-auto w-24 h-24 mb-6">
                            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
                            <div className="relative flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
                                <PackageCheck className="w-12 h-12 text-green-600" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                            Order Placed Successfully!
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Thank you for shopping with Swaadbhog Mewa Enterprises
                        </p>

                        {/* Order details card */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">Order Number</span>
                                <span className="font-bold text-green-800 text-lg">
                                    {orderSuccess.orderNumber}
                                </span>
                            </div>
                            <div className="border-t border-green-200" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 font-medium">Total Amount</span>
                                <span className="font-bold text-green-800 text-lg">
                                    ₹{Number(orderSuccess.totalAmount).toLocaleString()}
                                </span>
                            </div>
                            <div className="border-t border-green-200" />
                            <div className="flex items-center justify-center space-x-2 text-sm text-green-700">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Payment on Delivery (Cash)</span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-6">
                            We'll notify you once your order is approved and out for delivery.
                        </p>

                        {/* Navigation buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={() => navigate("/orders", { state: { orderSuccess: true } })}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 shadow-lg shadow-green-200"
                            >
                                View My Orders
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/products")}
                                className="flex-1 border-green-300 text-green-700 hover:bg-green-50 font-bold h-12"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ─── Checkout Form ────────────────────────────
    const subtotal = getCartTotal();
    const gst = Number((subtotal * 0.18).toFixed(2));
    const total = Number((subtotal + gst).toFixed(2));

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-2 mb-8">
                    <ShoppingBag className="w-8 h-8 text-green-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* ── Delivery Form ────────────────── */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle>Delivery Information</CardTitle>
                                <CardDescription>Please provide your delivery details and location</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePlaceOrder} className="space-y-4">
                                    {/* Contact Number */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <Phone className="w-4 h-4 mr-2" /> Contact Number
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Enter your phone number"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Delivery Address */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" /> Delivery Address
                                        </label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={formData.addressText}
                                            onChange={(e) => setFormData({ ...formData, addressText: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="House No, Building, Landmark, Area..."
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Location Verification */}
                                    <div className="pt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Delivery Range Check (Max 100km)</p>
                                        <Button
                                            type="button"
                                            variant={locationStatus === "success" ? "outline" : "default"}
                                            onClick={handleVerifyLocation}
                                            disabled={locationStatus === "loading" || isSubmitting}
                                            className={`w-full h-12 flex items-center justify-center space-x-2 ${locationStatus === "success" ? "border-green-500 text-green-600" : ""
                                                }`}
                                        >
                                            {locationStatus === "loading" ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : locationStatus === "success" ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <MapPin className="w-5 h-5" />
                                            )}
                                            <span>
                                                {locationStatus === "loading" ? "Verifying Address..." :
                                                    locationStatus === "success" ? `Verified (${distance} km)` :
                                                        "Verify Delivery Address"}
                                            </span>
                                        </Button>
                                        <p className="text-xs text-gray-500 mt-2 italic">
                                            * We automatically check if your address is within our 100km delivery radius.
                                        </p>
                                    </div>

                                    {/* Error Display */}
                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-in fade-in duration-300">
                                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-red-700">{error}</span>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || locationStatus !== "success"}
                                        className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 transition-all font-bold mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center space-x-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Placing Order...</span>
                                            </div>
                                        ) : (
                                            "Confirm & Place Order"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Order Summary ────────────────── */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-lg bg-white overflow-hidden">
                            <CardHeader className="bg-gray-50 border-b">
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-medium text-gray-900">
                                                ₹{(() => {
                                                    let price = item.price;
                                                    if (typeof price === 'string') {
                                                        price = parseFloat(price.replace('₹', '').replace(/,/g, ''));
                                                    }
                                                    return (price * item.quantity).toLocaleString();
                                                })()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-green-50 space-y-3 border-t">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>GST (18%)</span>
                                        <span>₹{gst.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Charge</span>
                                        <span className="text-green-600 font-medium text-sm px-2 py-0.5 bg-green-100 rounded-full">FREE</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-green-200 uppercase tracking-wider">
                                        <span className="text-xl font-bold text-gray-900">Total</span>
                                        <span className="text-2xl font-black text-green-700">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <p className="font-bold">Payment on Delivery</p>
                                <p>We currently only support Cash on Delivery. Pay safely at your doorstep once the order is approved and delivered.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
