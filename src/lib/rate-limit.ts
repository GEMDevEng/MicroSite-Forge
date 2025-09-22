// Simple in-memory rate limiter for API calls
// In production, consider using Redis or a more sophisticated solution

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests allowed in the window
  identifier: string // What to use as identifier (ip, userId, etc.)
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()

  check(
    identifier: string,
    options: RateLimitOptions
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const key = `${options.identifier}:${identifier}`
    const now = Date.now()
    const entry = this.store.get(key)

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.store.delete(key)
    }

    const currentEntry = this.store.get(key)

    if (!currentEntry) {
      // First request in window
      const resetTime = now + options.windowMs
      this.store.set(key, { count: 1, resetTime })
      return {
        allowed: true,
        remaining: options.maxRequests - 1,
        resetTime,
      }
    }

    if (currentEntry.count >= options.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: currentEntry.resetTime,
      }
    }

    // Increment counter
    currentEntry.count += 1
    this.store.set(key, currentEntry)

    return {
      allowed: true,
      remaining: options.maxRequests - currentEntry.count,
      resetTime: currentEntry.resetTime,
    }
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    const keys = Array.from(this.store.keys())
    for (const key of keys) {
      const entry = this.store.get(key)
      if (entry && now > entry.resetTime) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.store.delete(key))
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter()

// Clean up old entries every 10 minutes
setInterval(() => rateLimiter.cleanup(), 10 * 60 * 1000)

/**
 * Rate limiting middleware for API routes
 */
export function createRateLimit(options: RateLimitOptions) {
  return function rateLimitMiddleware(request: Request): Response | null {
    // Get identifier from headers or use IP
    const identifier = getRequestIdentifier(request)

    const result = rateLimiter.check(identifier, options)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      )
    }

    // Return null to continue processing
    return null
  }
}

/**
 * Get request identifier (IP address, user ID, etc.)
 */
function getRequestIdentifier(request: Request): string {
  try {
    // Try to get IP from headers (works with Vercel, Netlify, etc.)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfIP = request.headers.get('cf-connecting-ip')

    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    if (realIP) {
      return realIP
    }
    if (cfIP) {
      return cfIP
    }
  } catch {
    // Fallback if headers aren't available
  }

  // Ultimate fallback - use a generic identifier
  // In production, you'd want better IP detection
  return 'anonymous'
}

/**
 * Pre-configured rate limiters for different use cases
 */

// AI API calls (expensive operations)
export const aiApiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  identifier: 'ai-api',
})

// Research operations
export const researchRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20, // 20 research requests per 5 minutes
  identifier: 'research',
})

// Content generation
export const contentGenerationRateLimit = createRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 5, // 5 content generations per 10 minutes
  identifier: 'content',
})

// Site creation (most expensive)
export const siteCreationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 site creations per hour
  identifier: 'site-creation',
})

// Domain checking
export const domainCheckRateLimit = createRateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  maxRequests: 50, // 50 domain checks per 2 minutes
  identifier: 'domain-check',
})
