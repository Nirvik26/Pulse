import { z } from "zod";

export const projectStatusEnum = z.enum(["active", "completed", "archived"]);

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be a valid hex color code (e.g. #6366f1)")
    .default("#6366f1"),
  status: projectStatusEnum.default("active"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name cannot be empty")
    .max(100, "Project name cannot exceed 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be a valid hex color code")
    .optional(),
  status: projectStatusEnum.optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
