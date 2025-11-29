# MongoDB Atlas Setup (Free - 2 Minutes)

## Quick Setup Steps

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register

2. **Create Free Account**:
   - Sign up with email or Google
   - Choose "Free" tier (M0 Sandbox)

3. **Create Cluster**:
   - Click "Build a Database"
   - Select "FREE" (M0)
   - Choose any cloud provider and region
   - Click "Create"

4. **Setup Database Access**:
   - Go to "Database Access" in left menu
   - Click "Add New Database User"
   - Username: `gateuser`
   - Password: `gatepass123` (or your choice)
   - Click "Add User"

5. **Setup Network Access**:
   - Go to "Network Access" in left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. **Get Connection String**:
   - Go to "Database" in left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://gateuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

7. **Update .env file**:
   - Open `server/.env`
   - Replace `<password>` with your actual password
   - Update the MONGODB_URI line:
   ```
   MONGODB_URI=mongodb+srv://gateuser:gatepass123@cluster0.xxxxx.mongodb.net/gate-prep?retryWrites=true&w=majority
   ```

8. **Restart Server**:
   - Stop the server (Ctrl+C in terminal)
   - Start again: `npm run dev`

## Alternative: Local MongoDB

If you prefer local MongoDB:

1. **Download MongoDB**: https://www.mongodb.com/try/download/community
2. **Install** and start MongoDB service
3. **Keep the default** in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/gate-prep
   ```

## Verify Connection

After setup, you should see in server terminal:
```
MongoDB connected
Server running on port 5000
```

Then try registering again!
