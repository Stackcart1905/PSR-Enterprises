import api from "../lib/axios.js";
import { create } from "zustand";

// ✅ Zustand Auth Store
const useAuthStore = create((set, get) => ({
  // =========================
  // State
  // =========================
  user: null, // logged-in user data
  isAuthenticated: false, // true if logged in
  isLoading: false, // global loading flag
  error: null, // holds API errors

  // =========================
  // State setters
  // =========================
  setUser: (userData) =>
    set({
      user: userData,
      isAuthenticated: !!userData, // true if userData exists
      error: null,
    }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // =========================
  // Auth actions
  // =========================

  // 🔹 LOGIN
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    console.log("🔑 Logging in with:", email);

    try {
      const response = await api.post("/api/auth/signin", { email, password });

      // ✅ save user into store
      if (response.data.token) localStorage.setItem("token", response.data.token);
      set({
        user: response.data,
        isAuthenticated: true,
        error: null,
      });

      return response.data; // return user object
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ error: message });
      throw new Error(message); // rethrow for UI handling
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔹 SIGNUP
  signup: async (userData) => {
    set({ isLoading: true, error: null });
    console.log("📝 Signing up with:", userData);

    try {
      const response = await api.post("/api/auth/signup", userData);
      return response.data; // user created
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔹 VERIFY OTP
  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    console.log("📩 Verifying OTP for:", email);

    try {
      const response = await api.post("/api/auth/verify-otp", { email, otp });

      // ✅ mark user as verified and logged in
      set({
        user: response.data,
        isAuthenticated: true,
        error: null,
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "OTP verification failed";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔹 RESEND OTP
  resendOtp: async (email) => {
    set({ isLoading: true, error: null });
    console.log("🔄 Resending OTP to:", email);

    try {
      const response = await api.post("/api/auth/resend-otp", { email });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend OTP";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔹 LOGOUT
  logout: async () => {
    set({ isLoading: true });
    try {
      // ✅ FIX: removed "./" (was wrong path)
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("🚨 Logout error:", error);
    } finally {
      // ✅ clear state
      localStorage.removeItem("token");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  // 🔹 CHECK AUTH (on page reload)
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/api/auth/checkAuth");

      set({
        user: response.data.user,
        isAuthenticated: true,
        error: null,
      });

      return response.data.user;
    } catch (error) {
      set({ user: null, isAuthenticated: false, error: null });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔹 FORGOT PASSWORD
  forgetPassword: async (email) => {
    set({ isLoading: true, error: null });
    console.log("🔐 Forgot password request for:", email);

    try {
      const response = await api.post("/api/auth/forgetPassword", { email });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Password reset request failed";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔹 RESET PASSWORD
  resetPassword: async (email, otp, newPassword) => {
    set({ isLoading: true, error: null });
    console.log("🔑 Resetting password for:", email);

    try {
      const response = await api.post("/api/auth/resetPassword", {
        email,
        otp,
        newPassword,
      });

      // ✅ auto-login after reset
      if (response.data.token) localStorage.setItem("token", response.data.token);
      set({
        user: response.data,
        isAuthenticated: true,
        error: null,
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
