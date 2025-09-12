import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true, // index for faster search
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,  
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    categories: {
      type: String,
      required: true,
      index: true, 
    },
    tags: [
      {
        type: String,
        trim: true,
        index: true, 
      },
    ],
  },
  { timestamps: true }
);

productSchema.index({ name: "text", categories: "text", tags: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
