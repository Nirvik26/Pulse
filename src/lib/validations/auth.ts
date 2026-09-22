import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must include at least one lowercase letter")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[0-9]/, "Must include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const registerApiSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

export type RegisterApiInput = z.infer<typeof registerApiSchema>;

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: "Weak" | "Fair" | "Good" | "Strong";
  color: string;
  requirements: PasswordRequirement[];
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  const requirements: PasswordRequirement[] = [
    { id: "length", label: "At least 8 characters", met: password.length >= 8 },
    { id: "lowercase", label: "One lowercase letter", met: /[a-z]/.test(password) },
    { id: "uppercase", label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { id: "number", label: "One number", met: /[0-9]/.test(password) },
    { id: "special", label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = requirements.filter((r) => r.met).length;

  if (metCount <= 2) {
    return {
      score: 1,
      label: "Weak",
      color: "bg-red-500",
      requirements,
    };
  }

  if (metCount === 3) {
    return {
      score: 2,
      label: "Fair",
      color: "bg-amber-500",
      requirements,
    };
  }

  if (metCount === 4) {
    return {
      score: 3,
      label: "Good",
      color: "bg-blue-500",
      requirements,
    };
  }

  return {
    score: 4,
    label: "Strong",
    color: "bg-emerald-500",
    requirements,
  };
}
