import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const currentYear = new Date().getFullYear();

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
  dob_month: z.string().min(1, { message: "Month is required" }),
  dob_day: z.string().min(1, { message: "Day is required" }),
  dob_year: z.string().min(4, { message: "Year is required" }),
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
  const year = Number(data.dob_year);
  const month = Number(data.dob_month);
  const day = Number(data.dob_day);
  if (!year || !month || !day) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}, {
  message: "Invalid date of birth",
  path: ["dob_day"], // attach error to day field
}).refine((data) => {
  const birthDate = new Date(
    Number(data.dob_year),
    Number(data.dob_month) - 1,
    Number(data.dob_day)
  );
  const age = new Date().getFullYear() - birthDate.getFullYear();
  return age >= 13;
}, {
  message: "You must be at least 15 years old",
  path: ["dob_year"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;