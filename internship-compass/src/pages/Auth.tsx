import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
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
  ChevronDown,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
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

  const [nationalities, setNationalities] = useState<string[]>([]);
  const [nationalitiesLoading, setNationalitiesLoading] = useState(true);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      university: "",
      course: "",
      year: "",
      phone: "",
      nationality: "",
      gender: "Male",
      date_of_birth: undefined,
      email: "",
      password: "",
      password_confirmation: "",
    },
  });


  const ghanaUniversities: string[] = [
  // Public Universities
  "University of Ghana",
  "Kwame Nkrumah University of Science and Technology (KNUST)",
  "University of Cape Coast (UCC)",
  "University for Development Studies (UDS)",
  "University of Education, Winneba (UEW)",
  "University of Health and Allied Sciences (UHAS)",
  "University of Energy and Natural Resources (UENR)",
  "University of Mines and Technology (UMaT)",
  "University of Professional Studies, Accra (UPSA)",
  "C.K. Tedam University of Technology and Applied Sciences",
  "Simon Diedong Dombo University for Business and Integrated Development Studies",
  "Akenten Appiah-Menka University of Skills Training and Entrepreneurial Development",

  // Technical Universities
  "Accra Technical University",
  "Kumasi Technical University",
  "Cape Coast Technical University",
  "Takoradi Technical University",
  "Koforidua Technical University",
  "Ho Technical University",
  "Tamale Technical University",
  "Bolgatanga Technical University",
  "Sunyani Technical University",
  "Wa Technical University",

  // Private Universities
  "Ashesi University",
  "Central University",
  "Valley View University",
  "Pentecost University",
  "Methodist University Ghana",
  "Presbyterian University, Ghana",
  "Catholic University of Ghana",
  "Christian Service University",
  "Garden City University College",
  "Regent University College of Science and Technology",
  "Wisconsin International University College",
  "Lancaster University Ghana",
  "Academic City University College",
  "Accra Institute of Technology",
  "Knutsford University College",
  "Radford University College",
  "Mountcrest University College",
  "Zenith University College",
  "KAAF University",
  "Islamic University College, Ghana",
  "Ghana Baptist University College",
  "Ghana Christian University College",
  "African University College of Communications",
  "Regional Maritime University"
].sort();

  // Fetch nationalities
  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=demonyms,name');
        const data = await res.json();
        const list = data
          .map((c: any) => c.demonyms?.eng?.m || c.demonyms?.eng?.f)
          .filter((n: string | undefined) => n)
          .sort((a: string, b: string) => a.localeCompare(b));
        setNationalities(list);
      } catch (err) {
        console.error("Failed to load nationalities", err);
        setNationalities([
          "Ghanaian", "Nigerian", "American", "British", "Indian", "Kenyan",
          "South African", "Canadian", "Australian", "French"
        ]);
      } finally {
        setNationalitiesLoading(false);
      }
    };

    if (!isLogin) {
      fetchNationalities();
    }
  }, [isLogin]);

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

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (token) {
          localStorage.setItem("token", token);
        }
        window.dispatchEvent(new Event("userUpdated"));

        const userType = user.user_type?.toString().toLowerCase().trim() ?? "";

        if (userType === "admin") {
          toast.success(`Welcome back, Admin ${user.name}!`);
          navigate("/dashboard", { replace: true });
        } else if (userType === "mentor") {
          toast.success(`Welcome, Mentor ${user.name}!`);
          navigate("/mentor/dashboard", { replace: true });
        } else {
          toast.success(`Welcome, ${user.name}!`);
          navigate("/student/dashboard", { replace: true });
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
    mutationFn: (data: RegisterFormData) => {
      const payload = {
        ...data,
        date_of_birth: format(data.date_of_birth, "yyyy-MM-dd"),
      };
      return register(payload);
    },
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
    <div className="min-h-screen bg-foreground">
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
                    : registerForm.handleSubmit((data) => registerMutation.mutate(data))
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
                    {!isLogin && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <Label htmlFor="first_name">First Name <span className="text-red-600">*</span></Label>
                            <div className="relative mt-2">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="first_name"
                                placeholder="John"
                                {...registerForm.register("first_name")}
                                className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                              />
                            </div>
                            {registerForm.formState.errors.first_name && (
                              <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.first_name?.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="middle_name">Middle Name</Label>
                            <div className="relative mt-2">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="middle_name"
                                placeholder="Kofi"
                                {...registerForm.register("middle_name")}
                                className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="last_name">Last Name <span className="text-red-600">*</span></Label>
                            <div className="relative mt-2">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="last_name"
                                placeholder="Doe"
                                {...registerForm.register("last_name")}
                                className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                              />
                            </div>
                            {registerForm.formState.errors.last_name && (
                              <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.last_name?.message}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="university">Institution <span className="text-red-600">*</span></Label>
                          <div className="relative mt-2">
                            <School className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <select
                              id="university"
                              {...registerForm.register("university")}
                              className="pl-10 pr-10 h-12 w-full bg-secondary/50 border-border focus:border-primary rounded-md text-foreground appearance-none cursor-pointer"
                            >
                              <option value="">Select institution</option>
                              {ghanaUniversities.map((uni) => (
                                <option key={uni} value={uni}>
                                  {uni}
                                </option>
                              ))}
                            </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="course">Course <span className="text-red-600">*</span></Label>
                            <div className="relative mt-2">
                              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="course"
                                placeholder="Computer Science"
                                {...registerForm.register("course")}
                                className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="year">Year / Level <span className="text-red-600">*</span></Label>
                            <div className="relative mt-2">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="year"
                                placeholder="200"
                                {...registerForm.register("year")}
                                className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="phone">Phone Number <span className="text-red-600">*</span></Label>
                            <div className="relative mt-2">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input
                                id="phone"
                                placeholder="+233..."
                                {...registerForm.register("phone")}
                                className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="nationality">Nationality <span className="text-red-600">*</span></Label>
                            <div className="relative mt-2">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                              <select
                                id="nationality"
                                {...registerForm.register("nationality")}
                                className="pl-10 pr-10 h-12 w-full bg-secondary/50 border-border focus:border-primary rounded-md text-foreground appearance-none cursor-pointer"
                              >
                                <option value="">Select nationality</option>
                                {nationalities.map((nat) => (
                                  <option key={nat} value={nat}>{nat}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="gender">Gender <span className="text-red-600">*</span></Label>
                            <div className="relative mt-2">
                              <select
                                id="gender"
                                {...registerForm.register("gender")}
                                className="pl-3 pr-10 h-12 w-full bg-secondary/50 border-border focus:border-primary rounded-md text-foreground appearance-none cursor-pointer"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-binary">Non-binary</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>

                          {/* DatePicker Integration */}
                          <div>
                            <Label>Date of Birth <span className="text-red-600">*</span></Label>
                            <div className="relative mt-2">
                              <Controller
                                control={registerForm.control}
                                name="date_of_birth"
                                render={({ field }) => (
                                  <DatePicker
                                    selected={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    dateFormat="yyyy-MM-dd"
                                    maxDate={new Date()}
                                    showYearDropdown
                                    scrollableYearDropdown
                                    yearDropdownItemNumber={100}
                                    placeholderText="Select date"
                                    className="w-full pl-10 h-12 bg-secondary/50 border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                                    calendarClassName="bg-card border border-border shadow-lg rounded-md"
                                  />
                                )}
                              />
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                            </div>
                            {registerForm.formState.errors.date_of_birth && (
                              <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.date_of_birth?.message}</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="email">Email Address <span className="text-red-600">*</span></Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="student@university.edu"
                          {...(isLogin ? loginForm.register("email") : registerForm.register("email"))}
                          className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password">Password <span className="text-red-600">*</span></Label>
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
                      {!isLogin && <PasswordStrength password={passwordValue} />}
                    </div>

                    {!isLogin && (
                      <div>
                        <Label htmlFor="password_confirmation">Confirm Password <span className="text-red-600">*</span></Label>
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
                      </div>
                    )}

                    {isLogin && (
                      <div className="flex items-center justify-end">
                        <Link to="/forgot-password" size="sm" className="text-sm text-primary hover:underline">Forgot password?</Link>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full h-12 font-semibold"
                  disabled={loginMutation.isPending || registerMutation.isPending}
                >
                  {loginMutation.isPending || registerMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>{isLogin ? "Sign In" : "Create Account"} <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-4 text-muted-foreground">
                      {isLogin ? "New here?" : "Already have an account?"}
                    </span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full h-12" onClick={toggleForm}>
                  {isLogin ? "Create an account" : "Sign in instead"}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Auth;