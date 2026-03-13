import { z } from "zod";

// College request validation
export const collegeRequestSchema = z.object({
  college_name: z
    .string()
    .trim()
    .min(1, "College name is required")
    .max(200, "College name must be less than 200 characters")
    .regex(
      /^[a-zA-Z0-9\s\-,.()&']+$/,
      "College name contains invalid characters"
    ),
});

// Quiz response validation
export const quizResponseSchema = z.object({
  quiz_type: z.enum(["career_dna", "course_fit", "future_fit"]),
  responses: z.record(z.string()),
  result: z.object({}).passthrough(), // Allow any object structure for result
});

// User reminder validation
export const userReminderSchema = z.object({
  deadline_id: z.string().uuid("Invalid deadline ID"),
  reminder_type: z.enum(["one_day", "three_days", "one_week"]),
});

// Profile update validation
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
    .optional(),
  native_state: z.string().trim().max(100).optional(),
  native_city: z.string().trim().max(100).optional(),
});

export type CollegeRequestInput = z.infer<typeof collegeRequestSchema>;
export type QuizResponseInput = z.infer<typeof quizResponseSchema>;
export type UserReminderInput = z.infer<typeof userReminderSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
