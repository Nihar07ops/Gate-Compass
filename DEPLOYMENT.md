# GATE COMPASS - Deployment Guide

This guide provides comprehensive instructions for deploying GATE COMPASS to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Database Management](#database-management)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+ or similar)
- **Docker**: Version 24.0+
- **Docker Compose**: Version 2.20+
- **Node.js**: Version 18+ (for local development)
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: Minimum 20GB available disk space

### Required Services

- PostgreSQL 15+
- Redis 7+
- SSL Certificate (for HTTPS)

### Required Credentials

- Google OAuth 2.0 credentials (Client ID and Secret)
- JWT secret key
- Database credentials
- (Optional) AWS credentials for S3 backups
- (Optional) Sentry DSN for error tracking

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/gate-compass.git
cd gate-compass
```

### 2. Configure Environment Variables

Create a `.env.production` file in the root directory:

```bash
# Database Configuration
DB_USER=gatecompass
DB_PASSWORD=<strong-password>
DB_NAME=gatecompass_db

# Redis Configuration
REDIS_PASSWORD=<strong-password>

# Google OAuth
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/callback

# JWT Configuration
JWT_SECRET=<generate-strong-secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# URLs
FRONTEND_URL=https://yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=<your-client-id>

# Cron Schedule
TREND_ANALYSIS_CRON=0 2 * * *

# Backup Configuration (Optional)
BACKUP_DIR=./backups
RETENTION_DAYS=7
AWS_S3_BUCKET=<your-s3-bucket>
```

### 3. Generate Secrets

Generate strong secrets for production:

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate database password
openssl rand -base64 32
```

## Docker Deployment

### Production Deployment with Docker Compose

1. **Build and start services**:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

2. **Run database migrations**:

```bash
docker-compose -f docker-compose.prod.yml exec backend npm run migrate:up
```

3. **Verify services are running**:

```bash
docker-compose -f docker-compose.prod.yml ps
```

4. **Check logs**:

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Individual Docker Images

Build and run individual services:

```bash
# Build backend
docker build -f backend/Dockerfile -t gate-compass-backend .

# Build frontend
docker build -f frontend/Dockerfile -t gate-compass-frontend .

# Run backend
docker run -d \
  --name gate-compass-backend \
  -p 5000:5000 \
  --env-file .env.production \
  gate-compass-backend

# Run frontend
docker run -d \
  --name gate-compass-frontend \
  -p 80:80 \
  gate-compass-frontend
```

## CI/CD Pipeline

### GitHub Actions Setup

The project includes two GitHub Actions workflows:

1. **CI Pipeline** (`.github/workflows/ci.yml`): Runs on every push and PR
   - Lints code
   - Runs tests
   - Builds applications
   - Performs security scans

2. **CD Pipeline** (`.github/workflows/cd.yml`): Runs on push to main branch
   - Builds Docker images
   - Pushes to container registry
   - Deploys to production server
   - Runs database migrations
   - Performs health checks

### Required GitHub Secrets

Configure the following secrets in your GitHub repository:

```
DEPLOY_HOST=<production-server-ip>
DEPLOY_USER=<ssh-username>
DEPLOY_SSH_KEY=<private-ssh-key>
HEALTH_CHECK_URL=https://api.yourdomain.com/health
SLACK_WEBHOOK=<slack-webhook-url>
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=<your-client-id>
```

### Manual Deployment

If not using GitHub Actions, deploy manually:

```bash
# On your local machine
docker build -f backend/Dockerfile -t ghcr.io/your-org/gate-compass/backend:latest .
docker build -f frontend/Dockerfile -t ghcr.io/your-org/gate-compass/frontend:latest .
docker push ghcr.io/your-org/gate-compass/backend:latest
docker push ghcr.io/your-org/gate-compass/frontend:latest

# On production server
docker pull ghcr.io/your-org/gate-compass/backend:latest
docker pull ghcr.io/your-org/gate-compass/frontend:latest
docker-compose -f docker-compose.prod.yml up -d
```

## Database Management

### Backup Database

Run the backup script:

```bash
chmod +x scripts/backup-database.sh
./scripts/backup-database.sh
```

Backups are stored in `./backups/` directory with timestamp.

### Restore Database

Restore from a backup file:

```bash
chmod +x scripts/restore-database.sh
./scripts/restore-database.sh ./backups/gatecompass_backup_20240101_020000.sql.gz
```

### Automated Backups

Setup automated daily backups with cron:

```bash
chmod +x scripts/setup-cron-backup.sh
./scripts/setup-cron-backup.sh
```

This creates a cron job that runs daily at 2 AM.

### Database Migrations

Run migrations:

```bash
# Up (apply migrations)
docker-compose -f docker-compose.prod.yml exec backend npm run migrate:up

# Down (rollback migrations)
docker-compose -f docker-compose.prod.yml exec backend npm run migrate:down

# Create new migration
docker-compose -f docker-compose.prod.yml exec backend npm run migrate:create <migration-name>
```

### Manual Database Access

Access PostgreSQL directly:

```bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U gatecompass -d gatecompass_db
```

## Monitoring and Logging

### Application Logs

View logs for each service:

```bash
# Backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Frontend logs
docker-compose -f docker-compose.prod.yml logs -f frontend

# Database logs
docker-compose -f docker-compose.prod.yml logs -f postgres

# Redis logs
docker-compose -f docker-compose.prod.yml logs -f redis
```

### Prometheus Monitoring

The `monitoring/prometheus.yml` configuration includes:
- Backend API metrics
- PostgreSQL metrics
- Redis metrics
- System metrics
- Nginx metrics

### Alert Rules

Alert rules are defined in `monitoring/alerts/`:
- `backend-alerts.yml`: Backend service alerts
- `database-alerts.yml`: Database and cache alerts

### Health Checks

Check service health:

```bash
# Backend health
curl https://api.yourdomain.com/health

# Frontend health
curl https://yourdomain.com/health
```

### Sentry Integration (Optional)

Add Sentry DSN to environment variables for error tracking:

```bash
SENTRY_DSN=<your-sentry-dsn>
```

### CloudWatch Integration (AWS)

For AWS deployments, configure CloudWatch:

1. Install CloudWatch agent on EC2 instance
2. Configure log groups for each service
3. Set up CloudWatch alarms for critical metrics

## Security Considerations

### SSL/TLS Configuration

1. **Obtain SSL Certificate**:

```bash
# Using Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com
```

2. **Configure Nginx** with SSL:

Create `nginx/nginx.conf` with SSL configuration (see nginx documentation).

### Firewall Configuration

Configure firewall rules:

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (if needed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### Security Best Practices

1. **Use strong passwords** for all services
2. **Enable HTTPS only** in production
3. **Rotate secrets regularly** (JWT secret, database passwords)
4. **Keep Docker images updated**
5. **Run security audits**: `npm audit`
6. **Use environment variables** for sensitive data
7. **Implement rate limiting** (already configured)
8. **Enable CORS** with specific origins only

### Regular Security Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Update npm dependencies
npm audit fix
```

## Troubleshooting

### Common Issues

#### 1. Backend won't start

**Symptoms**: Backend container exits immediately

**Solutions**:
- Check environment variables: `docker-compose -f docker-compose.prod.yml config`
- Check logs: `docker-compose -f docker-compose.prod.yml logs backend`
- Verify database connection
- Ensure migrations are run

#### 2. Database connection errors

**Symptoms**: "Connection refused" or "Authentication failed"

**Solutions**:
- Verify database is running: `docker-compose -f docker-compose.prod.yml ps postgres`
- Check database credentials in `.env.production`
- Ensure database is healthy: `docker-compose -f docker-compose.prod.yml exec postgres pg_isready`

#### 3. Frontend shows API errors

**Symptoms**: API calls fail with CORS or network errors

**Solutions**:
- Verify `VITE_API_BASE_URL` is correct
- Check backend is accessible
- Verify CORS configuration in backend
- Check browser console for specific errors

#### 4. OAuth authentication fails

**Symptoms**: Google login redirects fail

**Solutions**:
- Verify Google OAuth credentials
- Check callback URL matches Google Console configuration
- Ensure `GOOGLE_CALLBACK_URL` is correct
- Check frontend `VITE_GOOGLE_CLIENT_ID`

#### 5. High memory usage

**Symptoms**: Services crash or become unresponsive

**Solutions**:
- Check Docker stats: `docker stats`
- Increase container memory limits
- Check for memory leaks in application logs
- Restart services: `docker-compose -f docker-compose.prod.yml restart`

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes are created
2. **Redis Caching**: Verify cache hit rates
3. **Connection Pooling**: Adjust pool sizes based on load
4. **CDN**: Use CDN for static assets
5. **Load Balancing**: Add load balancer for high traffic

### Rollback Procedure

If deployment fails:

1. **Rollback Docker images**:

```bash
docker-compose -f docker-compose.prod.yml down
docker tag ghcr.io/your-org/gate-compass/backend:previous ghcr.io/your-org/gate-compass/backend:latest
docker tag ghcr.io/your-org/gate-compass/frontend:previous ghcr.io/your-org/gate-compass/frontend:latest
docker-compose -f docker-compose.prod.yml up -d
```

2. **Rollback database**:

```bash
./scripts/restore-database.sh ./backups/gatecompass_backup_<timestamp>.sql.gz
```

### Getting Help

- Check application logs
- Review GitHub Issues
- Contact development team
- Check documentation at `/docs`

## Maintenance

### Regular Maintenance Tasks

1. **Daily**:
   - Monitor application logs
   - Check error rates
   - Verify backups completed

2. **Weekly**:
   - Review performance metrics
   - Check disk space usage
   - Update dependencies if needed

3. **Monthly**:
   - Security audit
   - Database optimization
   - Review and rotate logs

### Scaling Considerations

For high traffic scenarios:

1. **Horizontal Scaling**: Add more backend instances behind load balancer
2. **Database Replication**: Set up read replicas
3. **Redis Cluster**: Use Redis cluster for high availability
4. **CDN**: Serve static assets via CDN
5. **Caching**: Implement additional caching layers

## Support

For deployment issues or questions:
- Email: support@gatecompass.com
- Documentation: https://docs.gatecompass.com
- GitHub Issues: https://github.com/your-org/gate-compass/issues
