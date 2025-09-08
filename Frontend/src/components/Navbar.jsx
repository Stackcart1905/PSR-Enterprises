import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, ShoppingCart, User, Search, LogIn, UserPlus, LogOut, Shield } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-green-700 hover:text-green-800 transition-colors">
                PSR Enterprise
              </Link>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors">
                Home
              </Link>
              <a href="#products" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors">
                Products
              </a>
              <a href="#about" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors">
                Contact
              </a>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div> */}
            
            {/* Authentication Buttons */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/login')}
              className="text-gray-700 hover:text-green-700"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
            
            <Button 
              size="sm"
              onClick={() => navigate('/signup')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up
            </Button>
            
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="w-5 h-5" />
              <Badge variant="destructive" className="absolute -top-2 -right-2 px-1 py-0.5 text-xs">
                0
              </Badge>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMenu}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link to="/" className="text-gray-700 hover:text-green-700 block px-3 py-2 text-base font-medium">
              Home
            </Link>
            <a href="#products" className="text-gray-700 hover:text-green-700 block px-3 py-2 text-base font-medium">
              Products
            </a>
            <a href="#about" className="text-gray-700 hover:text-green-700 block px-3 py-2 text-base font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-700 hover:text-green-700 block px-3 py-2 text-base font-medium">
              Contact
            </a>
            <div className="px-3 py-2 space-y-2">
              
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="flex-1 justify-center"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate('/signup')}
                  className="flex-1 justify-center bg-green-600 hover:bg-green-700 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
