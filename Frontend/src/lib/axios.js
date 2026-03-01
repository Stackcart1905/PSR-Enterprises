import axios from "axios";

const api = axios.create({
  // Default to backend dev port 5001; override via VITE_BACKEND_BASE_URL
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000",

  withCredentials: true,
});

console.log("Axios API BaseURL:", api.defaults.baseURL);

export default api;
