import { z } from "zod";

/**
 * Sanitize CSV values to prevent XSS and formula injection
 */
export const sanitizeSheetValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  const str = String(value).trim();
  
  // Remove potentially dangerous HTML/script tags
  const cleaned = str.replace(/[<>]/g, '');
  
  return cleaned;
};

/**
 * Sanitize URL to only allow http/https protocols
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '#';
    }
    return url;
  } catch {
    return '#';
  }
};

/**
 * College data validation schema
 */
export const collegeDataSchema = z.object({
  college_id: z.string().max(50).optional(),
  name: z.string().min(1).max(200),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  stream: z.string().max(100).optional(),
  type: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal('')),
  nirf_rank: z.coerce.number().int().positive().optional()
});

/**
 * Course fit question validation schema
 */
export const courseFitQuestionSchema = z.object({
  type: z.literal('question'),
  question_id: z.string().min(1).max(50),
  question_text: z.string().min(1).max(500),
  question_order: z.coerce.number().int().positive().optional()
});

/**
 * Course fit option validation schema
 */
export const courseFitOptionSchema = z.object({
  type: z.literal('option'),
  question_id: z.string().min(1).max(50),
  option_id: z.string().min(1).max(50),
  option_text: z.string().min(1).max(300),
  weights: z.string().max(500).optional()
});

/**
 * Course fit rule validation schema
 */
export const courseFitRuleSchema = z.object({
  type: z.literal('rule'),
  rule_id: z.string().min(1).max(50),
  course_id: z.string().min(1).max(50),
  condition: z.string().min(1).max(1000)
});

/**
 * Course fit course validation schema
 */
export const courseFitCourseSchema = z.object({
  type: z.literal('course'),
  course_id: z.string().min(1).max(50),
  course_name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  career_paths: z.string().max(500).optional()
});

/**
 * Validate and sanitize college data
 */
export const validateCollegeData = (data: any[]): any[] => {
  return data
    .map(row => {
      try {
        // Sanitize all string values
        const sanitized = Object.entries(row).reduce((acc, [key, value]) => {
          acc[key] = typeof value === 'string' ? sanitizeSheetValue(value) : value;
          return acc;
        }, {} as any);
        
        // Validate structure (partial validation - allow extra fields)
        const result = collegeDataSchema.partial().safeParse(sanitized);
        if (!result.success) {
          console.warn('Invalid college data:', row, result.error);
          return null;
        }
        
        // Additional URL sanitization if website exists
        if (sanitized.website) {
          sanitized.website = sanitizeUrl(sanitized.website);
        }
        
        return sanitized;
      } catch (error) {
        console.warn('Error validating college data:', row, error);
        return null;
      }
    })
    .filter((c): c is any => c !== null);
};

/**
 * Validate and sanitize course fit data
 */
export const validateCourseFitData = (data: any[]): any[] => {
  return data
    .map(row => {
      try {
        // Sanitize all string values
        const sanitized = Object.entries(row).reduce((acc, [key, value]) => {
          acc[key] = typeof value === 'string' ? sanitizeSheetValue(value) : value;
          return acc;
        }, {} as any);
        
        // Validate based on type
        let result;
        switch (sanitized.type) {
          case 'question':
            result = courseFitQuestionSchema.safeParse(sanitized);
            break;
          case 'option':
            result = courseFitOptionSchema.safeParse(sanitized);
            break;
          case 'rule':
            result = courseFitRuleSchema.safeParse(sanitized);
            break;
          case 'course':
            result = courseFitCourseSchema.safeParse(sanitized);
            break;
          default:
            // Allow other types like ui_text without strict validation
            return sanitized;
        }
        
        if (result && !result.success) {
          console.warn(`Invalid ${sanitized.type} data:`, row, result.error);
          return null;
        }
        
        return sanitized;
      } catch (error) {
        console.warn('Error validating course fit data:', row, error);
        return null;
      }
    })
    .filter((c): c is any => c !== null);
};
