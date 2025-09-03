import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Star, ShoppingCart, Heart } from 'lucide-react'

export default function DryFruitsSlider() {
  const dryFruits = [
    {
      id: 1,
      name: "Premium Almonds",
      price: "₹2499.99",
      originalPrice: "₹2999.99",
      image: "🥜",
      rating: 4.8,
      reviews: 124,
      description: "Premium California almonds, rich in protein and healthy fats",
      category: "Nuts",
      isOnSale: true
    },
    {
      id: 2,
      name: "Dried Apricots",
      price: "₹1999.99",
      originalPrice: null,
      image: "🍑",
      rating: 4.9,
      reviews: 89,
      description: "Sun-dried Turkish apricots, naturally sweet and nutritious",
      category: "Dried Fruits",
      isOnSale: false
    },
    {
      id: 3,
      name: "Mixed Berries",
      price: "₹3299.99",
      originalPrice: "₹3699.99",
      image: "🫐",
      rating: 4.7,
      reviews: 156,
      description: "Antioxidant-rich mix of blueberries, cranberries, and goji berries",
      category: "Berries",
      isOnSale: true
    },
    {
      id: 4,
      name: "Cashew Nuts",
      price: "₹2899.99",
      originalPrice: null,
      image: "🥜",
      rating: 4.8,
      reviews: 203,
      description: "Creamy and buttery cashews from premium Indian farms",
      category: "Nuts",
      isOnSale: false
    },
    {
      id: 5,
      name: "Dates (Medjool)",
      price: "₹2299.99",
      originalPrice: "₹2599.99",
      image: "🫒",
      rating: 4.9,
      reviews: 167,
      description: "Large, soft Medjool dates - nature's candy",
      category: "Dates",
      isOnSale: true
    },
    {
      id: 6,
      name: "Walnuts",
      price: "₹2600.99",
      originalPrice: null,
      image: "🌰",
      rating: 4.6,
      reviews: 98,
      description: "Brain-healthy walnuts packed with omega-3 fatty acids",
      category: "Nuts",
      isOnSale: false
    },
    {
      id: 7,
      name: "Dried Mango",
      price: "₹1800.99",
      originalPrice: "₹2100.99",
      image: "🥭",
      rating: 4.7,
      reviews: 134,
      description: "Sweet and chewy dried mango slices from tropical farms",
      category: "Dried Fruits",
      isOnSale: true
    },
    {
      id: 8,
      name: "Pistachios",
      price: "₹3400.99",
      originalPrice: null,
      image: "🥜",
      rating: 4.8,
      reviews: 176,
      description: "Roasted and salted pistachios with rich, nutty flavor",
      category: "Nuts",
      isOnSale: false
    }
  ]

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

        {/* Carousel */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {dryFruits.map((fruit) => (
                <CarouselItem key={fruit.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="p-1">
                    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                      <CardHeader className="relative p-6">
                        {fruit.isOnSale && (
                          <Badge variant="destructive" className="absolute top-4 right-4 z-10">
                            Sale
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        
                        {/* Product Image */}
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl h-32 flex items-center justify-center mb-4">
                          <span className="text-6xl">{fruit.image}</span>
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
                        <Button className="w-full group-hover:bg-green-700 transition-colors">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
