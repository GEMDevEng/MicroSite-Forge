# Security Configuration Guide

This guide documents the comprehensive security measures implemented in MicroSite Forge as part of Phase 1 Security Hardening.

## Overview

The security implementation includes multiple layers of protection:

1. **Automated Security Scanning** - Continuous monitoring and vulnerability detection
2. **Enhanced Security Headers** - Protection against common web vulnerabilities
3. **Advanced Rate Limiting** - Protection against abuse and DoS attacks
4. **API Security Middleware** - Multi-layered request validation and protection
5. **Security Monitoring & Alerting** - Real-time threat detection and response

## 1. Automated Security Scanning

### GitHub Actions Security Workflows

Located in `.github/workflows/security.yml`, the security scanning pipeline includes:

#### CodeQL Analysis
- **Purpose**: Static code analysis for security vulnerabilities
- **Triggers**: Push and PR on main/develop branches, daily schedule
- **Coverage**: JavaScript/TypeScript application code
- **Results**: Uploaded to GitHub Security tab

#### Dependency Vulnerability Scanning
- **Tools**: npm audit, Snyk, Trivy
- **Triggers**: All pushes to main/develop
- **Alerts**: High-severity vulnerabilities flagged automatically

#### Secret Scanning
- **Tools**: TruffleHog OSS
- **Coverage**: Repository content and Git history
- **Detection**: Leaked secrets, tokens, and credentials

#### Container Security (when applicable)
- **Tools**: Trivy container scanning
- **Trigger**: Changes to Dockerfile
- **Coverage**: Container images and dependencies

#### OpenSSF Scorecard
- **Purpose**: Overall security posture assessment
- **Metrics**: Code review, CI/CD security, dependency management, etc.

#### API Security Testing
- **Tools**: Artillery for load testing
- **Purpose**: Rate limiting and API abuse detection
- **Results**: Security test reports archived

### Configuration

```yaml
# Key settings in .github/workflows/security.yml
permissions:
  contents: read
  security-events: write  # Required for security results upload

jobs:
  codeql-analysis:
    strategy:
      matrix:
        language: ['javascript-typescript', 'python']
```

## 2. Security Headers Implementation

### Next.js Configuration

Located in `next.config.js`, comprehensive security headers are applied:

#### Core Security Headers
```javascript
{
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN', // Changed from DENY for legitimate embeds
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}
```

#### Advanced Security Headers
```javascript
{
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), ...',
}
```

#### Enhanced Content Security Policy (CSP)
```javascript
'Content-Security-Policy': [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co ...",
  "frame-src 'self' https://checkout.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests"
].join('; ')
```

### API-Specific Headers
```javascript
{
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'X-Robots-Tag': 'noindex, nofollow',
}
```

### Static Asset Headers
```javascript
{
  'Cache-Control': 'public, max-age=31536000, immutable',
}
```

## 3. Rate Limiting Enhancement

### Enhanced Rate Limiter

Located in `src/lib/rate-limit.ts`, the rate limiting system provides:

#### Features
- **Suspicious Activity Detection**: Monitors for malicious patterns
- **Progressive Blocking**: Temporary blocks for repeated violations
- **IP Tracking**: Advanced IP identification through multiple headers
- **Request Fingerprinting**: Enhanced identification mechanisms

#### Rate Limiting Configurations
```typescript
const RATE_LIMITS = {
  default: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 15 minutes
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },     // Stricter for auth
  api: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
  ai: { windowMs: 60 * 1000, maxRequests: 10 },           // Tighter for AI
  create: { windowMs: 60 * 60 * 1000, maxRequests: 3 },   // Stricter for creation
}
```

#### Suspicious Request Detection
```typescript
const SUSPICIOUS_PATTERNS = {
  paths: [/\.\./, /<script/i, /union.*select/i, /eval\(/i],
  userAgents: [/^-$/, /^Mozilla\/.*/, /PostmanRuntime/i],
}
```

## 4. API Security Middleware

### Advanced Security Middleware

Located in `src/lib/security-middleware.ts`, provides multi-layered protection:

#### Protection Layers
1. **IP Blocking**: Maintains list of blocked malicious IPs
2. **Header Validation**: Checks for required and valid headers
3. **Suspicious Request Detection**: Pattern-based attack detection
4. **Rate Limiting**: Endpoint-specific rate limiting
5. **CORS Validation**: Origin-based access control

#### Configuration
```typescript
const defaultConfig: SecurityConfig = {
  enableRateLimiting: true,
  enableIpBlocking: true,
  enableSuspiciousRequestDetection: true,
  enableRequestLogging: process.env.NODE_ENV === 'production',
}
```

