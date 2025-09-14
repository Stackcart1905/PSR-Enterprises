import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Star, Truck, Shield } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-green-50 to-yellow-50 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-200 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-yellow-200 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-200 rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                🌟 Premium Quality Assured
              </Badge>
              <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
  Premium <span className="text-green-600">Products</span><br />
  Delivered Fresh
</h1>

{/* Highlighted Tagline */}
<p className="text-xl font-semibold text-green-700 bg-green-100 px-6 py-3 rounded-lg inline-block shadow-md mb-6">
  🌱 Organic and Natural Products 🌱
</p>

<p className="text-lg text-gray-600 mb-8 max-w-xl">
  Discover PSR Enterprise's finest selection of premium products and quality services. 
  Sourced directly from trusted suppliers, delivered fresh to your doorstep.
</p>

            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Now
              </Button>
              <Button variant="outline" size="lg">
                View Collection
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Premium Quality</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Fast Delivery</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-2">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">100% Natural</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 h-96 flex items-center justify-center">
                <div className="text-center p-8">
                  {/* Placeholder for products image */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center text-2xl">🥜</div>
                    <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center text-2xl">🌰</div>
                    <div className="w-16 h-16 bg-red-300 rounded-full flex items-center justify-center text-2xl">🍇</div>
                    <div className="w-16 h-16 bg-purple-300 rounded-full flex items-center justify-center text-2xl">🥥</div>
                    <div className="w-16 h-16 bg-green-300 rounded-full flex items-center justify-center text-2xl">🌰</div>
                    <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center text-2xl">🫐</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">50+ Varieties</h3>
                  <p className="text-gray-600">Fresh & Premium Quality</p>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">4.9/5</p>
                  <p className="text-xs text-gray-500">Customer Rating</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">5k+</p>
                <p className="text-xs text-gray-500">Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
