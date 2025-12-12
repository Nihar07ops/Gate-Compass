# Login Credentials for Testing

## Default Test User
- **Email**: `test@example.com`
- **Password**: `password123`

This user is automatically created in the in-memory database when the server starts.

## Authentication Issues Fixed

### Issues Resolved:
1. **Race Condition**: Removed `window.location.href` redirects that bypassed React Router
2. **Token Validation**: Improved error handling in `fetchUser` function
3. **Redirect Loops**: Fixed wildcard route to redirect to `/` instead of `/dashboard`
4. **Authentication State**: Better handling of authentication failures and token cleanup
5. **Navigation**: Proper redirect to intended page after login

### How Authentication Works Now:
1. User enters credentials on login page
2. AuthContext handles login API call
3. On success, token is stored and user state is updated
4. React Router navigates to intended page (or dashboard by default)
5. ProtectedRoute checks authentication state before rendering protected pages
6. If authentication fails, user is redirected to login with return path saved

### Testing:
1. Start the servers: `npm run dev` in both `client` and `server` directories
2. Use the test credentials above
3. Login should work consistently without redirect issues