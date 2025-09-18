import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, ShoppingCart, LogIn, LogOut, Shield, Settings } from 'lucide-react'
import Logo from './Logo'
import { useCart } from '../contexts/CartContext'

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
  // Fallback for better browser compatibility
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()
  const { getCartCount } = useCart()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true'
      const role = localStorage.getItem('userRole')
      setIsAuthenticated(authStatus)
      setUserRole(role)
    }
    checkAuthStatus()
    window.addEventListener('storage', checkAuthStatus)
    return () => window.removeEventListener('storage', checkAuthStatus)
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
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "Products" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? "text-green-700 font-semibold px-3 py-2 text-sm transition-colors"
                      : "text-gray-700 hover:text-green-700 px-3 py-2 text-sm transition-colors"
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              {/* Cart */}
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive
                    ? "relative text-green-700 font-semibold px-3 py-2 flex items-center"
                    : "relative text-gray-700 hover:text-green-700 px-3 py-2 flex items-center"
                }
                onClick={scrollToTop}
              >
                <ShoppingCart className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 px-1 py-0.5 text-xs">
                    {getCartCount()}
                  </Badge>
                )}
              </NavLink>

              {/* Settings */}
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  isActive
                    ? "text-green-700 font-semibold px-3 py-2 text-sm flex items-center"
                    : "text-gray-700 hover:text-green-700 px-3 py-2 text-sm flex items-center"
                }
                onClick={scrollToTop}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </NavLink>
            </div>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
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
                  <NavLink 
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      isActive 
                        ? "text-green-700 font-semibold px-3 py-2 text-sm flex items-center"
                        : "text-gray-700 hover:text-green-700 px-3 py-2 text-sm flex items-center"
                    }
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </NavLink>
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
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "Products" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
              { to: "/settings", label: "Settings", icon: <Settings className="w-4 h-4 mr-2" /> },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? "text-green-700 font-semibold block px-3 py-2 text-base flex items-center"
                    : "text-gray-700 hover:text-green-700 block px-3 py-2 text-base flex items-center"
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            {/* Cart */}
            <NavLink
              to="/cart"

              className={({ isActive }) =>
                isActive
                  ? "flex items-center justify-center w-full text-green-700 font-semibold relative py-2"
                  : "flex items-center justify-center w-full text-gray-700 hover:text-green-700 relative py-2"
              }
              onClick={() => {
                scrollToTop();
                setIsOpen(false);
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {getCartCount() > 0 && (
                <Badge variant="destructive" className="ml-2 px-1 py-0.5 text-xs">
                  {getCartCount()}
                </Badge>
              )}
            </NavLink>

            {isAuthenticated && userRole === 'admin' && (
              <NavLink 
                to="/admin/dashboard"
                className={({ isActive }) =>
                  isActive 
                    ? "text-green-700 font-semibold block px-3 py-2 text-base flex items-center"
                    : "text-gray-700 hover:text-green-700 block px-3 py-2 text-base flex items-center"
                }
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </NavLink>
            )}

            {isAuthenticated && (
              <Button 
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="flex-1 justify-center text-red-600 hover:text-red-700 w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
