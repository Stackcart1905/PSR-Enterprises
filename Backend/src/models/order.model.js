import mongoose from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS } from "../config/constants.js";

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                image: { type: String },
            },
        ],
        subtotal: {
            type: Number,
            required: true,
        },
        taxAmount: {
            type: Number,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        deliveryInfo: {
            addressText: { type: String, required: true },
            coordinates: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
            },
            contactNumber: { type: String, required: true },
        },
        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PENDING,
            index: true,
        },
        statusHistory: [
            {
                status: { type: String, required: true },
                updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                updatedAt: { type: Date, default: Date.now },
            },
        ],
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING,
        },
        adminNotes: {
            type: String,
        },
        deliveryDate: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Compound index for optimized "my orders" fetching
orderSchema.index({ user: 1, createdAt: -1 });
// General descending order index
orderSchema.index({ createdAt: -1 });

/**
 * Pre-save hook to automatically log the first "Pending" state in statusHistory
 */
orderSchema.pre("save", function (next) {
    if (this.isNew) {
        this.statusHistory.push({
            status: this.status,
            updatedBy: this.user,
        });
    }
    next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
