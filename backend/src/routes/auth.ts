import express, { Request, Response } from 'express';
import passport from 'passport';
import { generateTokens, verifyToken } from '../utils/jwt';
import { UserRow } from '../types/models';
import { authRateLimiter, generateCsrfToken } from '../middleware/security';

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Initiate Google OAuth flow
 * GET /api/auth/google
 */
router.get(
    '/google',
    authRateLimiter,
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })
);

/**
 * Google OAuth callback
 * GET /api/auth/callback
 */
router.get(
    '/callback',
    authRateLimiter,
    (req: Request, res: Response, next) => {
        console.log('OAuth callback received');
        console.log('Query params:', req.query);
        console.log('Callback URL configured:', process.env.GOOGLE_CALLBACK_URL);
        next();
    },
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`,
    }),
    (req: Request, res: Response) => {
        try {
            const user = req.user as unknown as UserRow;

            if (!user) {
                res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
                return;
            }

            // Generate JWT tokens
            const tokens = generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role,
            });

            // Generate CSRF token
            const csrfToken = generateCsrfToken(user.id);

            // Set tokens in httpOnly, secure cookies
            res.cookie('accessToken', tokens.accessToken, {
                httpOnly: true,
                secure: NODE_ENV === 'production',
                sameSite: NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: NODE_ENV === 'production',
                sameSite: NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours (session timeout)
            });

            // Set CSRF token in a readable cookie (not httpOnly so frontend can access it)
            res.cookie('csrfToken', csrfToken, {
                httpOnly: false,
                secure: NODE_ENV === 'production',
                sameSite: NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
            });

            // Redirect to frontend dashboard
            res.redirect(`${FRONTEND_URL}/dashboard`);
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
        }
    }
);

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh
 */
router.post('/refresh', authRateLimiter, (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).json({ error: 'Refresh token required' });
            return;
        }

        // Verify refresh token
        const payload = verifyToken(refreshToken);

        // Generate new access token
        const tokens = generateTokens({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        });

        // Set new access token in cookie
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
});

/**
 * Logout user
 * POST /api/auth/logout
 */
router.post('/logout', (_req: Request, res: Response) => {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('csrfToken');

    res.json({ message: 'Logged out successfully' });
});

/**
 * Get current user info
 * GET /api/auth/me
 */
router.get('/me', (req: Request, res: Response) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const payload = verifyToken(token);
        res.json({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        });
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
});

export default router;