#### Request Validation
```typescript
function validateHeaders(request: NextRequest): { valid: boolean; reason?: string } {
  // Check user agent presence and validity
  // Validate content length for DoS protection
  // Implement size limits to prevent abuse
}
```

## 5. Middleware Integration

### Main Middleware Pipeline

Located in `middleware.ts`, orchestrates security layers:

```typescript
export async function middleware(req: NextRequest) {
  // 1. Security middleware (rate limiting, suspicious detection, etc.)
  const securityResponse = await securityMiddleware(req, {...})
  if (securityResponse) return securityResponse

  // 2. Authentication checks
  const { data: { session } } = await supabase.auth.getSession()

  // 3. Auth-specific security
  if (path.startsWith('/api/') && unauthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 4. Add response headers
  return addSecurityHeaders(response, req)
}
```

### Security Monitoring Integration
```typescript
function addSecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const stats = securityMonitor.getStats()
  response.headers.set('X-Security-Status', `blocked:${stats.blockedIPs},active:${stats.rateLimiterStats.totalKeys}`)
  return response
}
```

## 6. Security Monitoring & Alerting

### Real-time Monitoring

The system provides comprehensive monitoring capabilities:

#### Statistics Collection
```typescript
export const securityMonitor = {
  getBlockedIPs: () => Array.from(BLOCKED_IPS),
  getStats: () => ({
    blockedIPs: BLOCKED_IPS.size,
    rateLimiterStats: rateLimiter.getStats(),
  }),
  blockIP: (ip: string) => BLOCKED_IPS.add(ip),
  unblockIP: (ip: string) => BLOCKED_IPS.delete(ip),
}
```

#### Logging Integration
Security events are logged to the existing logging system for correlation and alerting.

### Alert Triggers
- Rate limit violations beyond thresholds
- Suspicious request pattern detection
- Blocked IP attempts
- Authentication failures from same IP
- Unusual traffic patterns

## 7. Testing & Validation

### Security Test Suite

Located in `tests/integration/security.test.ts`, comprehensive test coverage:

#### Test Categories
- Rate limiting functionality
- Header validation
- Suspicious request detection
- CORS protection
- Security monitoring utilities
- API protection mechanisms

#### Load Testing
Located in `tests/security/load-test.yml`, Artillery configuration for:
- Authentication endpoint testing
- AI API rate limiting verification
- Content generation protection
- Site creation limitations

### Manual Testing Checklist

#### Security Headers Verification
```bash
curl -I https://your-domain.com
# Check for all security headers in response
```

#### Rate Limiting Test
```bash
# Make multiple requests to test rate limiting
for i in {1..20}; do
  curl -s https://your-domain.com/api/test
  sleep 1
done
```

## 8. Environment-Specific Configurations

### Development Environment
- Reduced logging verbosity
- Looser rate limits for testing
- Localhost origins allowed in CORS

### Production Environment
- Full security enforcement
- Comprehensive logging
- Stricter rate limits
- Sensitive headers enabled

### Environment Variables
```bash
# Security-related environment variables
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
SNYK_TOKEN=your-snyk-token
```

## 9. Maintenance & Updates

### Regular Tasks
1. **Weekly**: Review security scan results
2. **Monthly**: Update dependency vulnerability scans
3. **Quarterly**: Review and update security policies
4. **As Needed**: Update blocked IP lists based on threat intelligence

### Dependency Updates
- Keep security-related dependencies updated
- Monitor npm audit reports weekly
- Update GitHub Actions monthly

### Incident Response
1. Review security logs for incident details
2. Implement temporary blocks if needed
3. Update threat patterns and signatures
4. Document incident and response actions

## 10. Compliance Considerations

### Security Standards Alignment
- **OWASP Top 10**: Addresses injection, broken access control, security misconfigurations
- **NIST Cybersecurity Framework**: Implements identify, protect, detect, respond, recover
- **ISO 27001**: Security controls for information assets

### Audit & Compliance
- Security configurations are documented for compliance audits
- Access controls and monitoring meet regulatory requirements
- Incident response procedures are documented and tested

## Support & Troubleshooting

### Common Issues
1. **Rate Limiting Too Strict**: Adjust limits in `security-middleware.ts`
2. **CORS Issues**: Add allowed origins to `ALLOWED_ORIGINS`
3. **Security Scanning Failures**: Check GitHub Actions permissions and tokens

### Getting Help
- Review logs in the logging system
- Check GitHub Security tab for vulnerability reports
- Monitor security workflow runs for failures

---

This security configuration provides multiple layers of defense while maintaining application performance and usability. Regular monitoring and updates are essential for maintaining security posture.
