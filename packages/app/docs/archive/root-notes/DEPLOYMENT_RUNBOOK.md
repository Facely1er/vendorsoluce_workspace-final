# VendorSoluce Production Deployment Runbook

## Overview
This runbook provides step-by-step instructions for deploying VendorSoluce to production with confidence. Follow these procedures to ensure a successful, secure deployment.

## Pre-Deployment Checklist ✅

### 1. Environment Setup
- [ ] **Supabase Project**: Production Supabase instance created
- [ ] **Environment Variables**: `.env.local` configured with production values
- [ ] **Domain Configuration**: Production domain and SSL certificates ready
- [ ] **CDN Setup**: CDN configured for static asset delivery
- [ ] **Monitoring**: Error tracking and analytics services configured

### 2. Security Verification
- [ ] **Dependencies**: All security vulnerabilities resolved (`npm audit`)
- [ ] **Authentication**: Supabase Auth configured with proper policies
- [ ] **Database Security**: RLS policies verified and tested
- [ ] **Input Validation**: All user inputs properly sanitized
- [ ] **CSP Headers**: Content Security Policy configured

### 3. Code Quality
- [ ] **Build Success**: Production build completes without errors
- [ ] **Type Checking**: TypeScript compilation successful
- [ ] **Linting**: Code quality checks passed (or non-critical issues documented)
- [ ] **Testing**: Critical user flows tested

## Deployment Procedures

### Phase 1: Database Migration

#### 1.1 Supabase Production Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to production project
supabase link --project-ref YOUR_PROJECT_REF

# Verify connection
supabase status
```

#### 1.2 Run Database Migrations
```bash
# Apply all migrations to production
supabase db push

# Verify migrations
supabase db diff

# Test database connection
supabase db reset --linked
```

#### 1.3 Verify Database Security
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verify policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';
```

### Phase 2: Application Deployment

#### 2.1 Automated Deployment (Recommended)
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run automated deployment
./deploy.sh
```

#### 2.2 Manual Deployment Steps
```bash
# Install dependencies
npm ci

# Run security audit
npm audit

# Type check
npm run type-check

# Build for production
npm run build

# Verify build output
ls -la dist/

# Deploy to hosting platform
# (Platform-specific commands below)
```

#### 2.3 Platform-Specific Deployment

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to production
netlify deploy --prod --dir=dist
```

**AWS S3 + CloudFront:**
```bash
# Install AWS CLI
aws configure

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Phase 3: Post-Deployment Verification

#### 3.1 Smoke Tests
```bash
# Test critical endpoints
curl -I https://your-domain.com/
curl -I https://your-domain.com/api/health

# Test authentication flow
# (Manual testing required)
```

#### 3.2 Performance Verification
- [ ] **Page Load Time**: < 2 seconds
- [ ] **Core Web Vitals**: Pass Google PageSpeed Insights
- [ ] **Bundle Size**: Verify optimal chunk loading
- [ ] **CDN**: Static assets served from CDN

#### 3.3 Security Verification
- [ ] **HTTPS**: SSL certificate valid and enforced
- [ ] **CSP Headers**: Content Security Policy active
- [ ] **Authentication**: Login/logout flows working
- [ ] **Data Access**: User data properly isolated

## Monitoring & Alerting Setup

### 1. Error Tracking (Sentry)
```javascript
// Add to main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: "production",
});
```

### 2. Performance Monitoring
```javascript
// Add to App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### 3. Uptime Monitoring
Configure monitoring for:
- Application availability
- API response times
- Database connectivity
- Authentication service

## Rollback Procedures

### Quick Rollback (< 5 minutes)
1. **Revert Deployment**: Use hosting platform rollback feature
2. **Clear CDN Cache**: Invalidate all cached assets
3. **Verify Functionality**: Test critical user flows

### Database Rollback (< 30 minutes)
1. **Restore Database**: Use Supabase backup restore
2. **Verify Data Integrity**: Check critical data tables
3. **Test User Flows**: Verify authentication and data access

### Communication Plan
1. **Status Page**: Update status page with maintenance notice
2. **User Notification**: Send email/SMS to active users
3. **Social Media**: Post updates on official channels

## Troubleshooting Guide

### Common Issues

#### Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Verify environment variables
cat .env.local
```

#### Database Connection Issues
```bash
# Check Supabase status
supabase status

# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
supabase db ping
```

#### Performance Issues
```bash
# Analyze bundle size
npm run build:analyze

# Check for memory leaks
# Use browser dev tools

# Verify CDN configuration
curl -I https://your-cdn.com/assets/main.js
```

### Error Codes & Solutions

| Error Code | Description | Solution |
|------------|-------------|----------|
| `AUTH_INVALID_TOKEN` | Authentication token expired | Refresh user session |
| `RLS_POLICY_VIOLATION` | Database access denied | Check RLS policies |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Implement backoff |
| `NETWORK_ERROR` | Connection failed | Check network connectivity |

## Success Metrics

### Technical KPIs
- **Uptime**: > 99.9%
- **Response Time**: < 2 seconds
- **Error Rate**: < 1%
- **Bundle Size**: < 1MB gzipped

### Business KPIs
- **User Registration**: Successful signup flow
- **Feature Usage**: Core features accessible
- **Data Persistence**: User data saved correctly
- **User Satisfaction**: Positive feedback

## Support Procedures

### Level 1 Support (Immediate Response)
- **Application Down**: Check hosting platform status
- **Authentication Issues**: Verify Supabase service status
- **Performance Issues**: Check CDN and server metrics

### Level 2 Support (Within 1 Hour)
- **Data Issues**: Database investigation and repair
- **Feature Bugs**: Code investigation and hotfix
- **Security Issues**: Immediate security assessment

### Escalation Procedures
1. **Critical Issues**: Immediate escalation to technical lead
2. **Security Issues**: Immediate escalation to security team
3. **Data Loss**: Immediate escalation to database team

## Maintenance Schedule

### Daily
- [ ] Monitor error rates and performance
- [ ] Check backup completion status
- [ ] Review security alerts

### Weekly
- [ ] Update dependencies
- [ ] Review performance metrics
- [ ] Check for security updates

### Monthly
- [ ] Full security audit
- [ ] Performance optimization review
- [ ] User feedback analysis

## Emergency Contacts

### Technical Team
- **Lead Developer**: [Name] - [Phone] - [Email]
- **DevOps Engineer**: [Name] - [Phone] - [Email]
- **Database Administrator**: [Name] - [Phone] - [Email]

### Business Team
- **Product Manager**: [Name] - [Phone] - [Email]
- **Customer Support**: [Name] - [Phone] - [Email]

### External Services
- **Supabase Support**: support@supabase.com
- **Hosting Platform**: [Platform-specific support]
- **CDN Provider**: [CDN-specific support]

---

**Document Version**: 1.0
**Last Updated**: $(date)
**Next Review**: 30 days post-deployment
**Approved By**: [Technical Lead Name]