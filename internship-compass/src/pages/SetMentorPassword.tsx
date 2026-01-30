'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { forgotPassword, resetPassword } from "@/lib/auth";
import PasswordStrength from "@/components/PasswordStrength";

const SetMentorPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = email, 2 = otp + password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Verification code sent to your email!");
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d?$/.test(value)) return;

    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
      const newArray = [...digits, ...Array(6 - digits.length).fill("")];
      setOtpArray(newArray);
      inputRefs.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpArray.join("");

    if (fullOtp.length !== 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    // Optional: extra client-side strength check (though PasswordStrength already guides user)
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email,
        otp: fullOtp,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });
      toast.success("Password set successfully! You can now log in.");
      navigate("/mentor/auth");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-card rounded-2xl shadow-elevated border border-border overflow-hidden"
      >
        <div className="gradient-hero p-10 text-center text-primary-foreground">
          <h1 className="text-3xl font-black">Set Mentor Password</h1>
          <p className="text-lg opacity-90 mt-2">
            {step === 1 ? "Enter your email to receive a code" : "Verify code and set a strong password"}
          </p>
        </div>

        <div className="p-12">
          <Link
            to="/auth"
            className="inline-flex items-center text-lg font-medium text-muted-foreground hover:text-primary mb-8"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Login
          </Link>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendCode}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-xl font-bold">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      className="pl-12 h-16 text-xl"
                      placeholder="Enter your mentor email"
                    />
                  </div>
                </div>
                <Button
                  className="w-full h-16 text-xl font-bold"
                  disabled={loading}
                  variant="accent"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : "Send Verification Code"}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSetPassword}
                className="space-y-10"
              >
                <div className="space-y-4">
                  <Label className="text-xl font-bold text-center block">
                    6-Digit Verification Code
                  </Label>
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
                </div>

                <div className="space-y-6 pt-6 border-t border-border">
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-lg font-bold">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="pl-10 pr-12 h-14 text-lg"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    <PasswordStrength password={formData.password} />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirm" className="text-lg font-bold">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirm"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password_confirmation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password_confirmation: e.target.value,
                          })
                        }
                        className="pl-10 h-14 text-lg"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-16 text-xl font-bold"
                  disabled={loading}
                  variant="accent"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : "Set Password"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default SetMentorPassword;