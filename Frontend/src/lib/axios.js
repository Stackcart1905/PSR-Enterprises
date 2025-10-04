import axios from "axios";

const api = axios.create({
  // Default to backend dev port 5001; override via VITE_BACKEND_BASE_URL
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5001",

  withCredentials: true,
});

export default api;
