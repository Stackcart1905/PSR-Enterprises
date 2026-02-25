import express from "express";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from "../controllers/notification.controller.js";
import protectRoute from "../middleware/authmiddleware.js";

const router = express.Router();

/**
 * All notification routes require authentication.
 * Users can only access their own notifications (enforced in controller).
 */
router.get("/", protectRoute, getNotifications);
router.patch("/read-all", protectRoute, markAllAsRead);
router.patch("/:id/read", protectRoute, markAsRead);

export default router;
