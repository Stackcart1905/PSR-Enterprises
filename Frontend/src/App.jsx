import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import WhatsAppButton from "./components/WhatsAppButton";
import Navbar from "./components/Navbar";
import Products from "./components/Products";
import Home from "./components/Home";
import ProductDetail from "./components/ProductDetail";
import Login from "./components/Login";
import Signup from "./components/Signup";
import VerifyOtp from "./components/VerifyOtp.jsx"; // import OTP page
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import UserDashboard from "./components/UserDashboard";
import ProtectedUserRoute from "./components/ProtectedUserRoute";
import ScrollToTop from "./ScrollToTop";
import Cart from "./components/Cart";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import Checkout from "./components/Checkout";
import Orders from "./components/Orders";
import { CartProvider } from "./contexts/CartContext";
import { ProductProvider } from "./contexts/ProductContext";
import { ToastProvider } from "./components/ui/toast";
import useAuthStore from "./store/authStore";
import { useEffect } from "react";
import "./App.css";

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAuth();
    }
  }, [checkAuth]);

  return (
    <ToastProvider>
      <ProductProvider>
        <CartProvider>
          <Router>
            {/* 👇 Always active, resets scroll on route change */}
            <ScrollToTop />

            <div className="min-h-screen">
              <Routes>
                {/* Products as Home */}
                <Route
                  path="/"
                  element={
                    <>
                      <Navbar />
                      <Products />
                      <Footer />
                    </>
                  }
                />
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
                <Route
                  path="/home"
                  element={
                    <>
                      <Navbar />
                      <Home />
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
                <Route
                  path="/checkout"
                  element={
                    <>
                      <Navbar />
                      <Checkout />
                      <Footer />
                    </>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <>
                      <Navbar />
                      <Orders />
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
                <Route path="/verify-otp" element={<VerifyOtp />} />{" "}
                {/* ✅ Add this */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                {/* User Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedUserRoute>
                      <UserDashboard />
                    </ProtectedUserRoute>
                  }
                />
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
    </ToastProvider>
  );
}

export default App;
