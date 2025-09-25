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
    numReviews: {
      type: Number,
      default: 0,
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100, // percentage discount
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
    stock: {
      type: Number,
      required: true,
      min: 0, // stock can not be negative
      default: 0,
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

productSchema.index({
  name: "text",
  categories: "text",
  tags: "text",
  companyName: "text",
});

const Product = mongoose.model("Product", productSchema);

export default Product;
