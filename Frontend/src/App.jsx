import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
          <div className="min-h-screen">
            <Routes>
              {/* Routes that include Navbar and Footer */}
              <Route path="/" element={
                <>
                  <Navbar />
                  <Home />
                  <Footer />
                </>
              } />
              
              {/* Products route with Navbar and Footer */}
              <Route path="/products" element={
                <>
                  <Navbar />
                  <Products />
                  <Footer />
                </>
              } />
              
              {/* Product Detail route with Navbar and Footer */}
              <Route path="/product/:id" element={
                <>
                  <Navbar />
                  <ProductDetail />
                  <Footer />
                </>
              } />
              
              {/* Cart route with Navbar and Footer */}
              <Route path="/cart" element={
                <>
                  <Navbar />
                  <Cart />
                  <Footer />
                </>
              } />
              
              {/* About Us route with Navbar and Footer */}
              <Route path="/about" element={
                <>
                  <Navbar />
                  <AboutUs />
                  <Footer />
                </>
              } />
              
              {/* Contact Us route with Navbar and Footer */}
              <Route path="/contact" element={
                <>
                  <Navbar />
                  <ContactUs />
                  <Footer />
                </>
              } />
              
              {/* Authentication routes without Navbar and Footer */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Admin routes without Navbar and Footer */}
              <Route path="/admin/dashboard" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </ProductProvider>
  )
}

export default App
