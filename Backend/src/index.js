import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import authRoutes from "./routes/authRoute.js";
import blogRoutes from "./routes/blogRoute.js";
import contactRoute from "./routes/contactRoute.js";
import productRoute from "./routes/productRoute.js";
import cartRoute from "./routes/cartRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import userRoute from "./routes/userRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import notificationRoutes from "./routes/notificationRoute.js";

const PORT = process.env.PORT || 3000;

// 1. CORS Middleware (Must be before other middlewares)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://www.swaadbhog.com",
      "https://www.psrenterprises.store",
    ],
    credentials: true,
  }),
);

// 2. Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/contact", contactRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/users", userRoute);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);

// Test WhatsApp endpoint
app.post("/api/test-whatsapp", async (req, res) => {
  try {
    const { sendWhatsAppMessage } =
      await import("./services/whatsappService.js");
    const { phoneNumber, message } = req.body;

    console.log("🧪 Testing WhatsApp Message...");
    console.log("📞 Phone Number:", phoneNumber);
    console.log("📝 Message:", message);

    const response = await sendWhatsAppMessage(phoneNumber, message);

    console.log("✅ Test Message Sent Successfully!");
    console.log("🧾 Message SID:", response.sid);

    res.status(200).json({
      success: true,
      message: "Test WhatsApp message sent successfully",
      sid: response.sid,
      status: response.status,
    });
  } catch (error) {
    console.error("❌ Test WhatsApp Failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test WhatsApp message",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Swaadbhog Mewa Traders" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
