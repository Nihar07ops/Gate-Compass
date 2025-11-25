# Security Measures

This document outlines the security measures implemented in the GATE COMPASS backend API.

## Overview

The application implements multiple layers of security to protect against common web vulnerabilities and ensure data integrity.

## Security Features

### 1. Input Sanitization

**Location:** `backend/src/middleware/security.ts`

All user inputs (body, query parameters, URL parameters) are automatically sanitized to prevent:
- XSS (Cross-Site Scripting) attacks
- SQL injection attempts
- Null byte injection

**Implementation:**
- HTML special characters are escaped
- Null bytes are removed
- Applied globally via middleware in `index.ts`

### 2. Rate Limiting

**Location:** `backend/src/middleware/security.ts`

Different rate limits are applied based on endpoint sensitivity:

| Endpoint Type | Limit | Window | Purpose |
|--------------|-------|--------|---------|
| General API | 100 requests | 15 minutes | Prevent API abuse |
| Authentication | 5 requests | 15 minutes | Prevent brute force attacks |
| Admin Operations | 50 requests | 15 minutes | Protect admin endpoints |
| Test Submission | 10 requests | 1 hour | Prevent test spam |
| Bulk Import | 3 requests | 1 hour | Protect resource-intensive operations |

**Implementation:**
- Uses `express-rate-limit` package
- Applied per-route or globally
- Returns 429 status code when limit exceeded

### 3. CSRF Protection

**Location:** `backend/src/middleware/security.ts`

Cross-Site Request Forgery protection for all state-changing operations:

**How it works:**
1. CSRF token generated on successful authentication
2. Token stored server-side with 24-hour expiration
3. Token sent to client in readable cookie
4. Client includes token in `X-CSRF-Token` header for POST/PUT/DELETE/PATCH requests
5. Server validates token before processing request

**Implementation:**
- Applied to all state-changing routes
- Skips GET, HEAD, OPTIONS requests
- Returns 403 status code for invalid/missing tokens

### 4. Secure Cookie Configuration

**Location:** `backend/src/routes/auth.ts`

All cookies are configured with security best practices:

```typescript
{
    httpOnly: true,              // Prevents JavaScript access (XSS protection)
    secure: NODE_ENV === 'production',  // HTTPS only in production
    sameSite: 'strict',          // CSRF protection
    maxAge: <appropriate_duration>
}
```

**Cookie Types:**
- `accessToken`: 15 minutes, httpOnly
- `refreshToken`: 24 hours, httpOnly
- `csrfToken`: 24 hours, readable (needed by frontend)

### 5. Session Timeout

**Location:** `backend/src/middleware/auth.ts`

Sessions automatically expire after 24 hours:

**Implementation:**
- JWT tokens include `iat` (issued at) claim
- Middleware checks token age on each request
- Sessions exceeding 24 hours are rejected
- User must re-authenticate

### 6. SQL Injection Prevention

**Location:** All database queries throughout the application

**Implementation:**
- All queries use parameterized statements via `pg` library
- No string concatenation for SQL queries
- Example:
  ```typescript
  pool.query('SELECT * FROM users WHERE id = $1', [userId])
  ```

### 7. UUID Validation

**Location:** `backend/src/middleware/security.ts`

All UUID parameters are validated before processing:

**Implementation:**
- Validates UUID format using regex
- Applied to route parameters
- Prevents injection attacks via malformed IDs
- Returns 400 status code for invalid UUIDs

### 8. Authentication & Authorization

**Location:** `backend/src/middleware/auth.ts`

**Features:**
- JWT-based authentication
- Role-based access control (user/admin)
- Token verification on protected routes
- Automatic session timeout validation

### 9. Helmet.js Security Headers

**Location:** `backend/src/index.ts`

Helmet.js sets various HTTP headers for security:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)
- Content-Security-Policy

### 10. CORS Configuration

**Location:** `backend/src/index.ts`

Cross-Origin Resource Sharing is configured to:
- Allow only specified frontend origin
- Enable credentials (cookies)
- Prevent unauthorized cross-origin requests

### 11. Payload Size Limits

**Location:** `backend/src/index.ts`

Request body size is limited to prevent DoS attacks:
```typescript
express.json({ limit: '10mb' })
express.urlencoded({ extended: true, limit: '10mb' })
```

## Security Best Practices

### For Developers

1. **Never disable security middleware** without proper justification
2. **Always use parameterized queries** for database operations
3. **Validate all user inputs** at the service layer as well
4. **Use HTTPS in production** - set `NODE_ENV=production`
5. **Keep dependencies updated** - regularly run `npm audit`
6. **Never log sensitive data** (passwords, tokens, etc.)
7. **Use environment variables** for secrets and configuration

### For Deployment

1. Set `NODE_ENV=production` in production environment
2. Use strong `JWT_SECRET` (minimum 32 characters)
3. Enable HTTPS/TLS on the server
4. Configure firewall rules to restrict database access
5. Set up monitoring and alerting for security events
6. Regularly backup database with encryption
7. Implement log rotation and secure log storage

## Environment Variables

Required security-related environment variables:

```bash
# JWT Configuration
JWT_SECRET=<strong-random-secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Environment
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=https://your-api-domain.com/api/auth/callback
```

## Testing Security

### Manual Testing

1. **Rate Limiting:**
   ```bash
   # Should return 429 after limit exceeded
   for i in {1..10}; do curl http://localhost:5000/api/auth/google; done
   ```

2. **CSRF Protection:**
   ```bash
   # Should return 403 without CSRF token
   curl -X POST http://localhost:5000/api/tests/generate \
     -H "Cookie: accessToken=<token>" \
     -H "Content-Type: application/json"
   ```

3. **Session Timeout:**
   - Generate token
   - Wait 24+ hours
   - Make request with old token
   - Should return 401

4. **UUID Validation:**
   ```bash
   # Should return 400
   curl http://localhost:5000/api/tests/invalid-uuid
   ```

### Automated Testing

Security tests should be added to the test suite:
- Input sanitization tests
- CSRF token validation tests
- Rate limiting tests
- Session timeout tests
- UUID validation tests

## Incident Response

If a security vulnerability is discovered:

1. **Do not** disclose publicly until patched
2. Document the vulnerability and impact
3. Develop and test a fix
4. Deploy the fix to production immediately
5. Notify affected users if necessary
6. Conduct post-mortem analysis

## Compliance

This implementation addresses requirements:
- **Requirement 1.3:** Secure user authentication and session management
- **Requirement 1.5:** Session persistence and timeout
- **Requirement 8.1:** Input validation and sanitization

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
