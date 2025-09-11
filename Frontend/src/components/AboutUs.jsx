import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Star, Users, Heart, Award, Leaf, Shield } from 'lucide-react'

const AboutUs = () => {
  return (
    <section className="relative bg-gradient-to-r from-green-50 to-yellow-50 py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-200 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-yellow-200 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-200 rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-green-100 text-green-800 mb-4">
            🌿 Our Story
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            ABOUT <span className="text-green-600">US</span>
          </h1>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Content */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-green-600">PSR Enterprises</span> – Your Trusted Source for Premium Dry Fruits
            </h2>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                At PSR Enterprises, we believe in offering nature's finest gifts to our customers. 
                With years of experience in sourcing, selecting, and delivering the best dry fruits, 
                we are committed to providing products that are nutritious, fresh, and of the highest quality.
              </p>
              
              <p>
                Our mission is to promote healthy living by making dry fruits an essential part of your diet. 
                Whether you're looking for almonds, cashews, pistachios, raisins, or exotic blends, 
                we carefully curate every batch to ensure purity and taste. Our products are sourced from 
                trusted farms and suppliers, ensuring that what reaches you is wholesome, chemical-free, 
                and packed with natural goodness.
              </p>
            </div>
          </div>

          {/* Right Content - Decorative */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 h-96 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center text-2xl">🥜</div>
                    <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center text-2xl">🌰</div>
                    <div className="w-16 h-16 bg-red-300 rounded-full flex items-center justify-center text-2xl">🍇</div>
                    <div className="w-16 h-16 bg-purple-300 rounded-full flex items-center justify-center text-2xl">🥥</div>
                    <div className="w-16 h-16 bg-green-300 rounded-full flex items-center justify-center text-2xl">🌰</div>
                    <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center text-2xl">🥨</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Premium Dry Fruits</h3>
                  <p className="text-gray-600">Handpicked Quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-green-600">Us?</span>
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are committed to excellence in every aspect of our business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Premium Quality</h4>
              <p className="text-gray-600 text-sm">We handpick every nut and fruit for freshness and flavor.</p>
            </div>

            <div className="text-center group">
              <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Trusted Suppliers</h4>
              <p className="text-gray-600 text-sm">We work with farmers and growers committed to sustainable practices.</p>
            </div>

            <div className="text-center group">
              <div className="bg-purple-100 p-4 rounded-full w-fit mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Health First</h4>
              <p className="text-gray-600 text-sm">Our products support a healthy lifestyle and are free from harmful additives.</p>
            </div>

            <div className="text-center group">
              <div className="bg-orange-100 p-4 rounded-full w-fit mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Customer Satisfaction</h4>
              <p className="text-gray-600 text-sm">We prioritize your needs and ensure timely delivery and superior service.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 text-white">
          <h3 className="text-2xl lg:text-3xl font-bold mb-4">
            Join the PSR Enterprises family and make healthy snacking a delightful experience!
          </h3>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Discover our premium collection of dry fruits and experience the difference quality makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutUs
