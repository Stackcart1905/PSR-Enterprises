import express from "express";
import {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    approveOrder,
    updateOrderStatus,
    cancelOrder,
    validateDelivery
} from "../controllers/orderController.js";
import protectRoute from "../middleware/authmiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * Customer Routes
 */
router.post("/", protectRoute, createOrder);
router.post("/validate-delivery", protectRoute, validateDelivery);
router.get("/my", protectRoute, getMyOrders);
router.get("/:id", protectRoute, getOrderById);
router.patch("/:id/cancel", protectRoute, cancelOrder);

/**
 * Admin Routes
 */
router.get("/admin/all", protectRoute, adminMiddleware, getAllOrders);
router.patch("/:id/approve", protectRoute, adminMiddleware, approveOrder);
router.patch("/:id/status", protectRoute, adminMiddleware, updateOrderStatus);

export default router;
