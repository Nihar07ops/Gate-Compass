# Authentication Context

This directory contains the authentication context and related functionality for GATE COMPASS.

## Files

- `AuthContext.tsx` - Main authentication context provider
- `AuthContext.test.tsx` - Unit tests for authentication context

## Features

### AuthContext

The `AuthContext` provides authentication state management across the application:

- **User State Management**: Tracks current user authentication status
- **Automatic Token Refresh**: Refreshes access tokens every 14 minutes (before 15-minute expiry)
- **Session Persistence**: Maintains user sessions using httpOnly cookies
- **Error Handling**: Provides user-friendly error messages for authentication failures

### API Integration

The context integrates with the following backend endpoints:

- `GET /api/auth/me` - Check current authentication status
- `GET /api/auth/google` - Initiate Google OAuth flow
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Usage

```tsx
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Wrap your app with AuthProvider
function App() {
  return (
    <AuthProvider>
      <YourComponents />
    </AuthProvider>
  );
}

// Use the hook in components
function MyComponent() {
  const { user, loading, error, login, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <button onClick={login}>Login</button>;
  
  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Security

- Tokens are stored in httpOnly cookies (managed by backend)
- Axios is configured to include credentials with all requests
- Automatic token refresh prevents session expiration during active use
- Session timeout after 7 days (refresh token expiry)
