# Uptime Monitoring Setup Guide

## Overview

This document outlines the uptime monitoring configuration for PoultryPulse AI using Better Uptime.

## Monitored Endpoints

The following endpoints are monitored with a 99.5% SLA target:

1. **Homepage** - `https://poultrypulse.ai/`
2. **Health Check** - `https://poultrypulse.ai/api/health`
3. **Pricing Page** - `https://poultrypulse.ai/pricing`
4. **Accuracy Dashboard** - `https://poultrypulse.ai/accuracy`

## Better Uptime Configuration

### Monitor Settings

For each monitor, configure:

- **Check Interval**: Every 60 seconds
- **Regions**: Multiple regions (US East, US West, EU, Asia Pacific)
- **Expected Status**: 200 OK
- **Response Time Threshold**: < 2000ms
- **SSL Certificate**: Valid and not expiring within 30 days

### Alert Configuration

#### Slack Integration

1. Create a Slack webhook URL:
   - Go to Slack App Directory → Incoming Webhooks
   - Create new webhook
   - Select channel: `#uptime-alerts` (or create dedicated channel)
   - Copy webhook URL

2. Add webhook to environment variables:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. Configure Better Uptime to use this webhook for alerts

#### Alert Rules

- **Critical**: Immediate alert on any endpoint failure
- **Warning**: Alert if response time > 2000ms for 3 consecutive checks
- **Recovery**: Send recovery notification when endpoint returns to normal

### SLA Target

- **Target**: 99.5% uptime (approximately 3.65 hours downtime per month allowed)
- **Measurement**: Monthly rolling average
- **Reporting**: Monthly SLA report sent to stakeholders

## Health Check Endpoint

The `/api/health` endpoint returns:

```json
{
  "status": "ok",
  "supabase": true,
  "version": "1.0.0",
  "timestamp": "2026-05-20T10:30:00Z"
}
```

### Implementation

The health check is implemented in `apps/web/app/api/health/route.ts`:

- Returns 200 OK if all systems operational
- Returns 503 Service Unavailable if Supabase is unreachable
- Includes version string for deployment tracking
- Timestamp for monitoring correlation

## Incident Response

### Severity Levels

- **P0 - Critical**: Complete outage affecting all users
  - Response time: < 15 minutes
  - Escalation: CTO, Engineering Lead

- **P1 - High**: Major feature degraded (e.g., pricing page down)
  - Response time: < 30 minutes
  - Escalation: Engineering Lead

- **P2 - Medium**: Minor feature degraded (e.g., accuracy dashboard slow)
  - Response time: < 1 hour
  - Escalation: On-call engineer

- **P3 - Low**: Non-critical issue (e.g., slow response times)
  - Response time: < 4 hours
  - Escalation: Team lead

### Runbook Template

When an alert is triggered:

1. **Verify**: Check Better Uptime dashboard for confirmation
2. **Assess**: Determine scope (single endpoint vs. full outage)
3. **Investigate**: Check logs, error tracking, database status
4. **Communicate**: Update Slack channel with status
5. **Resolve**: Implement fix or rollback
6. **Post-mortem**: Document root cause and prevention

## Monitoring Dashboard Access

- **Better Uptime**: https://betteruptime.com (team account)
- **Vercel Analytics**: https://vercel.com/analytics
- **Supabase Logs**: https://app.supabase.com/project/_/logs

## Maintenance Windows

Scheduled maintenance windows should be:

- Announced 48 hours in advance via Slack
- Scheduled during low-traffic periods (2:00 AM - 4:00 AM IST)
- Limited to 30 minutes maximum
- Documented in maintenance log

## Contact

For monitoring-related questions or issues:
- **Engineering Team**: engineering@poultrypulse.ai
- **On-call**: +91-XXXXXXXXXX (during business hours)

---

**Last Updated**: May 2026
**Version**: 1.0.0
