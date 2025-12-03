# Deployment Guide

## Frontend Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd client
vercel --prod
```

3. Configure environment variables in Vercel dashboard

## Backend Deployment (AWS EC2)

1. Launch EC2 instance (Ubuntu 22.04)
2. SSH into instance
3. Install Node.js and MongoDB
4. Clone repository
5. Install dependencies:
```bash
cd server
npm install
```
6. Configure environment variables
7. Use PM2 for process management:
```bash
npm i -g pm2
pm2 start server.js
pm2 save
pm2 startup
```

## ML Service Deployment (AWS Lambda)

1. Package Python dependencies:
```bash
cd ml_service
pip install -r requirements.txt -t .
```

2. Create deployment package:
```bash
zip -r function.zip .
```

3. Upload to AWS Lambda via console or CLI
4. Configure API Gateway for HTTP endpoints

## Alternative: Railway Deployment

1. Connect GitHub repository to Railway
2. Configure environment variables
3. Deploy with one click

## MongoDB Atlas Setup

1. Create cluster at mongodb.com/cloud/atlas
2. Configure network access
3. Create database user
4. Get connection string
5. Add to environment variables
