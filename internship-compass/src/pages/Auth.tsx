import { useState } from "react";
import { motion } from "framer-motion";
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
    defaultValues: { name: "", email: "", password: "", password_confirmation: "" },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      // Laravel Controller returns: { user: {...}, token: "..." }
      const user = response?.user;
      const token = response?.token;

      if (user && token) {
        // Store both user data and the token
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token); 
        
        // Trigger event so Navbar updates immediately
        window.dispatchEvent(new Event("userUpdated"));

        const userType = user.user_type?.toString().toLowerCase().trim();

        if (userType === "admin") {
          toast.success(`Welcome back, Admin ${user.name}!`);
          navigate("/dashboard", { replace: true });
        } else {
          toast.success("Login successful!");
          navigate("/", { replace: true });
        }
      } else {
        console.error("Malformed response from server", response);
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
      // Redirect user to Login view
      setIsLogin(true);
      registerForm.reset();
      loginForm.setValue("email", registerForm.getValues("email"));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 lg:pt-32 pb-16 min-h-screen flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-2xl shadow-elevated border border-border overflow-hidden"
            >
              <div className="gradient-hero p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-background/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <Lock className="h-8 w-8 text-primary-foreground" />
                </motion.div>
                <h1 className="text-2xl font-bold text-primary-foreground">
                  {isLogin ? "Sign In" : "Create Account"}
                </h1>
                <p className="text-primary-foreground/80 mt-2">
                  {isLogin
                    ? "Access your dashboard and applications"
                    : "Join our platform to start your journey"}
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
                        })
                      )
                }
                className="p-8 space-y-6"
              >
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        {...registerForm.register("name")}
                        className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.name.message}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      {...(isLogin ? loginForm.register("email") : registerForm.register("email"))}
                      className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                    />
                    {(isLogin ? loginForm.formState.errors.email : registerForm.formState.errors.email) && (
                      <p className="text-sm text-destructive mt-1">
                        {(isLogin ? loginForm.formState.errors.email?.message : registerForm.formState.errors.email?.message)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
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
                    {(isLogin ? loginForm.formState.errors.password : registerForm.formState.errors.password) && (
                      <p className="text-sm text-destructive mt-1">
                        {(isLogin ? loginForm.formState.errors.password?.message : registerForm.formState.errors.password?.message)}
                      </p>
                    )}
                  </div>
                </div>

                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}>
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password_confirmation"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...registerForm.register("password_confirmation")}
                        className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                      />
                      {registerForm.formState.errors.password_confirmation && (
                        <p className="text-sm text-destructive mt-1">
                          {registerForm.formState.errors.password_confirmation.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-end">
                    <button type="button" className="text-sm text-primary hover:text-primary/80 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                )}

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
                  onClick={() => {
                    setIsLogin(!isLogin);
                    loginForm.reset();
                    registerForm.reset();
                  }}
                >
                  {isLogin ? "Create an account" : "Sign in instead"}
                </Button>
              </form>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
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