# Authentication Testing Guide

## ✅ Services Running

All three services are now running:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000  
- **ML Service**: http://localhost:8000

## ✅ Backend API Tested & Working

The authentication endpoints have been tested and are working correctly:
- ✅ Register endpoint: `POST /api/auth/register`
- ✅ Login endpoint: `POST /api/auth/login`

## Test Credentials

You can use these credentials to test:
- **Email**: test@example.com
- **Password**: password123

## How to Test

### Option 1: Use the Main Application
1. Open http://localhost:3000 in your browser
2. Click "Register here" to create a new account
3. Fill in your details and submit
4. Or use the test credentials above to login

### Option 2: Use the Test Page
1. Open `test-auth.html` in your browser (located in the project root)
2. Try registering with a new email
3. Try logging in with the credentials

## Troubleshooting

If you're still having issues:

1. **Check Browser Console** (F12 → Console tab)
   - Look for any red error messages
   - Check if there are CORS errors
   - Verify the API requests are going to http://localhost:5000

2. **Check Network Tab** (F12 → Network tab)
   - Try to login/register
   - Look for the request to `/api/auth/login` or `/api/auth/register`
   - Check the response status code and body

3. **Common Issues**:
   - **CORS Error**: The server has CORS enabled, but if you see this, restart the server
   - **Network Error**: Make sure all services are running (check the terminal windows)
   - **401 Unauthorized**: Check if you're using the correct credentials

## Current Setup

- Using **in-memory database** (data will be lost when server restarts)
- No MongoDB required for testing
- JWT tokens are stored in localStorage

## What to Share

If you're still having issues, please share:
1. The exact error message you see
2. A screenshot of the browser console (F12)
3. What happens when you try to register/login
