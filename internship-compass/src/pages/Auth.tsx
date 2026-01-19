// src/pages/Auth.tsx
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  School,
  BookOpen,
  Calendar,
  Phone,
  Globe,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "@/schemas/validation";

import { login, register } from "@/lib/auth";
import PasswordStrength from "@/components/PasswordStrength";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      university: "",
      course: "",
      year: "",
      email: "",
      phone: "",
      nationality: "",
      password: "",
      password_confirmation: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      if (response.redirect) {
        toast.success(response.message || "OTP sent! Check your email.");
        navigate(response.redirect);
        return;
      }

      const user = response?.user;
      const token = response?.token;

      console.log("Full login response from server:", response);
      console.log("User object received:", user);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (token) {
          localStorage.setItem("token", token);
        }
        window.dispatchEvent(new Event("userUpdated"));

        console.log("Raw user_type value:", user.user_type);
        console.log("user_type type:", typeof user.user_type);

        const userType = user.user_type?.toString().toLowerCase().trim() ?? "";

        console.log("Final processed userType:", userType);

        if (userType === "admin") {
          toast.success(`Welcome back, Admin ${user.name}!`);
          navigate("/dashboard", { replace: true });
        } else if (userType === "mentor") {
          toast.success(`Welcome, Mentor ${user.name}!`);
          navigate("/mentor/dashboard", { replace: true });
        } else {
          toast.success(`Welcome, ${user.name}!`);
          navigate("/", { replace: true });
        }
      } else {
        toast.error("Login successful, but user data is missing.");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success("Account created successfully! Please sign in to continue.");
      setIsLogin(true);
      registerForm.reset();
      loginForm.setValue("email", registerForm.getValues("email") || "");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  const passwordValue = registerForm.watch("password") || "";

  const toggleForm = () => {
    setShowPassword(false);
    setIsLogin(!isLogin);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 lg:pt-32 pb-16 min-h-screen flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-2xl shadow-elevated border border-border overflow-hidden"
            >
              <div className="gradient-hero p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                  className="w-16 h-16 bg-background/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <Lock className="h-8 w-8 text-primary-foreground" />
                </motion.div>
                <h1 className="text-2xl font-bold text-primary-foreground">
                  {isLogin ? "Sign In" : "Create Student Account"}
                </h1>
                <p className="text-primary-foreground/80 mt-2">
                  {isLogin
                    ? "Access your dashboard and applications"
                    : "Join our community of students"}
                </p>
              </div>

              <form
                onSubmit={
                  isLogin
                    ? loginForm.handleSubmit((data) => loginMutation.mutate(data))
                    : registerForm.handleSubmit((data) =>
                        registerMutation.mutate({
                          name: data.name,
                          email: data.email,
                          password: data.password,
                          password_confirmation: data.password_confirmation,
                          university: data.university,
                          course: data.course,
                          year: data.year,
                          phone: data.phone,
                          nationality: data.nationality,
                        })
                      )
                }
                className="p-10 space-y-6"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? "login" : "register"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    {/* Conditional register-only fields (students only) */}
                    {!isLogin && (
                      <>
                        <div>
                          <Label htmlFor="name">Full Name <span className="text-red-600" aria-hidden="true">*</span></Label>
                          <div className="relative mt-2">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="name"
                              type="text"
                              placeholder="John Doe"
                              {...registerForm.register("name")}
                              className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                            />
                          </div>
                          {registerForm.formState.errors.name && (
                            <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.name.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="university">University <span className="text-red-600" aria-hidden="true">*</span></Label>
                            <div className="relative mt-2">
                              <School className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="university"
                                placeholder="University of Ghana"
                                {...registerForm.register("university")}
                                className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                              />
                            </div>
                            {registerForm.formState.errors.university && (
                              <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.university.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="course">Course <span className="text-red-600" aria-hidden="true">*</span></Label>
                            <div className="relative mt-2">
                              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="course"
                                placeholder="Computer Science"
                                {...registerForm.register("course")}
                                className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                              />
                            </div>
                            {registerForm.formState.errors.course && (
                              <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.course.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="year">Year / Level <span className="text-red-600" aria-hidden="true">*</span></Label>
                            <div className="relative mt-2">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="year"
                                placeholder="Level 200"
                                {...registerForm.register("year")}
                                className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                              />
                            </div>
                            {registerForm.formState.errors.year && (
                              <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.year.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="phone">Phone Number <span className="text-red-600" aria-hidden="true">*</span></Label>
                            <div className="relative mt-2">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="phone"
                                placeholder="+233 24 123 4567"
                                {...registerForm.register("phone")}
                                className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                              />
                            </div>
                            {registerForm.formState.errors.phone && (
                              <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.phone.message}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="nationality">Nationality <span className="text-red-600" aria-hidden="true">*</span></Label>
                          <div className="relative mt-2">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="nationality"
                              placeholder="Ghanaian"
                              {...registerForm.register("nationality")}
                              className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                            />
                          </div>
                          {registerForm.formState.errors.nationality && (
                            <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.nationality.message}</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Common fields - Email & Password */}
                    <div>
                      <Label htmlFor="email">Email Address <span className="text-red-600" aria-hidden="true">*</span></Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="student@university.edu.gh"
                          {...(isLogin ? loginForm.register("email") : registerForm.register("email"))}
                          className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                        />
                      </div>
                      {(isLogin ? loginForm.formState.errors.email : registerForm.formState.errors.email) && (
                        <p className="text-sm text-destructive mt-1">
                          {(isLogin ? loginForm.formState.errors.email?.message : registerForm.formState.errors.email?.message)}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password">Password <span className="text-red-600" aria-hidden="true">*</span></Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...(isLogin ? loginForm.register("password") : registerForm.register("password"))}
                          className="pl-10 pr-12 h-12 bg-secondary/50 border-border focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      {!isLogin && (
                        <PasswordStrength password={passwordValue} />
                      )}

                      {(isLogin ? loginForm.formState.errors.password : registerForm.formState.errors.password) && (
                        <p className="text-sm text-destructive mt-1">
                          {(isLogin ? loginForm.formState.errors.password?.message : registerForm.formState.errors.password?.message)}
                        </p>
                      )}
                    </div>

                    {!isLogin && (
                      <div>
                        <Label htmlFor="password_confirmation">Confirm Password <span className="text-red-600" aria-hidden="true">*</span></Label>
                        <div className="relative mt-2">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="password_confirmation"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...registerForm.register("password_confirmation")}
                            className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                          />
                        </div>
                        {registerForm.formState.errors.password_confirmation && (
                          <p className="text-sm text-destructive mt-1">
                            {registerForm.formState.errors.password_confirmation.message}
                          </p>
                        )}
                      </div>
                    )}

                    {isLogin && (
                      <div className="flex items-center justify-end">
                        <Link
                          to="/forgot-password"
                          className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  disabled={loginMutation.isPending || registerMutation.isPending}
                >
                  {loginMutation.isPending || registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-4 text-muted-foreground">
                      {isLogin ? "New to the platform?" : "Already have an account?"}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12"
                  onClick={toggleForm}
                >
                  {isLogin ? "Create an account" : "Sign in instead"}
                </Button>
              </form>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-center text-muted-foreground mt-6 text-sm"
            >
              By continuing, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </motion.p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Auth;