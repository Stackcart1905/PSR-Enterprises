import express from 'express';

import { addToCart, getCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cart.controller.js";
import protectRoute from "../middleware/authmiddleware.js";

const router = express.Router();

// add prodcut to cart 

// add product to cart 
router.post("/add", protectRoute, addToCart);

// get cart
router.get("/", protectRoute, getCart);

// update cart item
router.put("/update/:productId", protectRoute, updateCartItem);

// remove item from cart
router.delete("/remove/:productId", protectRoute, removeFromCart);

// clear cart
router.delete("/clear", protectRoute, clearCart);


export default router;