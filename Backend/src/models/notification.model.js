import mongoose from "mongoose";

/**
 * Notification Model
 * Stores persistent notifications for both admins and buyers.
 * Types: ORDER_PLACED (for admins), ORDER_APPROVED (for buyers)
 */
const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["ORDER_PLACED", "ORDER_APPROVED", "ORDER_REJECTED", "ORDER_DELIVERED", "ORDER_CANCELLED"],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        orderNumber: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Index for efficient fetching: user's unread notifications first, newest first
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// TTL index: auto-remove notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
