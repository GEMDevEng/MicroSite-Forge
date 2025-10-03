# Operational Runbook

## Overview

This runbook provides standardized procedures for common operational tasks in the MicroSite Forge production environment. These procedures ensure consistency, reduce error rates, and enable effective knowledge transfer between team members.

## Core Systems

### Application Architecture
- **Frontend:** Next.js 15 with React 18, TypeScript
- **Backend:** Next.js API routes with Supabase
- **Database:** PostgreSQL via Supabase
- **Hosting:** Vercel (frontend), Supabase (database)
- **CDN:** Vercel Edge Network

### Infrastructure Components
- **Web Application:** Vercel deployment
- **Database:** Supabase managed PostgreSQL
- **File Storage:** Supabase Storage
- **Authentication:** Supabase Auth
- **External APIs:** OpenAI, Grok, Stripe, SendGrid

## Standard Operating Procedures (SOPs)

### Deployment Procedures

#### Frontend Deployment
```bash
# Manual deployment (emergency only)
npm run build
npm run deploy:production

# Preferred: Use GitOps via CI/CD
git push origin main
```

**Post-deployment Verification:**
```bash
# Health check
curl -f https://app.micrositeforge.com/health

# Build verification
curl -s https://app.micrositeforge.com | grep -q "MicroSite Forge"

# API connectivity
curl -f https://app.micrositeforge.com/api/health
```

#### Database Migrations
```bash
# Check migration status
supabase migration list

# Apply new migrations
supabase db push

# Revert migration (if needed)
supabase migration down
```

**Safety Checks:**
- Always backup before migration
- Test in staging environment first
- Monitor performance after migration

### Monitoring & Alerting

#### Key Metrics to Monitor

**Application Performance:**
- Response Time: < 500ms (95th percentile)
- Error Rate: < 5%
- Throughput: > 100 requests/second capacity

**System Resources:**
- CPU Usage: < 80%
- Memory Usage: < 85%
- Disk Space: > 20% free

**Business Metrics:**
- Microsite Creation Success Rate: > 95%
- User Signup Conversion: > 30%
- Average Session Duration: > 5 minutes

#### Alert Thresholds

```json
{
  "response_time_p95": {
    "warning": 1000,
    "critical": 2000
  },
  "error_rate": {
    "warning": 5,
    "critical": 10
  },
  "cpu_usage": {
    "warning": 80,
    "critical": 90
  },
  "memory_usage": {
    "warning": 85,
    "critical": 95
  }
}
```

### Database Operations

#### Connection Pool Monitoring
```sql
SELECT
  count(*) as active_connections,
  state
FROM pg_stat_activity
GROUP BY state;

-- Check for long-running queries
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - pg_stat_activity.query_start > interval '5 minutes';
```

#### Index Maintenance
```sql
-- Check index usage
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;

-- Rebuild index if needed
REINDEX INDEX CONCURRENTLY index_name;
```

#### Backup Verification
```bash
# Check backup status
supabase db backup list

# Manual backup (if needed)
supabase db backup create production_backup_$(date +%Y%m%d_%H%M%S)

# Restore from backup
supabase db restore backup_id
```

### Third-Party Service Management

#### Stripe Webhook Management
**Handling Failed Webhooks:**
1. Check Stripe dashboard for failed events
2. Verify webhook endpoint configuration
3. Replay failed webhooks manually if needed
4. Update retry logic if pattern persists

#### SendGrid Email Deliverability
```yaml
# Monitor bounce rates
bounce_rate_threshold: 2%
complaint_rate_threshold: 0.1%

# Actions for high bounce rates:
1. Check email content quality
2. Verify recipient list hygiene
3. Implement authentication (SPF, DKIM, DMARC)
4. Contact support if needed
```

