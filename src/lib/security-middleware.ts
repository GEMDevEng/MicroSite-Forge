import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter } from './rate-limit'
import { logger } from './logger'

// Security middleware configuration
interface SecurityConfig {
  enableRateLimiting: boolean
  enableIpBlocking: boolean
  enableSuspiciousRequestDetection: boolean
  enableRequestLogging: boolean
}

const defaultConfig: SecurityConfig = {
  enableRateLimiting: true,
  enableIpBlocking: true,
  enableSuspiciousRequestDetection: true,
  enableRequestLogging: process.env.NODE_ENV === 'production',
}

// Suspicious patterns to detect
const SUSPICIOUS_PATTERNS = {
  paths: [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /eval\(/i, // Code injection
    /javascript:/i, // JavaScript injection
    /vbscript:/i, // VBScript injection
    /onload=/i, // Event handler injection
    /onerror=/i, // Error handler injection
  ],
  headers: [
    /^.{0,10}$/, // Too short user agent
    /curl|wget|python|java/i, // Automated tools
    /scanner|bot|crawler/i, // Bots and scanners
  ],
  userAgents: [
    /^-$/, // Empty user agent
    /^Mozilla\/.*/, // Generic Mozilla (often spoofed)
    /PostmanRuntime/i, // API testing tools
    /Insomnia/i, // API testing tools
  ],
}

// Blocked IP addresses (can be loaded from a database in production)
const BLOCKED_IPS: Set<string> = new Set([
  // Add known malicious IPs here
  // Example: '192.168.1.100'
])

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  'http://localhost:3000',
  'https://localhost:3000',
].filter(Boolean)

// Rate limiting configurations for different endpoints
const RATE_LIMITS = {
  default: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 15 minutes
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // Stricter for auth
  api: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
  ai: { windowMs: 60 * 1000, maxRequests: 10 }, // Tighter for AI
  create: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // Stricter for creation
}

/**
 * Enhanced security middleware with multiple layers of protection
 */
export async function securityMiddleware(
  request: NextRequest,
  config: Partial<SecurityConfig> = {}
): Promise<NextResponse | null> {
  const securityConfig = { ...defaultConfig, ...config }
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''
  const path = request.nextUrl.pathname
  const method = request.method

  // Log request for security monitoring
  if (securityConfig.enableRequestLogging) {
    logger.info('Security middleware check', {
      ip,
      method,
      path,
      userAgent: userAgent.substring(0, 100), // Truncate for log safety
      timestamp: new Date().toISOString(),
    })
  }

  // 1. Check blocked IPs
  if (securityConfig.enableIpBlocking && BLOCKED_IPS.has(ip)) {
    logger.warn('Blocked IP attempted access', { ip, path })
    return createSecurityResponse(
      'Access denied',
      403,
      'IP address is blocked'
    )
  }

  // 2. Validate request headers
  const headerValidation = validateHeaders(request)
  if (!headerValidation.valid) {
    logger.warn('Invalid headers detected', {
      ip,
      path,
      reason: headerValidation.reason || 'Unknown validation error',
      headers: Object.fromEntries(request.headers),
    })
    return createSecurityResponse(
      'Bad request',
      400,
      headerValidation.reason || 'Request validation failed'
    )
  }

  // 3. Detect suspicious requests
  if (securityConfig.enableSuspiciousRequestDetection) {
    const suspiciousCheck = detectSuspiciousRequest(request, path)
    if (suspiciousCheck.isSuspicious) {
      logger.warn('Suspicious request detected', {
        ip,
        path,
        reason: suspiciousCheck.reason,
        userAgent,
      })

      // Implement progressive blocking - could block temporarily
      return createSecurityResponse(
        'Suspicious activity detected',
        429,
        suspiciousCheck.reason || 'Suspicious activity detected'
      )
    }
  }

  // 4. Apply rate limiting
  if (securityConfig.enableRateLimiting) {
    const rateLimitConfig = getRateLimitForPath(path)
    const rateLimitResult = rateLimiter.check(ip, {
      ...rateLimitConfig,
      identifier: 'security',
      blockDurationMs: 15 * 60 * 1000, // 15 minutes block
      suspiciousThreshold: 5,
    }, request)

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded', {
        ip,
        path,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime,
        isBlocked: rateLimitResult.isBlocked,
        reason: rateLimitResult.blockReason,
      })

      const response = createSecurityResponse(
        rateLimitResult.blockReason || 'Rate limit exceeded',
        rateLimitResult.isBlocked ? 403 : 429,
        `Too many requests. Try again later.`,
        rateLimitResult.headers
      )

      return response
    }

    // Add rate limiting headers to response
    // Note: We'll need to modify the response after route handling
  }

  // 5. CORS validation for API routes
  if (path.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    if (origin && !ALLOWED_ORIGINS.some(allowed => allowed === origin)) {
      logger.warn('CORS violation', { ip, origin, path })
      return createSecurityResponse(
        'CORS policy violation',
        403,
        'Origin not allowed'
      )
    }
  }

  // Request passed all security checks
  return null
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Try various headers for IP detection
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  const clientIP = request.headers.get('x-client-ip')

  // Take the first IP from forwarded header (before proxies)
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) return realIP
  if (cfIP) return cfIP
  if (clientIP) return clientIP

  // Fallback - in development this might be localhost
  try {
    // Note: NextRequest doesn't have an ip property in the types
    // This is a fallback and may not be accurate in all environments
    return '127.0.0.1'
  } catch {
    return 'unknown'
  }
}

