import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // ← store interval ID

  // Function to start (or restart) the countdown
  const startTimer = () => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTimeLeft(30);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start timer on mount
  useEffect(() => {
    startTimer();
    inputRefs.current[0]?.focus();

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "") && newOtp.join("").length === 6) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const digits = pasted.split("");
      setOtp([...digits, ...Array(6 - digits.length).fill("")]);
      if (digits.length === 6) {
        verifyOtp(digits.join(""));
      }
    }
  };

  const verifyOtp = async (code: string) => {
    try {
      await api.get("/sanctum/csrf-cookie");
      const res = await api.post("/api/verify-otp", { otp: code });
      const { user, token } = res.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      window.dispatchEvent(new Event("userUpdated"));

      toast.success(`Login successful! Welcome back, ${user.name || user.email}.`);

      const userType = user.user_type?.toString().toLowerCase().trim() ?? "";

      if (userType === "admin") {
        navigate("/dashboard", { replace: true });
      } else if (userType === "mentor") {
        navigate("/mentor/dashboard", { replace: true });
      } else if (userType === "industry_admin") {
        navigate("/industry-admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Invalid or expired code";
      toast.error(message);
      if (message.includes("Session expired")) {
        navigate("/auth");
      }
    }
  };

  const resendOtp = async () => {
    try {
      await api.get("/sanctum/csrf-cookie");
      await api.post("/api/resend-otp");

      toast.success("New code sent!");
      
      // Restart the timer
      startTimer();

      // Reset OTP inputs
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to resend";
      toast.error(message);
      if (message.includes("Session expired")) {
        navigate("/auth");
      }
    }
  };

  const seconds = timeLeft % 30;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-card rounded-2xl shadow-elevated border border-border overflow-hidden"
      >
        <div className="gradient-hero p-8 text-center">
          <h1 className="text-2xl font-bold text-primary-foreground">Verify Your Email</h1>
          <p className="text-primary-foreground/80 mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="p-10 space-y-8">
          <div className="flex justify-center gap-4">
            {otp.map((digit, index) => (
              <Input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                className="text-center text-3xl font-bold h-16 w-16 bg-secondary/50 border-border focus:border-primary"
              />
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Code expires in{" "}
            <span className="font-medium text-primary">
              {seconds.toString().padStart(2, "0")}
            </span>{" "}
            seconds
          </div>

          <Button
            onClick={() => verifyOtp(otp.join(""))}
            className="w-full h-12 text-base font-semibold"
            disabled={otp.join("").length !== 6}
          >
            Verify Code
          </Button>

          <Button
            variant="outline"
            className="w-full h-12"
            onClick={resendOtp}
            disabled={!canResend}
          >
            {canResend ? "Resend OTP" : `Resend in ${seconds.toString().padStart(2, "0")}s`}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;