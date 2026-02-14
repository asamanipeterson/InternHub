import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required" }),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, { message: "Last name is required" }),
  university: z.string().min(2, { message: "Institution is required" }),
  course: z.string().min(2, { message: "Course of study is required" }),
  year: z.string().min(1, { message: "Year/level is required" }),
  phone: z.string()
    .min(9, { message: "Phone number is too short" })
    .max(15, { message: "Phone number is too long" }),
  nationality: z.string().min(2, { message: "Nationality is required" }),
  gender: z.enum(
    ["Male", "Female", "Non-binary", "Other", "Prefer not to say"],
    { required_error: "Gender is required" }
  ),
  // Updated to single Date field
  date_of_birth: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "That's not a valid date",
  }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least 1 uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain at least 1 lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least 1 number" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Must contain at least 1 special character",
    }),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
}).refine((data) => {
  const today = new Date();
  const birthDate = new Date(data.date_of_birth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 15;
}, {
  message: "You must be at least 15 years old",
  path: ["date_of_birth"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;