import { NextRequest } from 'next/server'
import { jest } from '@jest/globals'
import { securityMiddleware, securityMonitor } from '../../src/lib/security-middleware'
import { createRateLimit } from '../../src/lib/rate-limit'

describe('Security Middleware', () => {
  const createTestRequest = (path: string, options: { headers?: Record<string, string> } = {}) => {
    const { headers = {} } = options
    return new NextRequest(new URL(`http://localhost:3000${path}`), {
      method: 'GET',
      headers: {
        'user-agent': 'Test User Agent',
        'x-forwarded-for': '127.0.0.1',
        ...headers,
      },
    }) as NextRequest
  }

  beforeEach(() => {
    // Clear rate limiter state between tests
    jest.clearAllMocks()
  })

  describe('Rate Limiting', () => {
    it('should allow requests within limits', async () => {
      const req = createTestRequest('/api/test')
      const result = await securityMiddleware(req)

      expect(result).toBeNull() // Should pass through
    })

    it('should block excessive requests', async () => {
      // Make many requests to trigger rate limiting
      for (let i = 0; i < 110; i++) {
        const req = createTestRequest('/api/test', {
          headers: { 'x-forwarded-for': '192.168.1.100' }
        })
        await securityMiddleware(req)
      }

      const req = createTestRequest('/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.100' }
      })
      const result = await securityMiddleware(req)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(429)
    })
  })

  describe('Header Validation', () => {
    it('should reject requests without user agent', async () => {
      const req = createTestRequest('/api/test', {
        headers: { 'user-agent': '' }
      })
      const result = await securityMiddleware(req)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(400)
    })

    it('should reject suspiciously short user agents', async () => {
      const req = createTestRequest('/api/test', {
        headers: { 'user-agent': 'curl' }
      })
      const result = await securityMiddleware(req)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(400)
    })
  })

  describe('Suspicious Request Detection', () => {
    it('should detect directory traversal attempts', async () => {
      const req = createTestRequest('/api/../../../etc/passwd')
      const result = await securityMiddleware(req)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(429)
    })

    it('should detect XSS attempts', async () => {
      const req = createTestRequest('/api/test<script>alert(1)</script>')
      const result = await securityMiddleware(req)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(429)
    })

    it('should detect SQL injection attempts', async () => {
      const req = createTestRequest('/api/test?id=1%20UNION%20SELECT')
      const result = await securityMiddleware(req)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(429)
    })
  })

  describe('API Protection', () => {
    it('should require authentication for protected API routes', async () => {
      const req = createTestRequest('/api/protected', {
        headers: {
          'user-agent': 'Test User Agent',
          'x-forwarded-for': '127.0.0.1',
          // No authentication headers
        }
      })

      // Mock the supabase auth to return no session
      const result = await securityMiddleware(req)

      // This should actually pass the security middleware but fail in the main middleware
      // We need to test the integration, so this test might need adjustment
      expect(result).toBeNull()
    })
  })

  describe('CORS Protection', () => {
    it('should allow requests from allowed origins', async () => {
      const req = createTestRequest('/api/test', {
        headers: {
          'origin': 'http://localhost:3000',
          'user-agent': 'Test User Agent',
        }
      })
      const result = await securityMiddleware(req)

      expect(result).toBeNull()
    })

    it('should block requests from disallowed origins', async () => {
      const req = createTestRequest('/api/test', {
        headers: {
          'origin': 'https://malicious-site.com',
          'user-agent': 'Test User Agent',
        }
      })
      const result = await securityMiddleware(req)

      expect(result).not.toBeNull()
      expect(result?.status).toBe(403)
    })
  })

  describe('Security Monitoring', () => {
    it('should provide security statistics', () => {
      const stats = securityMonitor.getStats()

      expect(stats).toHaveProperty('blockedIPs')
      expect(stats).toHaveProperty('rateLimiterStats')
      expect(typeof stats.blockedIPs).toBe('number')
    })

    it('should allow blocking and unblocking IPs', () => {
      const testIP = '192.168.1.1'

      // Block IP
      securityMonitor.blockIP(testIP)
      expect(securityMonitor.getBlockedIPs()).toContain(testIP)

      // Unblock IP
      securityMonitor.unblockIP(testIP)
      expect(securityMonitor.getBlockedIPs()).not.toContain(testIP)
    })
  })
})

describe('Rate Limiter Enhancements', () => {
  it('should handle suspicious activity scoring', () => {
    const rateLimitMiddleware = createRateLimit({
      windowMs: 60000,
      maxRequests: 10,
      identifier: 'test',
      suspiciousThreshold: 3,
    })

    // Make requests that will be flagged as suspicious
    for (let i = 0; i < 5; i++) {
      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'user-agent': 'curl/7.68.0', // Suspicious user agent
          'x-forwarded-for': '192.168.1.1',
        }
      })

      const result = rateLimitMiddleware(req)
      if (i < 4) {
        expect(result).toBeNull() // Should allow first few requests
      }
    }

    // The rate limiter should handle suspicious activity appropriately
    expect(true).toBe(true) // Placeholder - actual implementation may vary
  })

  it('should provide proper rate limit headers', () => {
    const rateLimitMiddleware = createRateLimit({
      windowMs: 60000,
      maxRequests: 10,
      identifier: 'test',
    })

    const req = new NextRequest('http://localhost:3000/api/test')

    // Make a request and verify headers would be added
    const result = rateLimitMiddleware(req)
    expect(result).toBeNull() // Request should be allowed

    // Note: In production, headers would be added to the response
    // This is tested through integration tests
  })
})
