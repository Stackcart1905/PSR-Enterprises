import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, ShoppingCart, User, Search, LogIn, UserPlus, LogOut, Shield } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '../contexts/CartContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()
  const { getCartCount } = useCart()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true'
      const role = localStorage.getItem('userRole')
      setIsAuthenticated(authStatus)
      setUserRole(role)
    }

    checkAuthStatus()
    
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuthStatus)
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userRole')
    setIsAuthenticated(false)
    setUserRole(null)
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo size="md" tagline={true} />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors">
                Products
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors">
                Contact
              </Link>
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
            {!isAuthenticated ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-green-700"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            ) : (
              <>
                {userRole === 'admin' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/admin/dashboard')}
                    className="text-gray-700 hover:text-green-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="w-5 h-5" />
              {getCartCount() > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 px-1 py-0.5 text-xs">
                  {getCartCount()}
                </Badge>
              )}
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
            <Link to="/products" className="text-gray-700 hover:text-green-700 block px-3 py-2 text-base font-medium">
              Products
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-green-700 block px-3 py-2 text-base font-medium">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-green-700 block px-3 py-2 text-base font-medium">
              Contact
            </Link>
            <div className="px-3 py-2 space-y-2">
              
              <div className="flex space-x-2">
                {!isAuthenticated ? (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="w-full justify-center"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                ) : (
                  <>
                    {userRole === 'admin' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex-1 justify-center"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    )}
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={handleLogout}
                      className="flex-1 justify-center text-red-600 hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
              
              <Button 
                size="sm"
                variant="outline"
                onClick={() => navigate('/cart')}
                className="w-full justify-center relative"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {getCartCount() > 0 && (
                  <Badge variant="destructive" className="ml-2 px-1 py-0.5 text-xs">
                    {getCartCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
