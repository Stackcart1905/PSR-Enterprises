import express from "express";
import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import protectRoute from "../middleware/authmiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import uploadMiddleware from "../middleware/multerMiddleware.js";

const router = express.Router();

router.post("/", uploadMiddleware.array("images"), createProduct);
router.get("/:id", getProductById);
router.get("/", getProducts);
router.patch(
  "/:id",
  protectRoute,
  adminMiddleware,
  uploadMiddleware.array("images"),
  updateProduct
);
router.delete("/:id", protectRoute, adminMiddleware, deleteProduct);

export default router;
