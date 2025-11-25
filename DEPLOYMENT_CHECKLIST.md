# GATE COMPASS - Deployment Checklist

Use this checklist to ensure all steps are completed before deploying to production.

## Pre-Deployment

### Environment Configuration
- [ ] Create `.env.production` file with all required variables
- [ ] Generate strong JWT secret (64+ characters)
- [ ] Generate strong database passwords
- [ ] Configure Google OAuth credentials for production domain
- [ ] Set correct callback URLs for OAuth
- [ ] Configure frontend and backend URLs
- [ ] Set up Redis password

### Infrastructure Setup
- [ ] Provision production server (minimum 4GB RAM, 20GB storage)
- [ ] Install Docker and Docker Compose
- [ ] Configure firewall rules (ports 80, 443, 22)
- [ ] Obtain SSL certificates (Let's Encrypt or commercial)
- [ ] Set up domain DNS records (A records for domain and api subdomain)
- [ ] Configure backup storage (local or S3)

### Database Setup
- [ ] Create production database
- [ ] Configure database user with appropriate permissions
- [ ] Set up database connection pooling
- [ ] Plan database backup strategy
- [ ] Test database connection

### Security
- [ ] Review and update all secrets
- [ ] Enable HTTPS only
- [ ] Configure CORS with specific origins
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Set up firewall rules
- [ ] Disable unnecessary ports
- [ ] Configure SSH key-based authentication
- [ ] Disable root SSH login

## Deployment

### Initial Deployment
- [ ] Clone repository to production server
- [ ] Copy `.env.production` to server
- [ ] Build Docker images or pull from registry
- [ ] Start services with `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Run database migrations
- [ ] Verify all containers are running
- [ ] Check logs for errors

### Testing
- [ ] Test health check endpoints
- [ ] Test Google OAuth login flow
- [ ] Test API endpoints
- [ ] Test frontend loads correctly
- [ ] Test HTTPS redirects
- [ ] Test rate limiting
- [ ] Verify database connections
- [ ] Verify Redis caching
- [ ] Test error handling

### Monitoring Setup
- [ ] Configure application logging
- [ ] Set up log rotation
- [ ] Configure monitoring (Prometheus/CloudWatch)
- [ ] Set up alerting rules
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring

### Backup Configuration
- [ ] Test backup script
- [ ] Set up automated daily backups
- [ ] Configure backup retention policy
- [ ] Test restore procedure
- [ ] Set up off-site backup storage (S3)
- [ ] Document backup and restore procedures

## Post-Deployment

### Verification
- [ ] Verify application is accessible via domain
- [ ] Test all critical user flows
- [ ] Check SSL certificate is valid
- [ ] Verify OAuth authentication works
- [ ] Test test generation and submission
- [ ] Verify results calculation
- [ ] Check trend analysis cron job
- [ ] Monitor error rates
- [ ] Check performance metrics

### Documentation
- [ ] Update deployment documentation
- [ ] Document any custom configurations
- [ ] Create runbook for common issues
- [ ] Document rollback procedure
- [ ] Share credentials with team (securely)

### CI/CD Setup
- [ ] Configure GitHub Actions secrets
- [ ] Test CI pipeline
- [ ] Test CD pipeline (in staging first)
- [ ] Set up deployment notifications
- [ ] Configure automatic rollback on failure

## Ongoing Maintenance

### Daily
- [ ] Monitor application logs
- [ ] Check error rates
- [ ] Verify backups completed successfully
- [ ] Monitor system resources

### Weekly
- [ ] Review performance metrics
- [ ] Check disk space usage
- [ ] Review security logs
- [ ] Update dependencies if needed

### Monthly
- [ ] Security audit
- [ ] Database optimization
- [ ] Review and rotate logs
- [ ] Update SSL certificates (if needed)
- [ ] Review and update documentation

## Emergency Procedures

### Rollback Plan
- [ ] Document current version/commit
- [ ] Keep previous Docker images tagged
- [ ] Have recent database backup ready
- [ ] Know rollback commands
- [ ] Test rollback procedure in staging

### Incident Response
- [ ] Define incident severity levels
- [ ] Create incident response team
- [ ] Document escalation procedures
- [ ] Set up incident communication channels
- [ ] Create post-mortem template

## Sign-off

- [ ] Development team approval
- [ ] QA team approval
- [ ] Security team approval
- [ ] Operations team approval
- [ ] Product owner approval

**Deployment Date**: _______________

**Deployed By**: _______________

**Version/Commit**: _______________

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________
