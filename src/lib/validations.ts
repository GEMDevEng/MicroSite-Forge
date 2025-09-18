import { z } from 'zod'

// User validation schemas
export const userProfileSchema = z.object({
  stripe_id: z.string().optional(),
  twilio_sid: z.string().optional(),
  email: z.string().email().optional(),
})

export const updateUserProfileSchema = userProfileSchema

// Site validation schemas
export const createSiteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  domain: z.string().url().optional().or(z.literal('')),
})

export const updateSiteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  domain: z.string().url().optional().or(z.literal('')).optional(),
  status: z.enum(['pending', 'live', 'error']).optional(),
  github_repo: z.string().url().optional().or(z.literal('')).optional(),
  netlify_url: z.string().url().optional().or(z.literal('')).optional(),
})

// Leads validation schemas
export const createLeadSchema = z.object({
  site_id: z.string().uuid('Invalid site ID'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().optional(),
  source: z.string().default('website'),
})

export const updateLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted']).optional(),
})

// Jobs validation schemas
export const createJobSchema = z.object({
  type: z.string().min(1, 'Job type is required'),
  data: z.record(z.any()),
})

export const updateJobSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  result: z.record(z.any()).optional(),
  error: z.string().optional(),
})

// Search/filter schemas
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(50).optional(),
  offset: z.number().min(0).default(0).optional(),
})

export const sitesFilterSchema = paginationSchema.extend({
  status: z.enum(['pending', 'live', 'error']).optional(),
})

export const leadsFilterSchema = paginationSchema.extend({
  site_id: z.string().uuid().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted']).optional(),
})

export const jobsFilterSchema = paginationSchema.extend({
  type: z.string().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
})

// Auth validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

// Type exports
export type CreateSiteInput = z.infer<typeof createSiteSchema>
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>
export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type SitesFilters = z.infer<typeof sitesFilterSchema>
export type LeadsFilters = z.infer<typeof leadsFilterSchema>
export type JobsFilters = z.infer<typeof jobsFilterSchema>
