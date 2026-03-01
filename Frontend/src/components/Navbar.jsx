import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Menu, X, LogIn, LogOut, Shield, LayoutDashboard, ShoppingCart } from 'lucide-react'
import Logo from './Logo'
import useAuthStore from '../store/authStore'
import { disconnectSocket } from '../lib/socket'
import { useCart } from '../contexts/CartContext'

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

const navLinkClass = ({ isActive }) =>
  isActive
    ? 'text-green-700 font-semibold px-3 py-2 text-sm transition-colors'
    : 'text-gray-700 hover:text-green-700 px-3 py-2 text-sm transition-colors'

const mobileLinkClass = ({ isActive }) =>
  `block px-3 py-2 rounded-md text-sm font-medium ${isActive
    ? 'text-green-700 bg-green-50'
    : 'text-gray-700 hover:text-green-700 hover:bg-gray-50'
  }`

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const { getCartCount } = useCart()

  const isAdmin = user?.role === 'admin'
  const isUser = user?.role === 'user'

  const handleLogout = async () => {
    disconnectSocket()
    await logout()
    navigate('/')
  }

  const commonLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/settings', label: 'Settings' },
  ]

  const cartCount = getCartCount()

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <Logo size="md" tagline={true} />

          {/* ═══ DESKTOP ════════════════════════════════════════════════ */}
          <div className="hidden md:flex items-center space-x-1">

            {commonLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass} onClick={scrollToTop}>
                {label}
              </NavLink>
            ))}

            {/* Buyer → Dashboard & Cart links */}
            {isUser && (
              <>
                <NavLink to="/dashboard" className={navLinkClass} onClick={scrollToTop}>
                  <span className="flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-1.5" />
                    Dashboard
                  </span>
                </NavLink>

                {/* Cart Icon Link */}
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-700 hover:text-green-700 transition-colors ml-1"
                  onClick={scrollToTop}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-green-600 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Admin → Admin link */}
            {isAdmin && (
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                <span className="flex items-center">
                  <Shield className="w-4 h-4 mr-1.5" />
                  Admin
                </span>
              </NavLink>
            )}

            {/* Login / Logout */}
            {!isAuthenticated ? (
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-gray-700 hover:text-green-700 ml-2">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-700 hover:text-red-600 ml-2">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>

          {/* ═══ MOBILE hamburger ═══════════════════════════════════════ */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Mobile Cart Icon (Always visible if buyer, even when menu closed) */}
            {isUser && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-700"
                onClick={scrollToTop}
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-green-600 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE dropdown ════════════════════════════════════════════ */}
      {isOpen && (
        <div className="md:hidden bg-white border-t px-4 pt-2 pb-4 space-y-1">

          {commonLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={mobileLinkClass}
              onClick={() => { scrollToTop(); setIsOpen(false) }}
            >
              {label}
            </NavLink>
          ))}

          {isUser && (
            <>
              <NavLink to="/dashboard" className={mobileLinkClass} onClick={() => { scrollToTop(); setIsOpen(false) }}>
                <span className="flex items-center">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </span>
              </NavLink>
              {/* Optional: Mobile menu cart link as well */}
              <NavLink to="/cart" className={mobileLinkClass} onClick={() => { scrollToTop(); setIsOpen(false) }}>
                <span className="flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart ({cartCount})
                </span>
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink to="/admin/dashboard" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </span>
            </NavLink>
          )}

          {!isAuthenticated ? (
            <button onClick={() => { navigate('/login'); setIsOpen(false) }} className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </button>
          ) : (
            <button onClick={() => { handleLogout(); setIsOpen(false) }} className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
