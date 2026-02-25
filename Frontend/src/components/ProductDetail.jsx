import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../contexts/ProductContext";
import { useCart } from "../contexts/CartContext";
import useAuthStore from "../store/authStore";
import { useReviewStore } from "../store/reviewStore";
import StarRating from "./StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Info,
  Package,
  Leaf,
  Award,
  MessageSquare,
  Clock,
  User,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById } = useProducts();
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuthStore();
  const { reviews, isLoading: reviewsLoading, getProductReviews, addReview } = useReviewStore();

  const product = getProductById(id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [isFavorite, setIsFavorite] = useState(false);

  // Review form state
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const images =
    product?.images && product.images.length > 0
      ? product.images.map(img => img.url || img)
      : product?.image
        ? [product.image]
        : [];

  useEffect(() => {
    if (product) {
      getProductReviews(product._id || product.id);
    } else {
      // If product not found in context (might be fresh reload), 
      // ideally we should fetch it, but keeping existing logic 
      // which navigates back if not found in context.
      // navigate("/products");
    }
  }, [product, getProductReviews]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Handle Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (newReview.rating === 0) {
      setSubmitError("Please select a rating");
      return;
    }
    if (!newReview.comment.trim()) {
      setSubmitError("Please write a comment");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await addReview(product._id || product.id, newReview);
      setNewReview({ rating: 0, comment: "" });
      // The store updates local state, but we might want to refetch to get updated product rating
      // However, product data usually comes from a different context in this app.
    } catch (err) {
      setSubmitError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const getItemQuantityInCart = (productId) => {
    const item = cartItems.find((item) => item.id === (product._id || product.id));
    return item ? item.quantity : 0;
  };

  const currentQuantity = getItemQuantityInCart(product._id || product.id);

  const handleAddToCart = () => {
    if (currentQuantity === 0) {
      addToCart(product);
    } else {
      updateQuantity(product._id || product.id, currentQuantity + 1);
    }
  };

  const handleIncreaseQuantity = () => {
    updateQuantity(product._id || product.id, currentQuantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (currentQuantity > 1) {
      updateQuantity(product._id || product.id, currentQuantity - 1);
    } else if (currentQuantity === 1) {
      removeFromCart(product._id || product.id);
    }
  };

  const parsePrice = (price) => {
    if (typeof price === "string") {
      return parseFloat(price.replace("₹", "").replace(",", ""));
    }
    return price;
  };

  const productPrice = parsePrice(product.price);
  const originalPrice = product.originalPrice ? parsePrice(product.originalPrice) : null;
  const discount = originalPrice ? Math.round((1 - productPrice / originalPrice) * 100) : 0;

  // Use the new Rating logic with fallback
  const averageRating = product.averageRating || product.ratings || 0;
  const numReviews = product.numReviews || 0;

  const productDetails = {
    ingredients: product.ingredients ? product.ingredients.split(',').map(i => i.trim()) : [
      "Premium Ingredients", "Natural preservatives", "No artificial colors", "No added sugar"
    ],
    nutritionFacts: product.nutritionFacts || {
      Energy: "570 kcal",
      Protein: "21g",
      "Total Fat": "50g",
      Carbohydrates: "22g",
      Fiber: "12g",
      Sugar: "4g",
    },
    benefits: product.benefits ? product.benefits.split('.').filter(b => b.trim()) : [
      "Rich in healthy fats and protein",
      "Good source of vitamin E",
      "Contains antioxidants",
      "Supports heart health",
      "Natural energy booster",
    ],
    origin: product.origin || "Premium farms",
    shelfLife: product.shelfLife || "12 months",
    storage: product.storage || "Store in a cool, dry place",
  };

  const tabs = [
    { id: "description", label: "Description", icon: Info },
    ...(product.type === "dry-fruit" ? [
      { id: "nutrition", label: "Nutrition", icon: Leaf },
      { id: "ingredients", label: "Ingredients", icon: Package }
    ] : []),
    { id: "reviews", label: "Reviews", icon: MessageSquare, count: numReviews },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 🔹 SECTION 1 — Product Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/products")}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Image Section */}
          <div className="space-y-6">
            <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 group shadow-sm">
              <img
                src={images[selectedImage] || 'https://via.placeholder.com/600?text=No+Image+Available'}
                alt={product.name}
                className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600?text=Product+Image';
                }}
              />
              {discount > 0 && (
                <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail previews */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-24 h-24 rounded-2xl flex-shrink-0 border-2 overflow-hidden transition-all ${selectedImage === index ? "border-green-500 shadow-md ring-2 ring-green-100" : "border-gray-200 hover:border-green-200"
                      }`}
                  >
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-4 py-1 text-sm font-medium">
                {product.category}
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <StarRating value={averageRating} size={24} />
                <span className="text-gray-400">|</span>
                <span className="text-gray-600 font-medium">
                  {numReviews} customer reviews
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-green-600 tracking-tighter">
                  ₹{productPrice.toLocaleString()}
                </span>
                {originalPrice && (
                  <span className="text-2xl text-gray-400 line-through decoration-red-400/50">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  In Stock ({product.stock} units)
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500 font-medium font-bold">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Out of Stock
                </div>
              )}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
              {product.description || "No description available for this product."}
            </p>

            {/* Actions */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {currentQuantity === 0 ? (
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-8 rounded-2xl shadow-xl shadow-green-100 transition-all hover:-translate-y-1 active:scale-95 text-xl"
                  >
                    <ShoppingCart className="w-6 h-6 mr-3" />
                    Add to Cart
                  </Button>
                ) : (
                  <div className="flex-1 flex items-center justify-between bg-green-50 rounded-2xl px-6 py-4 border-2 border-green-100 shadow-sm">
                    <Button
                      variant="ghost"
                      onClick={handleDecreaseQuantity}
                      className="text-green-600 hover:bg-white p-2 rounded-xl"
                    >
                      <Minus className="w-6 h-6" />
                    </Button>
                    <span className="text-2xl font-black text-green-700">{currentQuantity}</span>
                    <Button
                      variant="ghost"
                      onClick={handleIncreaseQuantity}
                      className="text-green-600 hover:bg-white p-2 rounded-xl"
                    >
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`h-full px-6 rounded-2xl border-2 transition-all ${isFavorite ? "border-red-200 bg-red-50 text-red-600" : "border-gray-100 hover:border-gray-200"
                      }`}
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" className="h-full px-6 rounded-2xl border-2 border-gray-100 hover:border-gray-200">
                    <Share2 className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {/* Service Proofs */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg"><Truck className="w-5 h-5 text-orange-600" /></div>
                  <span className="text-sm font-medium text-gray-600">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg"><Shield className="w-5 h-5 text-blue-600" /></div>
                  <span className="text-sm font-medium text-gray-600">Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 SECTION 2 — Tabbed Info */}
      <div className="bg-gray-50/50 mt-16 py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 border-b border-gray-200 mb-12 pb-4 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                  ? "bg-green-600 text-white shadow-lg shadow-green-100 -translate-y-1"
                  : "text-gray-500 hover:bg-white hover:text-green-600"
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20" : "bg-gray-100"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === "description" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Product Story</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Our {product.name} is selected from the finest harvests, ensuring premium quality and exceptional taste.
                    We follow a strict quality control process to bring you a product that is not only delicious but also
                    packed with natural goodness.
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    {productDetails.benefits.map((benefit, i) => (
                      <div key={i} className="flex gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <Award className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                  <h4 className="text-xl font-bold text-gray-900 border-b pb-4">Key Specifications</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><span className="text-gray-500">Origin</span><span className="font-bold">{productDetails.origin}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-500">Shelf Life</span><span className="font-bold">{productDetails.shelfLife}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-500">Storage</span><span className="font-bold">{productDetails.storage}</span></div>
                    {product.type === "dry-fruit" && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Certifications</span>
                        <Badge variant="secondary">{product.certifications || "Organic"}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "nutrition" && (
              <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-bold text-gray-900">Health Breakdown</h3>
                  <p className="text-gray-500">Nutrition facts per 100g serving</p>
                </div>
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 border border-gray-100">
                  {Object.entries(productDetails.nutritionFacts).map(([key, value], i) => (
                    <div key={key} className={`flex justify-between p-6 px-10 ${i % 2 === 0 ? "bg-gray-50/50" : "bg-white"} border-b last:border-0`}>
                      <span className="text-gray-600 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-gray-900 font-black">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "ingredients" && (
              <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {productDetails.ingredients.map((ing, i) => (
                  <div key={i} className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <Leaf className="w-8 h-8 text-green-600" />
                    </div>
                    <span className="text-xl font-bold text-gray-800">{ing}</span>
                    <span className="text-sm text-gray-400 mt-2">100% Natural Source</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Summary & Form */}
                  <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center space-y-4">
                      <h4 className="text-gray-500 font-bold tracking-widest uppercase text-sm">Average Rating</h4>
                      <div className="text-6xl font-black text-gray-900">{averageRating.toFixed(1)}</div>
                      <div className="flex justify-center"><StarRating value={averageRating} size={28} /></div>
                      <p className="text-gray-500 italic">Based on {numReviews} customer experiences</p>
                    </div>

                    {/* Submission Form for Users */}
                    {user && user.role === "user" ? (
                      <form onSubmit={handleReviewSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200/50 space-y-6">
                        <h4 className="text-xl font-bold text-gray-900">Write a Review</h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 uppercase">Your Rating</label>
                            <StarRating
                              value={newReview.rating}
                              onChange={(val) => setNewReview({ ...newReview, rating: val })}
                              interactive
                              size={32}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 uppercase">Your Experience</label>
                            <textarea
                              className="w-full bg-gray-50 border-none rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-green-500 min-h-[120px]"
                              placeholder="Tell us what you liked (or didn't like) about this product..."
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            />
                          </div>
                          {submitError && <div className="text-red-500 text-sm font-medium">{submitError}</div>}
                          <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-green-600 hover:bg-green-700 h-14 rounded-xl font-bold shadow-lg shadow-green-100"
                          >
                            {submitting ? "Submitting..." : "Post Review"}
                          </Button>
                        </div>
                      </form>
                    ) : !user ? (
                      <div className="bg-gray-100 p-8 rounded-3xl text-center">
                        <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium italic">Please log in as a buyer to share your review.</p>
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-8 rounded-3xl text-center">
                        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium italic">Administrators cannot post reviews.</p>
                      </div>
                    )}
                  </div>

                  {/* Review List */}
                  <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      Customer Thoughts
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-md">{reviews.length}</span>
                    </h3>

                    {reviewsLoading ? (
                      <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <Card key={review._id} className="border-none shadow-md overflow-hidden bg-white rounded-3xl">
                            <CardContent className="p-8 space-y-4">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center text-green-700 font-black">
                                    {review.user?.fullName?.charAt(0) || "U"}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900">{review.user?.fullName || "Anonymous User"}</div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(review.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <StarRating value={review.rating} size={16} />
                              </div>
                              <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-xl font-bold text-gray-400">No reviews yet. Be the first to share!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Bottom Section - Delivery Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 text-center hover:shadow-xl transition-shadow group">
            <div className="inline-flex p-5 bg-green-50 rounded-3xl mb-8 group-hover:scale-110 transition-transform"><RotateCcw className="w-10 h-10 text-green-600" /></div>
            <h3 className="text-2xl font-black mb-4">Quality Return</h3>
            <p className="text-gray-500 leading-relaxed font-medium">Not satisfied? Return within 7 days for a hassle-free refund or replacement.</p>
          </div>
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 text-center hover:shadow-xl transition-shadow group">
            <div className="inline-flex p-5 bg-blue-50 rounded-3xl mb-8 group-hover:scale-110 transition-transform"><Shield className="w-10 h-10 text-blue-600" /></div>
            <h3 className="text-2xl font-black mb-4">100% Secure</h3>
            <p className="text-gray-500 leading-relaxed font-medium">Your payments are fully protected with industry-standard encryption protocols.</p>
          </div>
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 text-center hover:shadow-xl transition-shadow group">
            <div className="inline-flex p-5 bg-orange-50 rounded-3xl mb-8 group-hover:scale-110 transition-transform"><Truck className="w-10 h-10 text-orange-600" /></div>
            <h3 className="text-2xl font-black mb-4">Fresh & Fast</h3>
            <p className="text-gray-500 leading-relaxed font-medium">Direct from source to your doorstep. Free delivery on orders above ₹999.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
