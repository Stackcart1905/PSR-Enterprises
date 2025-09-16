import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import WhatsAppButton from "./components/WhatsAppButton";
import Navbar from './components/Navbar'
import Home from './components/Home'
import Products from './components/Products'
import ProductDetail from './components/ProductDetail'
import Login from './components/Login'
import Signup from './components/Signup'
import NotFound from './components/NotFound'
import Footer from './components/Footer'
import AdminDashboard from './components/AdminDashboard'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import ScrollToTop from "./ScrollToTop";
import Cart from './components/Cart'
import AboutUs from './components/AboutUs'
import ContactUs from './components/ContactUs'
import { CartProvider } from './contexts/CartContext'
import { ProductProvider } from './contexts/ProductContext'
import './App.css'

function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <Router>
          {/* 👇 Always active, resets scroll on route change */}
          <ScrollToTop />

          <div className="min-h-screen">
            <Routes>
              {/* Home */}
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <Home />
                    <Footer />
                  </>
                }
              />

              {/* Products */}
              <Route
                path="/products"
                element={
                  <>
                    <Navbar />
                    <Products />
                    <Footer />
                  </>
                }
              />

              {/* Product Detail */}
              <Route
                path="/product/:id"
                element={
                  <>
                    <Navbar />
                    <ProductDetail />
                    <Footer />
                  </>
                }
              />

              {/* Cart */}
              <Route
                path="/cart"
                element={
                  <>
                    <Navbar />
                    <Cart />
                    <Footer />
                  </>
                }
              />

              {/* About Us */}
              <Route
                path="/about"
                element={
                  <>
                    <Navbar />
                    <AboutUs />
                    <Footer />
                  </>
                }
              />

              {/* Contact Us */}
              <Route
                path="/contact"
                element={
                  <>
                    <Navbar />
                    <ContactUs />
                    <Footer />
                  </>
                }
              />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Admin */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            
            {/* ✅ WhatsApp button is now global (visible on every page) */}
            <WhatsAppButton />
          </div>
        </Router>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;