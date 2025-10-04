import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import protectRoute from "../middleware/authmiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import uploadMiddleware from "../middleware/multerMiddleware.js";

const router = express.Router();

router.post("/", protectRoute, adminMiddleware, uploadMiddleware.array("images", 5), createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.patch("/:id", protectRoute, adminMiddleware, uploadMiddleware.array("images"), updateProduct);
router.delete("/:id", protectRoute, adminMiddleware, deleteProduct);

export default router;
