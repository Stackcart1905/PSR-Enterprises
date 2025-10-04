import Product from "../models/productSchema.js";
import { cloudinaryUpload, deleteFromCloudinary } from "../lib/cloudinary.js";

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      stock,
      ingredients,
      benefits,
      origin,
      shelfLife,
      storage,
      certifications,
      nutritionFacts,
    } = req.body;

    const imgList = req.files;

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !stock ||
      !imgList ||
      imgList.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "All required fields are missing" });
    }

    // Upload images to Cloudinary
    const images = [];
    for (const file of imgList) {
      const result = await cloudinaryUpload(file);
      if (result) {
        images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    const newProduct = new Product({
      name,
      description,
      price,
      originalPrice,
      category,
      stock,
      ingredients,
      benefits,
      origin,
      shelfLife,
      storage,
      certifications,
      nutritionFacts: nutritionFacts ? JSON.parse(nutritionFacts) : {},
      images,
    });

    await newProduct.save();

    return res
      .status(201)
      .json({
        success: true,
        message: "Product created successfully",
        product: newProduct,
      });
  } catch (error) {
    console.error("Error creating product:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

//!  GetAllProduct
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

//! Get Product By ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

//! Update Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    let images;
    if (req.files && req.files.length > 0) {
      const product = await Product.findById(id);
      for (const img of product.images) {
        await deleteFromCloudinary(img.public_id);
      }

      images = [];
      for (const file of req.files) {
        const result = await cloudinaryUpload(file);
        if (result) {
          images.push({ url: result.secure_url, public_id: result.public_id });
        }
      }
      updates.images = images;
    }

    if (updates.nutritionFacts) {
      updates.nutritionFacts = JSON.parse(updates.nutritionFacts);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

//! Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    for (const img of product.images) {
      await deleteFromCloudinary(img.public_id);
    }

    await Product.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
