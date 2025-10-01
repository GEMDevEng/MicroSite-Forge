import { z } from 'zod'

// Common validation patterns
const uuidSchema = z.string().uuid('Invalid UUID format')
const emailSchema = z.string().email('Invalid email address')
const phoneSchema = z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number format').optional()

// User validation schemas
export const userProfileSchema = z.object({
  stripe_id: z.string().optional(),
  twilio_sid: z.string().optional(),
  email: emailSchema.optional(),
  preferred_gateway: z.enum(['stripe', 'paypal', 'square']).optional(),
  gateway_credentials: z.record(z.any()).optional(),
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
  site_id: uuidSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema,
  phone: phoneSchema,
  message: z.string().max(1000, 'Message too long').optional(),
  source: z.string().default('website'),
  contact_info: z.record(z.any()).optional(),
})

export const updateLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  message: z.string().max(1000, 'Message too long').optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted']).optional(),
  score: z.number().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
  contact_info: z.record(z.any()).optional(),
})

export const leadCommunicationSchema = z.object({
  lead_id: uuidSchema,
  type: z.enum(['email', 'sms', 'call', 'note']),
  subject: z.string().max(200).optional(),
  content: z.string().min(1, 'Content is required').max(5000),
  template_id: uuidSchema.optional(),
  scheduled_at: z.string().datetime().optional(),
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
  email: emailSchema,
})

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Research validation schemas
export const nicheResearchSchema = z.object({
  niche: z.string().min(2, 'Niche must be at least 2 characters').max(100),
  targetAudience: z.string().optional(),
  geography: z.string().optional(),
  competitorAnalysis: z.boolean().default(false),
  domainSearch: z.boolean().default(true),
  maxDomains: z.number().min(1).max(50).default(10),
  maxDomainBudget: z.number().positive().optional(),
})

// Content generation schemas
export const contentGenerationSchema = z.object({
  keyword: z.string().min(2).max(100),
  contentType: z.enum(['blog-post', 'landing-page', 'about-us', 'services', 'contact-form']),
  niche: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'enthusiastic', 'educational']).optional(),
  wordCount: z.number().min(200).max(5000).optional(),
  includeImages: z.boolean().default(false),
})

export const websiteContentSchema = z.object({
  contents: z.array(contentGenerationSchema).min(1, 'At least one content piece required'),
})

// Site generation schema
export const siteGenerationSchema = z.object({
  niche: z.string().min(2, 'Niche must be at least 2 characters').max(100),
  domain: z.string().regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid domain format'),
  siteTitle: z.string().min(1, 'Site title is required').max(100),
  description: z.string().max(500).optional(),
  keywords: z.array(z.string()).min(1, 'At least one keyword required').max(10),
  targetAudience: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'enthusiastic', 'educational']).default('professional'),
  githubRepoName: z.string().regex(/^[a-zA-Z0-9._-]+$/, 'Invalid repository name').optional(),
})

// Analytics schemas
export const analyticsQuerySchema = z.object({
  type: z.enum(['dashboard', 'leads', 'revenue', 'sites', 'realtime']).optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  siteId: uuidSchema.optional(),
})

export const reportGenerationSchema = z.object({
  type: z.enum(['leads', 'revenue', 'performance', 'custom']),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  filters: z.record(z.any()).optional(),
  format: z.enum(['pdf', 'csv', 'json']).default('pdf'),
})

// Type exports
export type UserProfile = z.infer<typeof userProfileSchema>
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>
export type CreateSiteInput = z.infer<typeof createSiteSchema>
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>
export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type LeadCommunication = z.infer<typeof leadCommunicationSchema>
export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type NicheResearch = z.infer<typeof nicheResearchSchema>
export type ContentGeneration = z.infer<typeof contentGenerationSchema>
export type WebsiteContent = z.infer<typeof websiteContentSchema>
export type SiteGeneration = z.infer<typeof siteGenerationSchema>
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>
export type ReportGeneration = z.infer<typeof reportGenerationSchema>
export type SitesFilters = z.infer<typeof sitesFilterSchema>
export type LeadsFilters = z.infer<typeof leadsFilterSchema>
export type JobsFilters = z.infer<typeof jobsFilterSchema>
