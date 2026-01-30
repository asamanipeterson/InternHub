import api from "@/lib/api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  university: string;
  course: string;
  year: string;
  phone: string;
  nationality: string;
  gender: string;
  date_of_birth: string;      // ← ISO string YYYY-MM-DD
  email: string;
  password: string;
  password_confirmation: string;
}

const ensureCsrfCookie = async () => {
  try {
    await api.get("/sanctum/csrf-cookie");
  } catch (err) {
    console.warn("CSRF cookie request failed", err);
  }
};

export const register = async (formData: any) => {   
  await ensureCsrfCookie();

  const data: RegisterData = {
    first_name: formData.first_name,
    middle_name: formData.middle_name || null,
    last_name: formData.last_name,
    university: formData.university,
    course: formData.course,
    year: formData.year,
    phone: formData.phone,
    nationality: formData.nationality,
    gender: formData.gender,
    date_of_birth: `${formData.dob_year}-${String(formData.dob_month).padStart(2, '0')}-${String(formData.dob_day).padStart(2, '0')}`,
    email: formData.email,
    password: formData.password,
    password_confirmation: formData.password_confirmation,
  };

  const res = await api.post("/api/register", data);
  return res.data;
};

// ───────────────────────────────────────────────
// Other functions remain the same
// ───────────────────────────────────────────────

export const login = async (data: LoginData) => {
  await ensureCsrfCookie();
  const res = await api.post("/api/login", data);
  return res.data;
};


export const logout = async () => {
  // Read user BEFORE clearing storage
  let user = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "null" && stored !== "undefined") {
      user = JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to parse stored user during logout", e);
  }

  // Determine redirect path based on role
  const userType = user?.user_type?.toString()?.toLowerCase()?.trim() || "";

  let redirectTo = "/auth";

  if (userType === "mentor") {
    redirectTo = "/mentor/auth";
  } else if (userType === "admin") {
    redirectTo = "/admin/auth";
  } else if (userType === "industry_admin") {
    redirectTo = "/industryadmin/auth";
  }
 
  // Now perform the actual logout
  try {
    await api.post("/api/logout");
  } catch (err) {
    console.warn("Server logout failed", err);
    // We continue anyway — client-side logout should still happen
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userUpdated"));
  }
  return redirectTo;
};

export const getMe = async () => {
  const res = await api.get("/api/user");
  return res.data;
};

export const verifyOtp = async (otp: string) => {
  await ensureCsrfCookie();
  const res = await api.post("/api/verify-otp", { otp });
  return res.data;
};

export const resendOtp = async () => {
  await ensureCsrfCookie();
  const res = await api.post("/api/resend-otp");
  return res.data;
};

export const forgotPassword = async (email: string) => {
  await ensureCsrfCookie();
  const res = await api.post("/api/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (data: { email: string; otp: string; password: string; password_confirmation: string }) => {
  await ensureCsrfCookie();
  const res = await api.post("/api/reset-password", data);
  return res.data;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("user");
};

export const initAuth = async () => {
  try {
    const user = await getMe();
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("userUpdated"));
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
};

export default {
  initAuth,
  register,
  login,
  logout,
  getMe,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  isAuthenticated,
};