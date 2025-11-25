# GATE COMPASS - Quick Start Deployment Guide

This guide provides a streamlined process to deploy GATE COMPASS to production quickly.

## Prerequisites

- Linux server with Docker and Docker Compose installed
- Domain name with DNS configured
- Google OAuth credentials
- SSL certificate (or use Let's Encrypt)

## 5-Minute Deployment

### Step 1: Clone and Configure (2 minutes)

```bash
# Clone repository
git clone https://github.com/your-org/gate-compass.git
cd gate-compass

# Create production environment file
cp backend/.env.example .env.production

# Edit environment variables (use your favorite editor)
nano .env.production
```

**Required variables to update**:
```bash
# Generate strong secrets
JWT_SECRET=$(openssl rand -hex 64)
DB_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)

# Update OAuth credentials
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/callback

# Update URLs
FRONTEND_URL=https://yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Step 2: Deploy Services (2 minutes)

```bash
# Build and start all services
npm run docker:build
npm run docker:up

# Run database migrations
npm run migrate:up

# Check services are running
npm run docker:ps
```

### Step 3: Verify Deployment (1 minute)

```bash
# Check health endpoints
curl http://localhost:5000/health
curl http://localhost:80/health

# View logs
npm run docker:logs
```

## Post-Deployment

### Set Up SSL (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Set Up Automated Backups

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Set up daily backups at 2 AM
./scripts/setup-cron-backup.sh
```

### Configure Monitoring (Optional)

```bash
# Set up Prometheus and Grafana
docker-compose -f monitoring/docker-compose.monitoring.yml up -d
```

## Common Commands

```bash
# View logs
npm run docker:logs

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
npm run docker:down

# Backup database
npm run backup:db

# Restore database
npm run restore:db backups/gatecompass_backup_YYYYMMDD_HHMMSS.sql.gz

# Update application
git pull
npm run docker:build
npm run docker:up
npm run migrate:up
```

## Troubleshooting

### Services won't start
```bash
# Check logs
npm run docker:logs

# Check environment variables
docker-compose -f docker-compose.prod.yml config

# Restart services
npm run docker:down
npm run docker:up
```

### Database connection errors
```bash
# Check database is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Verify credentials in .env.production
```

### OAuth not working
- Verify Google OAuth credentials
- Check callback URL matches Google Console
- Ensure HTTPS is configured
- Check CORS settings

## Next Steps

1. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive guide
2. Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete checklist
3. Set up monitoring and alerting
4. Configure CI/CD pipeline
5. Test backup and restore procedures

## Support

For issues or questions:
- Check logs: `npm run docker:logs`
- Review documentation in `/docs`
- Open GitHub issue
- Contact: support@gatecompass.com
