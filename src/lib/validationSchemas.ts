import { z } from 'zod';

// College request validation
export const collegeRequestSchema = z.object({
  college_name: z.string()
    .trim()
    .min(1, "College name is required")
    .max(200, "College name must be less than 200 characters")
    .regex(/^[a-zA-Z0-9\s.,&'-]+$/, "College name contains invalid characters")
});

// Quiz response validation
export const quizResponseSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  quiz_type: z.enum(['career_dna', 'course_fit', 'future_fit']),
  responses: z.record(z.string()).refine(
    (responses) => Object.keys(responses).length > 0,
    "At least one response is required"
  ),
  result: z.any() // Result structure varies by quiz type
});

// User reminder validation
export const reminderSchema = z.object({
  deadline_id: z.string().uuid("Invalid deadline ID"),
  reminder_type: z.enum(['email', 'whatsapp', 'sms']),
  reminder_date: z.string().datetime("Invalid reminder date")
});

// Profile update validation
export const profileUpdateSchema = z.object({
  full_name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "Name contains invalid characters")
    .optional(),
  native_state: z.string().max(100).optional(),
  native_city: z.string().max(100).optional()
});

// Onboarding validation
export const onboardingSchema = z.object({
  full_name: z.string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "Name contains invalid characters"),
  phone: z.string()
    .regex(/^\+?91?[6-9]\d{9}$/, "Please enter a valid Indian mobile number")
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      const normalized = digits.startsWith('91') ? digits.substring(2) : digits;
      // Reject all same digits
      return !/^(\d)\1{9}$/.test(normalized);
    }, "Phone number appears to be invalid"),
  exam_type: z.enum(['JEE', 'EAMCET', 'KCET', 'NEET', 'BITSAT', 'COMEDK', 'Other'], {
    errorMap: () => ({ message: "Please select an exam type" })
  }),
  exam_marks: z.string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), "Exam marks must be a valid number")
    .refine((val) => !val || parseInt(val) >= 0, "Exam marks cannot be negative")
    .refine((val) => !val || parseInt(val) <= 1000000, "Exam marks seems too high"),
  category: z.enum(['General', 'OBC', 'SC', 'ST', 'EWS'], {
    errorMap: () => ({ message: "Please select a category" })
  }),
  dream_college_ids: z.array(z.string().trim().max(200))
    .min(1, "At least one dream college is required")
    .max(5, "Maximum 5 dream colleges allowed")
});

// Auth: email or phone + password
const emailSchema = z.string().trim().min(1, "Email is required").email("Invalid email");

// Only 10 digits: strip non-digits, optional 91 prefix, then must be 10 digits
const phoneSchema = z
  .string()
  .trim()
  .min(1, "Mobile number is required")
  .refine((val) => {
    const digits = val.replace(/\D/g, "");
    const ten = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
    return ten.length === 10 && /^\d{10}$/.test(ten);
  }, "Enter a valid 10-digit mobile number");

export const loginSchema = z.object({
  emailOrPhone: z.string().trim().min(1, "Enter your email or mobile number"),
  password: z.string().min(1, "Password is required"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: emailSchema,
  phone: phoneSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignupSchema = z.infer<typeof signupSchema>;

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: emailSchema,
  mobile: phoneSchema,
});

export type LeadFormSchema = z.infer<typeof leadFormSchema>;

export const heroLeadFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  mobile: phoneSchema,
  email: emailSchema,
});

export type HeroLeadFormSchema = z.infer<typeof heroLeadFormSchema>;