/**
 * Validate request headers
 */
function validateHeaders(request: NextRequest): { valid: boolean; reason?: string } {
  const userAgent = request.headers.get('user-agent')
  const contentLength = request.headers.get('content-length')

  // Check for missing user agent (automated requests)
  if (!userAgent) {
    return { valid: false, reason: 'Missing user agent' }
  }

  // Check for suspiciously short user agents
  if (userAgent.length < 10 && !userAgent.includes('curl')) {
    return { valid: false, reason: 'Suspiciously short user agent' }
  }

  // Check content length for potential DoS
  if (contentLength) {
    const length = parseInt(contentLength)
    if (length > 10 * 1024 * 1024) { // 10MB limit
      return { valid: false, reason: 'Request too large' }
    }
  }

  return { valid: true }
}

/**
 * Detect suspicious request patterns
 */
function detectSuspiciousRequest(request: NextRequest, path: string): {
  isSuspicious: boolean;
  reason?: string;
} {
  const userAgent = request.headers.get('user-agent') || ''
  const query = request.nextUrl.search

  // Check path for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS.paths) {
    if (pattern.test(path) || pattern.test(query)) {
      return { isSuspicious: true, reason: 'Suspicious path pattern detected' }
    }
  }

  // Check user agent patterns
  for (const pattern of SUSPICIOUS_PATTERNS.userAgents) {
    if (pattern.test(userAgent)) {
      // Allow legitimate development tools
      if (!isAllowedBot(userAgent)) {
        return { isSuspicious: true, reason: 'Suspicious user agent detected' }
      }
    }
  }


  return { isSuspicious: false }
}

/**
 * Check if user agent is an allowed bot/development tool
 */
function isAllowedBot(userAgent: string): boolean {
  const allowed = [
    'googlebot',
    'bingbot',
    'vercel',
    'netlify',
    'github',
  ]

  return allowed.some(bot => userAgent.toLowerCase().includes(bot))
}

/**
 * Get appropriate rate limit configuration for a path
 */
function getRateLimitForPath(path: string) {
  if (path.startsWith('/api/auth/')) {
    return RATE_LIMITS.auth
  }
  if (path.startsWith('/api/ai/') || path.includes('/generate')) {
    return RATE_LIMITS.ai
  }
  if (path.includes('/create') || path.includes('/sites')) {
    return RATE_LIMITS.create
  }
  if (path.startsWith('/api/')) {
    return RATE_LIMITS.api
  }

  return RATE_LIMITS.default
}

/**
 * Create a standardized security response
 */
function createSecurityResponse(
  message: string,
  status: number,
  details: string,
  headers: Record<string, string> = {}
): NextResponse {
  const response = NextResponse.json(
    {
      error: message,
      message: details,
      timestamp: new Date().toISOString(),
      // Don't reveal sensitive information
    },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        ...headers,
      },
    }
  )

  return response
}

/**
 * Security monitoring utilities
 */
export const securityMonitor = {
  getBlockedIPs: () => Array.from(BLOCKED_IPS),
  getStats: () => ({
    blockedIPs: BLOCKED_IPS.size,
    rateLimiterStats: rateLimiter.getStats(),
  }),
  blockIP: (ip: string) => BLOCKED_IPS.add(ip),
  unblockIP: (ip: string) => BLOCKED_IPS.delete(ip),
}
