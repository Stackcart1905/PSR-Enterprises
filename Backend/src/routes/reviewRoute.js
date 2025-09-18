import { addReview , getProductReview , updateReview , deleteReview } from "../controllers/review.controller.js";

import express from "express";

import protectRoute from "../middleware/adminMiddleware.js"

const router = express.Router();

router.post("/:productId" , protectRoute , addReview);

router.get("/:productId" , getProductReview);

router.put("/:reviewId" , protectRoute , updateReview);

router.delete("/:reviewId" , protectRoute , deleteReview);

export default router;
