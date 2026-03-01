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
      type,
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

    // Validation
    if (!name || !price || !category || !type || stock === undefined) {
      return res.status(400).json({ message: "Name, price, category, type, and stock are required." });
    }

    if (!["dry-fruit", "grocery"].includes(type)) {
      return res.status(400).json({ message: "Invalid product type. Must be 'dry-fruit' or 'grocery'." });
    }

    // Image Validation (1 to 5 images)
    if (!imgList || imgList.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    if (imgList.length > 5) {
      return res.status(400).json({ message: "Maximum 5 images allowed." });
    }

    // Concurrent Upload using Promise.all()
    let uploadedImages;
    try {
      uploadedImages = await Promise.all(
        imgList.map(file => cloudinaryUpload(file))
      );
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      return res.status(500).json({ message: "Image upload failed. Product not created." });
    }

    // Filter out any failed uploads (though cloudinaryUpload usually returns result or throws)
    const images = uploadedImages
      .filter(result => result)
      .map(result => ({
        url: result.secure_url,
        public_id: result.public_id,
      }));

    if (images.length === 0) {
      return res.status(500).json({ message: "No images were successfully uploaded." });
    }

    const newProduct = new Product({
      name,
      description: description || "",
      price,
      originalPrice,
      category,
      type,
      stock,
      ingredients,
      benefits,
      origin,
      shelfLife,
      storage,
      certifications,
      nutritionFacts: (typeof nutritionFacts === 'string' && nutritionFacts) ? JSON.parse(nutritionFacts) : (nutritionFacts || {}),
      images,
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//!  GetAllProduct
const getProducts = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};

    if (type) {
      if (!["dry-fruit", "grocery"].includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid product type filter" });
      }
      filter.type = type;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

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

    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return res.status(400).json({ message: "Maximum 5 images allowed." });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        await Promise.all(
          product.images.map(img => deleteFromCloudinary(img.public_id))
        );
      }

      // Upload new images concurrently
      const uploadedImages = await Promise.all(
        req.files.map(file => cloudinaryUpload(file))
      );

      updates.images = uploadedImages
        .filter(result => result)
        .map(result => ({
          url: result.secure_url,
          public_id: result.public_id
        }));
    }

    if (updates.type) {
      if (!["dry-fruit", "grocery"].includes(updates.type)) {
        return res.status(400).json({ message: "Invalid product type." });
      }
    }

    if (updates.nutritionFacts) {
      updates.nutritionFacts = JSON.parse(updates.nutritionFacts);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
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
