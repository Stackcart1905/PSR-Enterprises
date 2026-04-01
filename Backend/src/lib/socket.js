import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://www.swaadbhog.com",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  },
});

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Unauthorized - No Token Provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return next(new Error("Unauthorized - Invalid Token"));

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return next(new Error("User Not Found"));

    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket Auth Error:", error);
    next(new Error("Internal Server Error"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user._id.toString();
  const userRole = socket.user.role;

  if (userId) userSocketMap[userId] = socket.id;

  // If user is admin, join the admins room
  if (userRole === "admin") {
    socket.join("admins");
    console.log(`Admin joined: ${userId}`);
  }

  // All users (especially buyers) join a personal room for targeted notifications
  socket.join(userId);
  console.log(`User ${userId} (${userRole}) joined personal room`);

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
  });
});

export { io, app, server };
