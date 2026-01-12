// src/schemas/validation.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  university: z.string().min(2, { message: "University is required" }),
  course: z.string().min(2, { message: "Course of study is required" }),
  year: z.string().min(2, { message: "Year/level is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string()
    .min(9, { message: "Phone number is too short" })
    .max(15, { message: "Phone number is too long" }),
  nationality: z.string().min(2, { message: "Nationality is required" }),
 password: z.string()
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
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;