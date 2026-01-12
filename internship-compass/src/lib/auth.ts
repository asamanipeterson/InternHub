// src/lib/auth.ts
import api from "@/lib/api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  university: string;
  course: string;
  year: string;
  phone: string;
  nationality: string;
}

// ───────────────────────────────────────────────
// Helper - get CSRF cookie before state-changing requests
// ───────────────────────────────────────────────
const ensureCsrfCookie = async () => {
  try {
    await api.get("/sanctum/csrf-cookie");
  } catch (err) {
    console.warn("CSRF cookie request failed (might already exist)", err);
  }
};

// ───────────────────────────────────────────────
// Register – full student data
// ───────────────────────────────────────────────
export const register = async (data: RegisterData) => {
  await ensureCsrfCookie();
  const res = await api.post("/api/register", data);
  return res.data; // usually returns user object
};

// ───────────────────────────────────────────────
// Login
// ───────────────────────────────────────────────
export const login = async (data: LoginData) => {
  await ensureCsrfCookie();
  const res = await api.post("/api/login", data);
  return res.data; // user object
};

// ───────────────────────────────────────────────
// Logout – just hit the endpoint, cookie will be cleared by Laravel
// ───────────────────────────────────────────────
export const logout = async () => {
  try {
    await api.post("/api/logout");
  } catch (err) {
    console.warn("Server logout failed", err);
  } finally {
    // Clear local client-side state only
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userUpdated"));
  }
};

// ───────────────────────────────────────────────
// Get current user (cookie-based → no token needed)
// ───────────────────────────────────────────────
export const getMe = async () => {
  const res = await api.get("/api/user");
  return res.data;
};


export const verifyOtp = async (otp: string) => {
  await ensureCsrfCookie();  // ← Add this line
  const res = await api.post("/api/verify-otp", { otp });
  return res.data;
};

export const resendOtp = async () => {
  await ensureCsrfCookie();  // ← Add this line
  const res = await api.post("/api/resend-otp");
  return res.data;
};

export const forgotPassword = async (email: string) => {
  await ensureCsrfCookie();
  const res = await api.post("/api/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (data: any) => {
  await ensureCsrfCookie();
  const res = await api.post("/api/reset-password", data);
  return res.data;
};
// ───────────────────────────────────────────────
// Simple auth check based on local user cache
// (real check should be done via getMe() when needed)
// ───────────────────────────────────────────────
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("user");
};

// Optional: call on app init / after login
export const initAuth = async () => {
  try {
    const user = await getMe();
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("userUpdated"));
  } catch {
    localStorage.removeItem("user");
  }
};

export default {
  initAuth,
  register,
  login,
  logout,
  getMe,
  isAuthenticated,
};