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
}

// No token management needed — Sanctum uses session cookie

const ensureCsrfCookie = async () => {
  try {
    await api.get("/sanctum/csrf-cookie");
  } catch (error) {
    console.warn("CSRF cookie fetch failed or already set");
  }
};

export const register = async (data: RegisterData) => {
  await ensureCsrfCookie();
  const res = await api.post("/api/register", data);
  return res.data; // Sanctum returns the user object directly
};

export const login = async (data: LoginData) => {
  await ensureCsrfCookie();
  const res = await api.post("/api/login", data);
  return res.data; // Sanctum returns the user object directly
};

export const logout = async () => {
  try {
    // This will now work because our interceptor attaches the Bearer token
    await api.post("/api/logout");
  } catch (error) {
    console.warn("Logout failed on server", error);
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Clear token
    window.dispatchEvent(new Event("userUpdated"));
  }
};
export const getMe = async () => {
  const res = await api.get("/api/user");
  return res.data;
};

export const isAuthenticated = (): boolean => {
  // With Sanctum stateful, we can rely on the cookie, but we use localStorage user as indicator
  return !!localStorage.getItem("user");
};

export const initAuth = () => {
  // No manual header setup needed for stateful Sanctum
};

export default {
  initAuth,
  register,
  login,
  logout,
  getMe,
  isAuthenticated,
};