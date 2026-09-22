import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim()
    .optional(),
  image: z
    .string()
    .url("Invalid image URL")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(100, "Password is too long"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
