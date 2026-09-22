import { z } from "zod";

export const taskStatusEnum = z.enum(["todo", "in-progress", "done"]);
export const taskPriorityEnum = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(150, "Task title cannot exceed 150 characters")
    .trim(),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional()
    .nullable(),
  status: taskStatusEnum.default("todo"),
  priority: taskPriorityEnum.default("medium"),
  dueDate: z
    .union([z.string(), z.date()])
    .optional()
    .nullable(),
  projectId: z.string().min(1, "Project ID is required"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title cannot be empty")
    .max(150, "Task title cannot exceed 150 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional()
    .nullable(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: z
    .union([z.string(), z.date()])
    .optional()
    .nullable(),
  projectId: z.string().optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
