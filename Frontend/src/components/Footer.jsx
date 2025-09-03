import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Truck,
  CreditCard,
  Shield,
  Leaf
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">DryFruits Store</h2>
              <p className="text-gray-300 mb-4">
                Your trusted source for premium dry fruits, nuts, and healthy snacks. 
                Quality guaranteed, freshness delivered.
              </p>
              <div className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">100% Natural & Organic</span>
              </div>
            </div>
            
            {/* Social Media */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-3">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800">
                  <Youtube className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Products</a></li>

            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Customer Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Track Your Order</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-gray-300">Pacific mall, NSP</p>
                  <p className="text-gray-300">New Delhi, IN</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">+91 12345 67890</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">hello@dryfruitsstore.com</span>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-gray-300">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  <p className="text-gray-300">Sat - Sun: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        {/* <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 p-3 rounded-full">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold">Free Shipping</h5>
                <p className="text-gray-300 text-sm">On orders over $50</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold">Secure Payment</h5>
                <p className="text-gray-300 text-sm">100% secure transactions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-purple-600 p-3 rounded-full">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold">Quality Guarantee</h5>
                <p className="text-gray-300 text-sm">30-day money back</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-300 text-sm">
                © 2025 DryFruits Store. All rights reserved.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              Made with ❤️ in India
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
