import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Plus, Minus, Eye } from 'lucide-react'
import { useProducts } from '../contexts/ProductContext'
import { useCart } from '../contexts/CartContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DryFruitsSlider() {
  const { getActiveProducts } = useProducts()
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart()
  const [addedItems, setAddedItems] = useState(new Set())
  const navigate = useNavigate()

  const dryFruits = getActiveProducts()

  const getItemQuantityInCart = (productId) => {
    const item = cartItems.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  const handleAddToCart = (fruit) => {
    addToCart(fruit)
    setAddedItems(prev => new Set([...prev, fruit.id]))
    
    // Remove the added indication after 2 seconds
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(fruit.id)
        return newSet
      })
    }, 2000)
  }

  const handleIncreaseQuantity = (fruit) => {
    const currentQuantity = getItemQuantityInCart(fruit.id)
    if (currentQuantity === 0) {
      addToCart(fruit)
    } else {
      updateQuantity(fruit.id, currentQuantity + 1)
    }
  }

  const handleDecreaseQuantity = (fruit) => {
    const currentQuantity = getItemQuantityInCart(fruit.id)
    if (currentQuantity > 1) {
      updateQuantity(fruit.id, currentQuantity - 1)
    } else if (currentQuantity === 1) {
      removeFromCart(fruit.id)
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            🌟 Featured Products
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Premium Dry Fruits Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked selection of the finest dry fruits and nuts from around the world. 
            Each product is carefully sourced and quality-tested for your satisfaction.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dryFruits.map((fruit) => (
            <Card key={fruit.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
              <CardHeader className="relative p-6">
                {fruit.isOnSale && (
                  <Badge variant="destructive" className="absolute top-4 right-4 z-10">
                    Sale
                  </Badge>
                )}
                
                {/* Product Image */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl h-32 flex items-center justify-center mb-4 overflow-hidden">
                  <img 
                    src={fruit.image} 
                    alt={fruit.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="60" fill="%236b7280" text-anchor="middle" dy="0.3em">🥜</text></svg>';
                    }}
                  />
                </div>
                
                {/* Category Badge */}
                <Badge variant="outline" className="w-fit">
                  {fruit.category}
                </Badge>
              </CardHeader>

              <CardContent className="p-6 pt-0 flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {fruit.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {fruit.description}
                </p>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(fruit.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {fruit.rating} ({fruit.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    {fruit.price}
                  </span>
                  {fruit.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      {fruit.originalPrice}
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <div className="w-full space-y-3">
                  {getItemQuantityInCart(fruit.id) === 0 ? (
                    <Button 
                      className={`w-full transition-colors ${
                        addedItems.has(fruit.id)
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'group-hover:bg-green-700'
                      }`}
                      onClick={() => handleAddToCart(fruit)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {addedItems.has(fruit.id) ? 'Added to Cart!' : 'Add to Cart'}
                    </Button>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecreaseQuantity(fruit)}
                        className="h-10 w-10 rounded-full p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold">
                          {getItemQuantityInCart(fruit.id)}
                        </span>
                        <span className="text-sm text-gray-500">in cart</span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIncreaseQuantity(fruit)}
                        className="h-10 w-10 rounded-full p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* View Details Button */}
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/product/${fruit.id}`)}
                    className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-700 font-medium py-2"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8"
            onClick={() => navigate('/products')}
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
