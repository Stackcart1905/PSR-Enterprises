import Product from "../models/productSchema";
import { cloudinaryUpload, deleteFromCloudinary } from "../lib/cloudinary";
import { updateBlogPost } from "./blog.controllers";

// Create Product
const createProduct = async (req, res) => {
    try {

        const { name, description, price, categories, tags } = req.body;

        const imgList = req.files;

        if (!name || !description || !price || !categories || !imgList || imgList.length === 0) {
            return res.status(400).json({
                message: "All fields are required ",
            });
        }

        // Upload image on Cloudinary 

        const images = [];

        for (const file of imgList) {
            const result = await cloudinaryUpload(file);

            if (result) {
                images.push({
                    url: result.secure_url,
                    public_id: result.public_id,
                })
            }

        }

        const newProduct = new Product({
            name,
            description,
            price,
            images,
            categories,
            tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        });

        await newProduct.save();

        return res.status(201).json({
            message: "Product Created Successfully",
        })
    }

    catch (error) {
        console.log("Server Errior Product Create Controller ", error);
        return res.status(500).json({
            message: "Internal Server Error ",
        })
    }

}


// get Product + search product 

const getProducts = async(req , res) => {
    try {
     const {name , category , minPrice}
        
    } catch (error) {
        
    }
}