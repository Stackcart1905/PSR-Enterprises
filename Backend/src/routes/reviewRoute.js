import { addReview, getProductReview, updateReview, deleteReview } from "../controllers/review.controller.js";
import express from "express";
import protectRoute from "../middleware/authmiddleware.js";

const router = express.Router();

// Public route to get reviews
router.get("/:productId", getProductReview);

// Protected routes (any logged-in user)
router.post("/:productId", protectRoute, addReview);
router.put("/:reviewId", protectRoute, updateReview);
router.delete("/:reviewId", protectRoute, deleteReview);

export default router;
