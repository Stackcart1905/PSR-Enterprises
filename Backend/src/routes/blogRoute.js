import express from "express" ; 
import {  getAllBlog,getBlogById,createBlogPost,updateBlogPost,deleteBlogPost } from "../controllers/blog.controllers.js" ; 
import protectRoute from "../middleware/authmiddleware.js" ;
import uploadMiddleware from "../middleware/multerMiddleware.js";



const router = express.Router() ;

router.get("/", getAllBlog);
router.get("/:id", protectRoute ,  getBlogById);
router.post("/", protectRoute ,uploadMiddleware.single("coverImage") ,  createBlogPost);
router.patch("/:id", protectRoute ,uploadMiddleware.single("coverImage") ,  updateBlogPost);
router.delete("/:id", protectRoute , deleteBlogPost);


export default router;


