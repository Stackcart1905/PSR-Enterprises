import Review from "../models/reviewSchema.js" ; 
import Product from "../models/productSchema.js" ; 

// add review 

const addReview = async (req , res) => {
    try {
        const {rating , comment } = req.body ; 
        
        const {productId} = req.params ; 

        const userId = req.user._id ; 

        if(rating === undefined || rating < 1 || rating > 5) {
            return res.status(400).json({
                message : "Rating is required and should be between 1 and 5" , 
            }) ; 
         }  ; 

         const product = await Product.findById(productId) ; 

         if(!product) {
            return res.status(404).json({
                message : "Product not found" ,
            })
         } ; 

         const existingReview = await Review.findOne({user : userId , product : productId}) ; 

         if(existingReview) {
            return res.status(400).json({
                message : "You have already reviewed this product" , 
            })
         } ; 

         // create new review 

         const review = await Review.create({
            user : userId , 
            product : productId , 
            rating : Number(rating) , 
            comment , // if comment is undefined it mongoose will handle it 
         }) ; 

         // update product overall rating 

         const reviews = await Review.find({product : productId}) ; 

         product.numReviews = reviews.length ;

         product.rating = reviews.reduce((acc , item) => item.rating + acc , 0) / reviews.length ; 

         await product.save() ;

         return res.status(201).json({
            success : true , 
            message : "Review added successfully" , 
            review , 
         }) ;
    }catch(error) {
        console.error("Error in addReview: ", error) ; 
        return res.status(500).json({
            success : false , 
            message : "Server Error" , 
            error : error.message , 
        }) ; 
    }
}


// get all review of specific product 

const getProductReview = async (req , res) => {
    try {
        const {productId} = req.params ; 
        // add pagination concept here
        const {page = 1 , limit = 10} = req.query ; 

        const skip = (Number(page) - 1) * Number(limit )  ; 

        // get review with pagination
        const reviews = await Review.find({product : productId}).populate("user", "fullname email").skip(skip).limit(Number(limit)) ; 
        
        // Get total count for pagination info
        const totalReviews = await Review.countDocuments({ product: productId });
        
        const totalPages = Math.ceil(totalReviews / limit);;

        res.status(200).json({
            reviews,
            pagination: {
                totalReviews,
                totalPages,
                currentPage: Number(page),
                pageSize: Number(limit),
            }
        });
    }

    catch(error) {
        console.error("Error in getProductReview: ", error) ; 
        return res.status(500).json({
            success : false , 
            message : "Server Error" , 
        }) ;
    }
}

// update review 

const updateReview = async (req , res) => {
    try {
        const {rating , comment} = req.body ; 

        const {reviewId} = req.params ; 

        const userId = req.user._id ; 
        
        const review = await Review.findById(reviewId) ;

        if(!review) {
            return res.status(404).json({
                success : false , 
                message : "Review not found" , 
            }) ; 
        } ; 

        if(review.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success : false , 
                message : "You are not authorized to update this review" , 
            }) ; 
        } ;

        // update review fields
        review.rating = rating !== undefined ? Number(rating) : review.rating ;

        review.comment = comment !== undefined ? comment : review.comment ;     
        await review.save() ;

        // now recalculate product Schema 

        const product = await Product.findById(review.product) ; 

        const reviews = await Review.find({product : product._id}) ;

        product.rating = reviews.reduce((acc , item) => item.rating + acc , 0) / reviews.length ; 
        await product.save() ;

        return res.status(200).json({
            success : true , 
            message : "Review updated successfully" , 
            review , 
        }) ;
    }catch(error) {
        console.error("Error in updateReview: ", error) ; 
        return res.status(500).json({
            success : false , 
            message : "Server Error" , 
            error : error.message , 
        }) ; 
    } 
}

// delete review 

const deleteReview = async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role; // admin or user but admin can delete any review

    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found." });
        }

        if (review.user.toString() !== userId.toString() && userRole !== 'admin') {
            return res.status(403).json({ message: "Not authorized to delete this review." });
        }

        const productId = review.product;
        await review.deleteOne();

        //  Recalculate product rating after deletion
        const product = await Product.findById(productId);
        const reviews = await Review.find({ product: productId });
        
        if (reviews.length > 0) {
            product.numReviews = reviews.length;
            product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        } else {
            product.numReviews = 0;
            product.rating = 0; // Reset if no reviews are left
        }
        await product.save();

        res.status(200).json({ message: "Review deleted successfully." });

    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: "Server Error: Could not delete review." });
    }
};


export { addReview , getProductReview , updateReview , deleteReview } ;