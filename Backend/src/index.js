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

app.get("/", (req, res) => {
  res.json({ message: "Welcome to PSR Enterprises API" });
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
