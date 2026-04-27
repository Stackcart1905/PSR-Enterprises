import { useCart } from "../contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const formatPrice = (price) => {
    if (typeof price === "string") {
      return parseFloat(price.replace("₹", "").replace(",", ""));
    }
    return price;
  };

  const calculateItemTotal = (item) => {
    const price = formatPrice(item.price);
    return price * item.quantity;
  };

  const getProductImage = (item) => {
    // Try different image field structures
    if (item.image) return item.image;
    if (item.images && Array.isArray(item.images)) {
      if (item.images.length > 0) {
        // If images is array of objects with url property
        if (item.images[0].url) return item.images[0].url;
        // If images is array of URLs
        return item.images[0];
      }
    }
    return "";
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">
            Start shopping to add items to your cart
          </p>
          <Link to="/">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 px-8 py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Shopping Cart
            </h1>
            <Badge
              variant="secondary"
              className="text-base sm:text-lg px-3 py-1 w-fit"
            >
              {getCartCount()} {getCartCount() === 1 ? "item" : "items"}
            </Badge>
          </div>
          <Link to="/">
            <Button
              variant="ghost"
              className="text-green-600 hover:text-green-700 p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Simplified */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <Link
                      to={`/product/${item.id}`}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0 overflow-hidden"
                    >
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="30" fill="%236b7280" text-anchor="middle" dy="0.3em">🥜</text></svg>';
                        }}
                      />
                    </Link>

                    {/* Product Info - Name and Price */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.id}`}
                        className="block hover:text-green-600 transition-colors"
                      >
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 truncate hover:text-green-600">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <div className="text-xl sm:text-2xl font-black text-green-600">
                          ₹{calculateItemTotal(item).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{formatPrice(item.price).toLocaleString()} ×{" "}
                          {item.quantity}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls and Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center border-2 border-gray-200 rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-red-50 hover:text-red-600"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <span className="px-2 sm:px-4 py-2 font-bold text-sm sm:text-lg min-w-8 sm:min-w-12 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-green-50 hover:text-green-600"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Clear Cart Button */}
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Subtotal ({getCartCount()} items)</span>
                    <span className="font-medium">
                      ₹{getCartTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base text-gray-500">
                    <span>Delivery & Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900 pt-1">
                    <span>Subtotal</span>
                    <span>₹{getCartTotal().toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 py-3 text-base font-semibold"
                  size="lg"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
