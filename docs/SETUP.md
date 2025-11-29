# Setup Guide

## Prerequisites

- Node.js v18+ installed
- Python 3.9+ installed
- MongoDB installed locally OR MongoDB Atlas account

## Quick Start

### Option 1: Using the startup script (Windows)
```bash
start-dev.bat
```

### Option 2: Manual setup

1. **Install Node dependencies:**
```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

2. **Setup Python environment:**
```bash
cd ml_service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure environment variables:**
   - `.env` files are already created with default values
   - For production, update MongoDB URI in `server/.env`
   - Add real AWS credentials if using S3 features

4. **Start services:**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

Terminal 3 - ML Service:
```bash
cd ml_service
python app.py
```

## Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML Service: http://localhost:8000

## MongoDB Setup

### Local MongoDB
Install MongoDB Community Edition and start the service.

### MongoDB Atlas (Cloud)
1. Create account at mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `server/.env`

## Troubleshooting

### Port already in use
Change ports in:
- `server/.env` (PORT=5000)
- `client/vite.config.js` (port: 3000)
- `ml_service/.env` (PORT=8000)

### MongoDB connection failed
- Check if MongoDB is running locally
- Verify connection string in `.env`
- Check network access in MongoDB Atlas

### Python module errors
```bash
cd ml_service
pip install -r requirements.txt
```

### Node module errors
```bash
npm install
cd client && npm install
cd ../server && npm install
```
