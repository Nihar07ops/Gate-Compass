# 🚀 Demo Mode Instructions

## Quick Fix for Login Issues

If you're getting "invalid credentials" errors, you can force demo mode in several ways:

### Method 1: URL Parameter (Easiest)
Add `?demo=true` to your URL:
```
http://localhost:3000?demo=true
```

### Method 2: Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Run this command:
```javascript
localStorage.setItem('forceDemo', 'true'); 
window.location.reload();
```

### Method 3: Environment Variable
Set the environment variable:
```bash
VITE_DEMO_MODE=true npm run dev
```

## Demo Mode Features

When demo mode is active, you'll see:
- ✅ Demo banner at the top
- ✅ Login works with any email/password
- ✅ Mock data for all features
- ✅ No backend required

## To Disable Demo Mode

Run in browser console:
```javascript
localStorage.removeItem('forceDemo'); 
window.location.reload();
```

## Current Demo Mode Status

Demo mode is automatically enabled when:
- `NODE_ENV === 'production'` (GitHub Pages)
- `VITE_DEMO_MODE === 'true'` (environment variable)
- URL contains `demo=true` parameter
- localStorage has `forceDemo=true`
- Hostname includes `github.io`

## Test Credentials (Demo Mode)

When in demo mode, login with:
- **Email**: Any email (e.g., `test@example.com`)
- **Password**: Any password (e.g., `password123`)

The demo will simulate a realistic GATE preparation platform experience!