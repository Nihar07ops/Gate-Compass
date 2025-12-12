# 🍃 MongoDB Setup Guide

This guide will help you set up MongoDB for the Gate-Compass backend, both locally and in the cloud.

## 📋 Prerequisites

- Node.js 16+ installed
- MongoDB account (for cloud setup)

## 🏠 Local MongoDB Setup

### Option 1: MongoDB Community Server

1. **Download MongoDB**
   - Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Download MongoDB Community Server for your OS
   - Install following the setup wizard

2. **Start MongoDB Service**
   ```bash
   # Windows (as Administrator)
   net start MongoDB
   
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux (systemd)
   sudo systemctl start mongod
   ```

3. **Verify Installation**
   ```bash
   mongo --version
   # or
   mongosh --version
   ```

### Option 2: Docker MongoDB

```bash
# Pull and run MongoDB container
docker run -d \
  --name gate-compass-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=gate-compass \
  -v mongo-data:/data/db \
  mongo:latest

# Verify container is running
docker ps
```

## ☁️ MongoDB Atlas (Cloud) Setup

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project: "Gate-Compass"

### 2. Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Name your cluster: "gate-compass-cluster"
5. Click "Create Cluster"

### 3. Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `gatecompass`
5. Generate a secure password
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 4. Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your server's specific IP address
5. Click "Confirm"

### 5. Get Connection String
1. Go to "Databases" and click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string

## ⚙️ Environment Configuration

### 1. Create Environment File
```bash
cd server
cp .env.example .env
```

### 2. Update .env File

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/gate-compass
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://gatecompass:<password>@gate-compass-cluster.xxxxx.mongodb.net/gate-compass?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

Replace `<password>` with your database user password.

## 🚀 Start the Application

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### 3. Verify Connection
Check the console output for:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Database: gate-compass
🌱 Database seeded successfully
✅ Server running on port 5000
```

## 📊 Database Structure

The application will automatically create these collections:

### Collections Created:
- **users** - User accounts and profiles
- **questions** - GATE questions database
- **testattempts** - Test results and analytics
- **studysessions** - Study tracking data

### Sample Data:
- 5 sample GATE CSE questions
- 2 test users (testuser, admin)
- Question topics: Data Structures, Algorithms, Graph Theory, Theory of Computation

## 🔧 Database Management

### Using MongoDB Compass (GUI)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Browse collections and documents visually

### Using MongoDB Shell
```bash
# Connect to local MongoDB
mongosh

# Connect to Atlas
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/gate-compass" --username gatecompass

# Basic commands
use gate-compass
show collections
db.users.find()
db.questions.countDocuments()
```

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Check if MongoDB is running (local)
sudo systemctl status mongod

# Test connection
mongosh mongodb://localhost:27017/gate-compass
```

### Atlas Connection Issues
- Verify IP address is whitelisted
- Check username/password in connection string
- Ensure cluster is running (not paused)

### Application Issues
```bash
# Check server logs
npm run dev

# Verify environment variables
echo $MONGODB_URI
```

## 📈 Performance Tips

### Indexing
The application automatically creates indexes for:
- User email and username (unique)
- Question topics and difficulty
- Test attempts by user and date

### Connection Pooling
Mongoose automatically handles connection pooling with these defaults:
- Max pool size: 10 connections
- Server selection timeout: 30 seconds
- Socket timeout: 45 seconds

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, unique JWT secrets
- Rotate database passwords regularly

### 2. Database Security
- Use specific IP whitelisting in production
- Create database users with minimal required permissions
- Enable MongoDB authentication
- Use SSL/TLS connections

### 3. Application Security
- Validate all input data
- Use parameterized queries (Mongoose handles this)
- Implement rate limiting
- Log security events

## 🚀 Production Deployment

### MongoDB Atlas Production Setup
1. Upgrade to a paid tier for production workloads
2. Enable backup and point-in-time recovery
3. Set up monitoring and alerts
4. Configure multiple regions for high availability

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://prod-user:secure-password@prod-cluster.mongodb.net/gate-compass-prod
JWT_SECRET=super-secure-production-jwt-secret
NODE_ENV=production
```

## 📞 Support

### MongoDB Resources
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Support](https://support.mongodb.com/)

### Common Issues
- **Connection timeout**: Check network access and IP whitelisting
- **Authentication failed**: Verify username/password in connection string
- **Database not found**: MongoDB creates databases automatically on first write
- **Collection not found**: Collections are created when first document is inserted