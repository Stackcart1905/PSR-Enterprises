import Cart from  "../models/cartSchema.model.js"
import Product from "../models/productSchema.js";

// add product to cart 

const addToCart = async(req , res) => {
    try {
        const {userId} = req.params ; 

        const {productId , quantity} = req.body ; 

        if(!productId  ) {
            return res.status(400).json({success : false , message : "Please provide productId "}) ; 
        } ; 
        if(quantity < 1 ) {
            return res.status(400).json({success : false , message : "Quantity should be at least 1"}) ; 
        }
        // check if product exists 

        const product = await Product.findById(productId) ;
        if(!product) {
            return res.status(404).json({success : false , message : "Product not found"}) ; 
        } ; 
        // find cart for user 

        let cart = await Cart.findOne({user : userId}) ; 
        if(!cart) {
            // create new cart 
             cart = new Cart({
                user : userId , 
                products : [{product : productId , quantity : quantity || 1}] , 
            })
        } else {
            // check if product already exist in cart 
            const existingProduct  = cart.products.find((item) => item.product.toString() === productId) ; 
            
            if(existingProduct) { 
            existingProduct.quantity += quantity || 1 ; 
            }else {
                cart.products.push({
                    product : productId , 
                    quantity : quantity || 1 
                }) ; 
            }

        }
        await cart.save() ; 

        res.status(200).json(cart)
    }

    catch(error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// get user cart 

const getCart = async(req,res) => {
    try {
        const {userId} = req.params ; 

        const cart = await Cart.findOne({user : userId}).populate("products.product") ; 

        if(!cart) {
            return res.status(404).json({
                success : false ,
                message : "Cart not found" , 
            }) ; 
        } ; 

        res.status(200).json(cart)
    }catch(error) {
        console.error("Error getting cart:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// update cart item quantity 
const updateCartItem = async(req , res) => {
    try {
        const {userId , productId} = req.params ; 
        const {quantity} = req.body ; 

        let cart = await Cart.findOne({user : userId})  ; 

        if(!cart) {
            return res.status(404).json({success : false , message : "Cart not found"}) ; 
        }

        const item = cart.products.find((item) => item.product.toString() == productId ) ; 

        if(!item) {
            return res.status(404).json({message : "Product not found in cart"}) ; 
        } ; 

        if(quantity <= 0) {
            // remove product from cart 

            cart.products = cart.products.filter((item) => item.product.toString() !== productId ) ; 
        }else {
            item.quantity = quantity ; 
        }
        await cart.save() ; 

        res.status(200).json(cart) ; 
    }catch(error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// remove item from cart 

const removeFromCart = async(req , res) => {
     try {
        const {userId , productId} =  req.params ; 

        let cart = await Cart.findOne({user : userId}) ; 

        if(!cart) {
            return res.status(404).json({message : "Cart not found"}) ; 
        }

        cart.products = cart.products.filter((item) => item.product.toString() !== productId) ;
        
        await cart.save() ; 
        res.status(200).json(cart) ; 
     }catch(error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" }); 
     }
}

// clear cart 

const clearCart = async(req , res) => {
    try {
        const {userId} = req.params  ; 

        let cart = await Cart.findOne({user : userId}) ; 

        if(!cart) {
            return res.status(404).json({
                message : "Cart not found" 
            }); 
        }

        cart.products = [] ; 
        await cart.save() ; 

        return res.status(200).json({
            message : "Cart cleared successfully" ,
            cart : cart , 
        })
    }catch(error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" }); 
    }
}


export {addToCart , getCart , updateCartItem , removeFromCart , clearCart} ;
