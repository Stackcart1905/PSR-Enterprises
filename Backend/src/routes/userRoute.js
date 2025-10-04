import express from "express";
import protectRoute from "../middleware/authmiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { listUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminMiddleware, listUsers);

export default router;


