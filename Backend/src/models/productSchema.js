import mongoose from "mongoose";

const nutritionFactsSchema = new mongoose.Schema({
  energy: { type: String, default: "" },
  protein: { type: String, default: "" },
  totalFat: { type: String, default: "" },
  carbohydrates: { type: String, default: "" },
  fiber: { type: String, default: "" },
  sugar: { type: String, default: "" },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
     category: {
      type: String,
      enum: [
        "Nuts",
        "DriedFruits",
        "Seeds",
        "Berries",
        "Dates",
        "Mixed",
        "Premium",
        "organic",
      ],
      required:true
    },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: 0 }, // for discount calculation
    stock: { type: Number, required: true, default: 0 },
    description: { type: String, required: true, trim: true },
    ingredients: { type: String, default: "" },
    benefits: { type: String, default: "" },
    origin: { type: String, default: "" },
    shelfLife: { type: String, default: "" },
    storage: { type: String, default: "" },
    certifications: { type: String, default: "" },
    nutritionFacts: nutritionFactsSchema,
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],

    discount: { type: Number, default: 0, min: 0, max: 100 },

    tags: [{ type: String, trim: true }],
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
