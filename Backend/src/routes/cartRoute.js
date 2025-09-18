import express from 'express' ;

import { addToCart , getCart , updateCartItem , removeFromCart , clearCart } from "../controllers/cart.controller.js" ; 
import protectRoute from "../middleware/authmiddleware.js" ; 

const router = express.Router() ; 

// add prodcut to cart 

router.post("/:userId/add", protectRoute, addToCart);

// get cart
router.get("/:userId", protectRoute, getCart);
// update cart item
router.put("/:userId/update/:productId", protectRoute, updateCartItem);
// remove item from cart
router.delete("/:userId/remove/:productId", protectRoute, removeFromCart) ;
// clear cart
router.delete("/:userId/clear" ,protectRoute , clearCart) ;


export default router ;