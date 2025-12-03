# 🗄️ Database Setup Guide

## Overview

This guide will help you set up MongoDB for the GATE CSE Prep Platform. You have two options:
1. **MongoDB Atlas** (Cloud - Recommended for production)
2. **Local MongoDB** (For development)

---

## Option 1: MongoDB Atlas (Cloud) - Recommended

### Step 1: Create MongoDB Atlas Account

1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with your email or Google account
3. Complete the registration

### Step 2: Create a Free Cluster

1. After login, click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select a cloud provider and region (choose closest to you)
4. Cluster Name: `gate-cse-cluster` (or any name)
5. Click **"Create"**
6. Wait 3-5 minutes for cluster creation

### Step 3: Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `gateadmin` (or your choice)
5. Password: Click **"Autogenerate Secure Password"** and **COPY IT**
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Whitelist IP Address

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or add your specific IP for security
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://gateadmin:<password>@gate-cse-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you copied earlier

### Step 6: Configure Your App

1. Open `server/.env` file
2. Update the `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb+srv://gateadmin:YOUR_PASSWORD@gate-cse-cluster.xxxxx.mongodb.net/gate-prep?retryWrites=true&w=majority
   ```
3. Make sure to add `/gate-prep` before the `?` (this is your database name)

### Step 7: Test Connection

```bash
cd server
node server.js
```

You should see: `✅ MongoDB Connected Successfully`

---

## Option 2: Local MongoDB Installation

### For Windows

#### Step 1: Download MongoDB

1. Go to: **https://www.mongodb.com/try/download/community**
2. Version: Latest
3. Platform: Windows
4. Package: MSI
5. Click **"Download"**

#### Step 2: Install MongoDB

1. Run the downloaded `.msi` file
2. Choose **"Complete"** installation
3. Install as a **Windows Service** (check the box)
4. Install **MongoDB Compass** (GUI tool - recommended)
5. Click **"Install"**

#### Step 3: Verify Installation

Open Command Prompt and run:
```bash
mongod --version
```

You should see the MongoDB version.

#### Step 4: Start MongoDB Service

MongoDB should start automatically as a Windows service. To verify:

```bash
# Check if service is running
sc query MongoDB

# Or start it manually
net start MongoDB
```

#### Step 5: Configure Your App

1. Open `server/.env` file
2. Update the `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/gate-prep
   ```

#### Step 6: Test Connection

```bash
cd server
node server.js
```

You should see: `✅ MongoDB Connected Successfully`

---

## Database Structure

Once connected, your app will automatically create these collections:

### Collections

1. **users**
   - User accounts and authentication
   - Fields: name, email, password (hashed), createdAt

2. **questions**
   - Question bank for tests
   - Fields: subject, topic, difficulty, question, options, answer, explanation

3. **testresults**
   - User test submissions and scores
   - Fields: userId, questions, answers, score, timeTaken, completedAt

4. **useranalytics**
   - Performance tracking
   - Fields: userId, topicScores, overallAccuracy, testsCompleted

---

## Seeding the Database

After setting up MongoDB, seed it with initial data:

### Step 1: Generate Questions

```bash
cd ml_service/data
python enhanced_questions.py
```

This creates `gate_questions_complete.json` with 50+ questions.

### Step 2: Run Seed Script

```bash
cd server
node scripts/seedDatabase.js
```

This will:
- ✅ Connect to MongoDB
- ✅ Clear existing data (if any)
- ✅ Import questions from JSON
- ✅ Create sample users
- ✅ Add test data

---

## Switching from In-Memory to MongoDB

### Current Setup (In-Memory)
```bash
cd server
node server-inmemory.js
```

### New Setup (MongoDB)
```bash
cd server
node server.js
```

### Update Start Scripts

Edit `scripts/start-production.bat`:

**Change from:**
```batch
start cmd /k "cd server && node server-inmemory.js"
```

**Change to:**
```batch
start cmd /k "cd server && node server.js"
```

---

## Environment Variables

### server/.env

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gate-prep?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# ML Service
ML_SERVICE_URL=http://localhost:8000

# CORS
CLIENT_URL=http://localhost:3000
```

---

## MongoDB Compass (GUI Tool)

### Connect to Your Database

1. Open **MongoDB Compass**
2. Connection String:
   - **Atlas**: Use the connection string from Step 5
   - **Local**: `mongodb://localhost:27017`
3. Click **"Connect"**

### View Your Data

1. Select database: `gate-prep`
2. Browse collections: `users`, `questions`, `testresults`
3. View, edit, or delete documents

---

## Troubleshooting

### Connection Errors

**Error: "MongoNetworkError"**
- Check internet connection (for Atlas)
- Verify IP is whitelisted (for Atlas)
- Check MongoDB service is running (for local)

**Error: "Authentication failed"**
- Verify username and password in connection string
- Check user has correct permissions in Atlas

**Error: "ECONNREFUSED"**
- MongoDB service not running (local)
- Run: `net start MongoDB`

### Common Issues

**Issue: Can't connect to Atlas**
- Whitelist your IP address
- Check connection string format
- Verify password doesn't contain special characters (URL encode if needed)

**Issue: Local MongoDB won't start**
- Check if port 27017 is available
- Verify MongoDB is installed correctly
- Check Windows Services for MongoDB

**Issue: Database is empty**
- Run the seed script: `node scripts/seedDatabase.js`
- Check if questions JSON file exists

---

## Database Backup

### Export Data (Backup)

```bash
# Export all collections
mongodump --uri="your_connection_string" --out=./backup

# Export specific collection
mongoexport --uri="your_connection_string" --collection=questions --out=questions.json
```

### Import Data (Restore)

```bash
# Import all collections
mongorestore --uri="your_connection_string" ./backup

# Import specific collection
mongoimport --uri="your_connection_string" --collection=questions --file=questions.json
```

---

## Performance Tips

1. **Indexes**: Automatically created on `_id`, add more for frequently queried fields
2. **Connection Pooling**: Already configured in `server/config/db.js`
3. **Query Optimization**: Use projections to limit returned fields
4. **Caching**: Consider Redis for frequently accessed data

---

## Security Best Practices

1. ✅ Never commit `.env` files to Git
2. ✅ Use strong passwords for database users
3. ✅ Whitelist specific IPs in production (not "0.0.0.0/0")
4. ✅ Enable MongoDB authentication
5. ✅ Use environment variables for sensitive data
6. ✅ Regularly backup your database
7. ✅ Monitor database access logs

---

## Next Steps

After database setup:

1. ✅ Test user registration and login
2. ✅ Generate and take mock tests
3. ✅ Verify data persistence (restart server, data should remain)
4. ✅ Check analytics and performance tracking
5. ✅ Deploy to production with MongoDB Atlas

---

## Quick Reference

| Task | Command |
|------|---------|
| Start with MongoDB | `node server.js` |
| Start with in-memory | `node server-inmemory.js` |
| Seed database | `node scripts/seedDatabase.js` |
| Generate questions | `python ml_service/data/enhanced_questions.py` |
| Check connection | Look for "MongoDB Connected" in console |

---

## Support

- **MongoDB Docs**: https://docs.mongodb.com/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Mongoose Docs**: https://mongoosejs.com/docs/

---

**Your database is ready! Start building! 🚀**
