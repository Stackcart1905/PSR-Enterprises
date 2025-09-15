import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProducts } from '../contexts/ProductContext'
import { useCart } from '../contexts/CartContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Star, 
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
  Award
} from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProductById } = useProducts()
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart()
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  
  const product = getProductById(parseInt(id))
  
  useEffect(() => {
    if (!product) {
      navigate('/products')
    }
  }, [product, navigate])

  if (!product) {
    return null
  }

  // Get item quantity in cart
  const getItemQuantityInCart = (productId) => {
    const item = cartItems.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  const currentQuantity = getItemQuantityInCart(product.id)

  // Handle add to cart
  const handleAddToCart = () => {
    if (currentQuantity === 0) {
      addToCart(product)
    } else {
      updateQuantity(product.id, currentQuantity + 1)
    }
  }

  // Handle quantity changes
  const handleIncreaseQuantity = () => {
    if (currentQuantity === 0) {
      addToCart(product)
    } else {
      updateQuantity(product.id, currentQuantity + 1)
    }
  }

  const handleDecreaseQuantity = () => {
    if (currentQuantity > 1) {
      updateQuantity(product.id, currentQuantity - 1)
    } else if (currentQuantity === 1) {
      removeFromCart(product.id)
    }
  }

  // Parse price
  const parsePrice = (price) => {
    if (typeof price === 'string') {
      return parseFloat(price.replace('₹', '').replace(',', ''))
    }
    return price
  }

  const productPrice = parsePrice(product.price)
  const originalPrice = product.originalPrice ? parsePrice(product.originalPrice) : null
  const discount = originalPrice ? Math.round((1 - productPrice / originalPrice) * 100) : 0

  // Mock additional product details (you can extend the product model to include these)
  const productDetails = {
    ingredients: product.ingredients || [
      'Premium ' + product.name.toLowerCase(),
      'Natural preservatives',
      'No artificial colors',
      'No added sugar'
    ],
    nutritionFacts: product.nutritionFacts || {
      'Energy': '570 kcal',
      'Protein': '21g',
      'Total Fat': '50g',
      'Carbohydrates': '22g',
      'Fiber': '12g',
      'Sugar': '4g'
    },
    benefits: product.benefits || [
      'Rich in healthy fats and protein',
      'Good source of vitamin E',
      'Contains antioxidants',
      'Supports heart health',
      'Natural energy booster'
    ],
    origin: product.origin || 'Premium farms',
    shelfLife: product.shelfLife || '12 months',
    storage: product.storage || 'Store in a cool, dry place',
    certifications: product.certifications || ['Organic', 'Non-GMO', 'Gluten-Free']
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mb-6 flex items-center gap-2 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 aspect-square flex items-center justify-center rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={product.images && product.images[selectedImage] ? product.images[selectedImage] : product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="80" fill="%236b7280" text-anchor="middle" dy="0.3em">🥜</text></svg>';
                    }}
                  />
                </div>
                
                {/* Image thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 justify-center">
                    {product.images.map((imageUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 overflow-hidden ${
                          selectedImage === index ? 'border-green-500' : 'border-gray-200'
                        }`}
                      >
                        <img 
                          src={imageUrl} 
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%236b7280" text-anchor="middle" dy="0.3em">🥜</text></svg>';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              {/* Category and Status */}
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.isOnSale && (
                  <Badge className="bg-red-500 text-white">
                    {discount}% OFF
                  </Badge>
                )}
                {product.stock < 10 && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Low Stock
                  </Badge>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="font-medium ml-2">{product.rating}</span>
                </div>
                <span className="text-gray-500">({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl font-bold text-green-600">
                  ₹{productPrice.toLocaleString()}
                </span>
                {originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-lg text-green-600 font-medium">
                    Save ₹{(originalPrice - productPrice).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Stock Info */}
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">
                  {product.stock > 0 ? `${product.stock} items available` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Add to Cart Section */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {currentQuantity === 0 ? (
                    <Button 
                      onClick={handleAddToCart}
                      className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleDecreaseQuantity}
                          className="h-12 w-12 p-0"
                        >
                          <Minus className="w-5 h-5" />
                        </Button>
                        <span className="text-2xl font-bold min-w-12 text-center">
                          {currentQuantity}
                        </span>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleIncreaseQuantity}
                          className="h-12 w-12 p-0"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="text-center text-green-600 font-medium">
                        Added to Cart
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorite ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Key Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {productDetails.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information Tabs */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Nutrition Facts */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Nutrition Facts
                </h3>
                <div className="space-y-2">
                  {Object.entries(productDetails.nutritionFacts).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-600" />
                  Ingredients
                </h3>
                <ul className="space-y-1">
                  {productDetails.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-700">• {ingredient}</li>
                  ))}
                </ul>
              </div>

              {/* Product Info */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Product Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">Origin:</span>
                    <span className="ml-2 font-medium">{productDetails.origin}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Shelf Life:</span>
                    <span className="ml-2 font-medium">{productDetails.shelfLife}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Storage:</span>
                    <span className="ml-2 font-medium">{productDetails.storage}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-gray-600">Certifications:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {productDetails.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery & Returns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Truck className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Free Delivery</h3>
              <p className="text-gray-600 text-sm">Free delivery on orders above ₹999</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600 text-sm">Premium quality guaranteed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <RotateCcw className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-600 text-sm">7-day return policy</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
