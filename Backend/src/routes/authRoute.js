import express from "express";
import rateLimit from "express-rate-limit";
import {
  signin,
  signup,
  logout,
  checkAuth,
  verifyOtp,
  resendOtp,
  forgetPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/authmiddleware.js";
import { changePassword } from "../controllers/auth.controller.js";

const router = express.Router();

//!   global rate limiter for OTP routes (per IP)
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min window
  max: 3, // limit each IP to 5 requests per minute
  message: {
    success: false,
    message: "Too many OTP requests, try again later.",
  },
});

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);

router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", otpLimiter, resendOtp);

router.post("/forgetPassword", otpLimiter, forgetPassword);
router.post("/resetPassword", otpLimiter, resetPassword);

router.get("/checkAuth", protectRoute, checkAuth);
router.post("/change-password", protectRoute, changePassword);

export default router;
