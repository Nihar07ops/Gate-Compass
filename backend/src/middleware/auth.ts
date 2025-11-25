import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';

// Extend Express Request to include user
declare module 'express-serve-static-core' {
    interface Request {
        user?: TokenPayload & { iat?: number };
    }
}

/**
 * Middleware to authenticate requests using JWT tokens
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        // Verify token
        const payload = verifyToken(token) as any;

        // Check session timeout (24 hours)
        if (payload.iat) {
            const now = Math.floor(Date.now() / 1000);
            const sessionAge = now - payload.iat;
            const maxSessionAge = 24 * 60 * 60; // 24 hours in seconds

            if (sessionAge > maxSessionAge) {
                res.status(401).json({
                    error: 'Session expired',
                    message: 'Your session has exceeded 24 hours. Please log in again.',
                });
                return;
            }
        }

        req.user = payload;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Middleware to check if user has admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }

    next();
}
