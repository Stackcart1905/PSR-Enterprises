import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../contexts/ProductContext";
import { useCart } from "../contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Eye,
} from "lucide-react";

export default function Products() {
  const navigate = useNavigate();
  const { getActiveProducts, refetchProducts } = useProducts();
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();

  const [selectedType, setSelectedType] = useState("dry-fruit");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  useEffect(() => {
    refetchProducts(selectedType);
    setSelectedCategory("all"); // Reset category filter when type changes
    setSearchTerm(""); // Optionally reset search as well
  }, [selectedType, refetchProducts]);

  const products = getActiveProducts();
  const categories = [
    "all",
    ...new Set(products.map((product) => product.category)),
  ];

  // Get item quantity in cart
  const getItemQuantityInCart = (productId) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    const currentQuantity = getItemQuantityInCart(product.id);
    if (currentQuantity === 0) {
      addToCart(product);
    } else {
      updateQuantity(product.id, currentQuantity + 1);
    }
  };

  // Handle quantity changes
  const handleIncreaseQuantity = (product) => {
    const currentQuantity = getItemQuantityInCart(product.id);
    if (currentQuantity === 0) {
      addToCart(product);
    } else {
      updateQuantity(product.id, currentQuantity + 1);
    }
  };

  const handleDecreaseQuantity = (product) => {
    const currentQuantity = getItemQuantityInCart(product.id);
    if (currentQuantity > 1) {
      updateQuantity(product.id, currentQuantity - 1);
    } else if (currentQuantity === 1) {
      removeFromCart(product.id);
    }
  };

  // Parse price for filtering and sorting
  const parsePrice = (price) => {
    if (typeof price === "string") {
      return parseFloat(price.replace("₹", "").replace(",", ""));
    }
    return price;
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const productPrice = parsePrice(product.price);
      const matchesPrice =
        productPrice >= priceRange.min && productPrice <= priceRange.max;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return parsePrice(a.price) - parsePrice(b.price);
        case "price-high":
          return parsePrice(b.price) - parsePrice(a.price);
        case "rating":
          return b.rating - a.rating;
        case "popular":
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy, priceRange]);

  // Product Card Component
  const ProductCard = ({ product }) => {
    const currentQuantity = getItemQuantityInCart(product.id);
    const productPrice = parsePrice(product.price);
    const originalPrice = product.originalPrice
      ? parsePrice(product.originalPrice)
      : null;
    const discount = originalPrice
      ? Math.round((1 - productPrice / originalPrice) * 100)
      : 0;

    return (
      <Card className="group hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border-2 border-transparent hover:border-green-200 bg-white">
        <div className="relative">
          {/* Product Image - Enhanced for better visibility */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 aspect-square flex items-center justify-center overflow-hidden shadow-inner">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23fef3c7"/><text x="50%" y="50%" font-family="Arial" font-size="120" fill="%236b7280" text-anchor="middle" dy="0.3em">🥜</text></svg>';
              }}
            />
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isOnSale && (
              <Badge className="bg-red-500 text-white">{discount}% OFF</Badge>
            )}
            {product.stock < 10 && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 border-yellow-300"
              >
                Low Stock
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          <Badge variant="secondary" className="mb-2 text-xs">
            {product.category}
          </Badge>

          {/* Product Name - Enhanced visibility */}
          <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
            {product.name}
          </h3>

          {/* Description - Enhanced readability */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-3 leading-relaxed">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium ml-1">{product.rating}</span>
            </div>
            <span className="text-gray-400 text-sm">
              ({product.reviews} reviews)
            </span>
          </div>
          {/* Price - Enhanced visibility */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-green-600">
                ₹{productPrice.toLocaleString()}
              </span>
              {originalPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-red-500">
                    {Math.round(
                      ((originalPrice - productPrice) / originalPrice) * 100,
                    )}%
                    OFF
                  </span>
                </>
              )}
            </div>
            {discount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Add to Cart / Quantity Controls */}
          <div className="space-y-3">
            {currentQuantity === 0 ? (
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDecreaseQuantity(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="px-3 py-1 text-sm font-medium min-w-8 text-center">
                    {currentQuantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleIncreaseQuantity(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <span className="text-sm text-green-600 font-medium">
                  In Cart
                </span>
              </div>
            )}

            {/* View Details Button - Enhanced */}
            <Button
              variant="outline"
              onClick={() => navigate(`/product/${product.id}`)}
              className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-700 font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Eye className="w-5 h-5 mr-2" />
              View Details
            </Button>
          </div>

          {/* Stock Info */}
          <p className="text-xs text-gray-500 mt-2">
            {product.stock > 0
              ? `${product.stock} items available`
              : "Out of stock"}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col items-center mb-10">
            <h2 className="text-xl font-bold text-green-700 mb-6 tracking-wide uppercase">
              Swaadbhog mewa traders
            </h2>

            {/* Sliding Toggle */}
            <div className="relative flex bg-gray-200 rounded-full p-1 w-72 shadow-inner border border-gray-300">
              <div
                className={`absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                  selectedType === "grocery"
                    ? "translate-x-full"
                    : "translate-x-0"
                }`}
              />
              <button
                onClick={() => setSelectedType("dry-fruit")}
                className={`relative flex-1 py-3 text-sm font-bold rounded-full transition-colors duration-200 z-10 ${
                  selectedType === "dry-fruit"
                    ? "text-green-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Dry Fruits
              </button>
              <button
                onClick={() => setSelectedType("grocery")}
                className={`relative flex-1 py-3 text-sm font-bold rounded-full transition-colors duration-200 z-10 ${
                  selectedType === "grocery"
                    ? "text-green-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Grocery
              </button>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Products
          </h1>
          <p className="text-gray-600 text-lg">
            Discover our premium collection of dry fruits, nuts, and healthy
            snacks, available for both dry fruit and grocery categories.
          </p>
          {/* Enhanced Highlighted Phrase */}
          <div className="text-center mt-4">
            <p className="text-2xl font-bold text-white bg-gradient-to-r from-green-600 to-green-500 px-8 py-4 rounded-full inline-block shadow-lg transform hover:scale-105 transition-transform duration-300 border-2 border-green-300">
              🌱{" "}
              <span className="underline decoration-white decoration-2">
                Organic and Natural Products
              </span>{" "}
              🌱
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Search Products
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2 w-full">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            min:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          }))
                        }
                        className="w-1/2 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            max:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          }))
                        }
                        className="w-1/2 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      ₹{priceRange.min || 0} - ₹{priceRange.max || "∞"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories
                    .filter((cat) => cat !== "all")
                    .map((category) => {
                      const count = products.filter(
                        (p) => p.category === category,
                      ).length;
                      return (
                        <div
                          key={category}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-600">{category}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filter criteria
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
