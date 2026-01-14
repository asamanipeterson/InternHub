// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "", // ← CHANGE THIS: empty string = use Vite proxy
  withCredentials: true, // ← ADD THIS: critical for cookies/session
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
});

// Automatically attach Bearer token if exists (but only after full login)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Do NOT send Bearer token on OTP routes (they use session only)
  const sessionOnlyRoutes = [
    "/login",
    "/sanctum/csrf-cookie",
    "/api/verify-otp",
    "/api/resend-otp",
  ];

  const isSessionRoute = sessionOnlyRoutes.some((route) =>
    config.url?.includes(route)
  );

  if (token && !isSessionRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
 
export default api;