#### Supabase Service Management
**Performance Optimization:**
```sql
-- Enable query performance insights
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Analyze slow queries
SELECT
  query,
  calls,
  total_time / calls as avg_time,
  rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Security Operations

#### Access Control
**Principle of Least Privilege:**
- Users get minimal required permissions
- Regular access review every 90 days
- MFA required for all admin access
- API keys rotated every 180 days

#### Log Security
**Sensitive Data Handling:**
- Never log passwords, tokens, or PII
- Use structured logging
- Implement log aggregation and monitoring
- Archive logs for 7 years minimum

#### Penetration Testing Schedule
- External pentest: Annual
- Internal scanning: Monthly
- Dependency updates: Weekly
- Critical security alerts: Immediate

### Performance Optimization

#### Application Performance
**Caching Strategy:**
- Browser caching: 1 year for static assets
- CDN caching: 1 hour for dynamic content
- Database query caching: 5 minutes
- API response caching: 10 minutes

#### Database Optimization
```sql
-- Query optimization checklist:
1. EXPLAIN ANALYZE suspicious queries
2. Add appropriate indexes
3. Consider query restructuring
4. Implement connection pooling
5. Monitor slow query log
```

#### Frontend Optimization
**Bundle Analysis:**
```bash
npm run build
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

**Performance Budget:**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

### Disaster Recovery

#### Data Recovery
**Recovery Time Objectives (RTO):**
- Critical data: 1 hour
- Important data: 4 hours
- General data: 24 hours

**Recovery Point Objectives (RPO):**
- Critical data: 1 hour
- Important data: 4 hours
- General data: 24 hours

#### Backup Strategy
```bash
# Database backups
- Full backup: Daily at 2 AM UTC
- Incremental: Every 6 hours
- Point-in-time recovery: Continuous

# File backups
- Static assets: Sync to multiple regions
- User uploads: 3x replication
- CDN cache: Automatic fallback
```

#### Service Failover
**Automatic Failover:**
1. Load balancer detects unhealthy instances
2. Traffic automatically routes to healthy instances
3. Database failover initiates if primary fails
4. Alert team for manual intervention if needed

**Manual Failover Procedure:**
```bash
# Emergency service switch
1. Scale down primary region
2. Verify secondary region health
3. Update DNS/local routing
4. Monitor traffic migration
5. Scale down old region after verification
```

### Capacity Planning

#### Resource Scaling
**Auto-scaling Rules:**
```yaml
cpu_threshold: 70%
memory_threshold: 80%
request_queue_threshold: 100

# Scale up conditions
- CPU > 70% for 5 minutes
- Memory > 80% for 3 minutes
- Queue depth > 100 for 2 minutes

# Scale down conditions
- CPU < 30% for 15 minutes
- Memory < 40% for 20 minutes
```

#### Growth Projections
**Monthly Monitoring:**
- User growth rate
- Data storage growth
- API call volume
- Peak usage patterns

### Compliance & Auditing

#### Data Privacy (GDPR/CCPA)
```yaml
retention_policies:
  user_logs: 2 years
  analytics_data: 3 years
  backup_data: 7 years

privacy_controls:
  - Data encryption at rest
  - Data encryption in transit
  - Regular data inventory audits
  - Automated PII detection
```

#### Access Auditing
**Audit Log Requirements:**
- All authentication attempts logged
- Administrative actions tracked
- Data access requests audited
- Failed access attempts monitored

#### Regulatory Reporting
- SOC 2 Type II: Annual
- GDPR compliance audit: Annual
- Security incident reporting: Immediate

---

## Emergency Contacts

### Immediate Response
- **On-call Engineer:** PagerDuty rotation
- **Engineering Manager:** [Manager contact]
- **CTO:** [CTO contact]

### Vendor Support
- **Supabase:** 24/7 enterprise support
- **Vercel:** Emergency support line
- **Stripe:** Critical incident hotline
- **SendGrid:** Technical support

### Customer Communication
- **Status Page:** [Status page URL]
- **Customer Success:** [Support contact]
- **Marketing:** [PR contact]

---

**Document Version:** 1.0
**Last Updated:** October 2025
**Review Date:** Quarterly
**Owner:** Production Engineering Team
