# GATE COMPASS

Intelligent GATE CSIT exam preparation platform with mock test generation based on trend analysis.

## Project Structure

This is a monorepo containing:
- `frontend/` - React + TypeScript frontend application
- `backend/` - Node.js + Express + TypeScript backend API

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose (for local development)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

This will install dependencies for both frontend and backend workspaces.

### 2. Start Docker Services

Start PostgreSQL and Redis containers:

```bash
docker-compose up -d
```

### 3. Configure Environment Variables

#### Backend
Copy the example environment file:
```bash
cp backend/.env.example backend/.env.development
```

Update the following variables in `backend/.env.development`:
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret
- `JWT_SECRET` - A secure random string for JWT signing

#### Frontend
Copy the example environment file:
```bash
cp frontend/.env.example frontend/.env.development
```

Update `VITE_GOOGLE_CLIENT_ID` with your Google OAuth client ID.

### 4. Run Development Servers

Start both frontend and backend in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run test` - Run tests for both applications
- `npm run lint` - Lint both applications
- `npm run format` - Format code with Prettier

### Backend
- `npm run dev --workspace=backend` - Start backend in development mode
- `npm run build --workspace=backend` - Build backend for production
- `npm run test --workspace=backend` - Run backend tests
- `npm run lint --workspace=backend` - Lint backend code

### Frontend
- `npm run dev --workspace=frontend` - Start frontend in development mode
- `npm run build --workspace=frontend` - Build frontend for production
- `npm run test --workspace=frontend` - Run frontend tests
- `npm run lint --workspace=frontend` - Lint frontend code

## Docker Services

The project uses Docker Compose to run PostgreSQL and Redis:

- **PostgreSQL**: Port 5432
  - Database: `gatecompass_db`
  - User: `gatecompass`
  - Password: `gatecompass_dev`

- **Redis**: Port 6379

To stop the services:
```bash
docker-compose down
```

To stop and remove volumes:
```bash
docker-compose down -v
```

## Technology Stack

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- React Router
- Chart.js
- Vite
- Vitest

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- Redis
- Passport.js (Google OAuth)
- JWT
- Jest

## Project Features

- Google OAuth authentication
- Trend analysis of GATE questions
- Intelligent mock test generation
- 3-hour timed tests with per-question tracking
- Comprehensive results and analytics
- Personalized feedback and recommendations
- Admin panel for question management

## Deployment

For production deployment, see the comprehensive deployment documentation:

- **[Quick Start Deployment](./QUICKSTART_DEPLOYMENT.md)** - 5-minute deployment guide
- **[Deployment Guide](./DEPLOYMENT.md)** - Comprehensive deployment documentation
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist
- **[Deployment Summary](./deployment/DEPLOYMENT_SUMMARY.md)** - Overview of all deployment files

### Quick Production Deployment

```bash
# 1. Configure environment
cp backend/.env.example .env.production
# Edit .env.production with production values

# 2. Build and deploy
npm run docker:build
npm run docker:up

# 3. Run migrations
npm run migrate:up

# 4. Verify deployment
npm run docker:ps
```

### Deployment Features

- **Docker-based deployment** with multi-stage builds
- **CI/CD pipeline** with GitHub Actions
- **Automated database backups** with configurable retention
- **Monitoring and alerting** with Prometheus and Grafana
- **SSL/TLS support** with Nginx reverse proxy
- **Health checks** and graceful shutdown
- **Security hardening** with rate limiting and security headers

## Monitoring

Optional monitoring stack with Prometheus, Grafana, and Alertmanager:

```bash
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

Access dashboards:
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093

See [monitoring/README.md](./monitoring/README.md) for details.

## License

Private - All rights reserved
