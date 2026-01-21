'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams,Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import PasswordStrength from "@/components/PasswordStrength";

const SetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });

  const inputRefs = useRef<HTMLInputElement[]>([]);

  // OTP handlers (same as above)
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d?$/.test(value)) return;
    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();

    if (newOtp.every(d => d !== "") && newOtp.join("").length === 6) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const digits = pasted.split("");
      setOtpArray([...digits, ...Array(6 - digits.length).fill("")]);
    }
  };

  const verifyOtp = async (code: string) => {
    if (!userId) return toast.error("Invalid link");
    setLoading(true);
    try {
      const res = await api.post("/api/verify-set-password-otp", { user_id: userId, otp: code });
      if (res.data.valid) {
        toast.success("Code verified! Set your password.");
        setStep(2);
      } else {
        toast.error("Invalid or expired code");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) return toast.error("Passwords do not match");
    if (formData.password.length < 8) return toast.error("Password must be at least 8 characters");

    setLoading(true);
    try {
      const res = await api.post("/api/set-password", {
        user_id: userId,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      const { user, token } = res.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      window.dispatchEvent(new Event("userUpdated"));

      toast.success(`Password set! Welcome, ${user.name}`);

      // Redirect based on user_type
      const userType = user.user_type?.toLowerCase()?.trim();

      if (userType === "admin") {
        navigate("/dashboard", { replace: true });
      } else if (userType === "industry_admin") {
        navigate("/industry-admin/dashboard", { replace: true });
      } else if (userType === "mentor") {
        navigate("/mentor/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 1) setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [step]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-card rounded-2xl shadow-elevated border border-border overflow-hidden"
      >
        <div className="gradient-hero p-10 text-center text-primary-foreground">
          <h1 className="text-3xl font-black">Set Your Password</h1>
          <p className="text-lg opacity-90 mt-2">
            {step === 1 ? "Enter the 6-digit code sent to your email" : "Choose a strong password"}
          </p>
        </div>

        <div className="p-12">
          <Link
            to="/auth"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
          </Link>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <Label className="text-xl font-bold text-center block">Verification Code</Label>
                <div className="flex justify-center gap-3">
                  {otpArray.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el!)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      className="text-center text-5xl font-black h-20 w-16 bg-secondary/50 border-2 border-border focus:border-primary focus:ring-2"
                    />
                  ))}
                </div>

                <Button
                  className="w-full h-14 text-lg font-bold"
                  disabled={loading || otpArray.join("").length !== 6}
                  onClick={() => verifyOtp(otpArray.join(""))}
                  variant="accent"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : "Verify Code"}
                </Button>
              </motion.div>
            ) : (
              <motion.form key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSetPassword} className="space-y-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-lg font-bold">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-12 pr-12 h-14 text-lg"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <PasswordStrength password={formData.password} />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirm" className="text-lg font-bold">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirm"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                        className="pl-12 h-14 text-lg"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-14 text-lg font-bold"
                  disabled={loading}
                  variant="accent"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : "Set Password & Login"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default SetPassword;