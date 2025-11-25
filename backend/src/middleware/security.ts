import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

/**
 * Input sanitization middleware
 * Sanitizes user inputs to prevent XSS and injection attacks
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
    // Sanitize body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }

    return obj;
}

/**
 * Sanitize a string by removing potentially dangerous characters
 */
function sanitizeString(str: string): string {
    if (typeof str !== 'string') {
        return str;
    }

    // Remove null bytes
    str = str.replace(/\0/g, '');

    // Escape HTML special characters to prevent XSS
    str = str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    return str;
}

/**
 * Rate limiting configurations for different endpoint types
 */

// General API rate limiter - 100 requests per 15 minutes
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Authentication rate limiter - 5 requests per 15 minutes
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Admin operations rate limiter - 50 requests per 15 minutes
export const adminRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    message: 'Too many admin requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Test submission rate limiter - 10 submissions per hour
export const testSubmissionRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many test submissions, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Bulk import rate limiter - 3 requests per hour
export const bulkImportRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many bulk import requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * CSRF Protection Middleware
 * Generates and validates CSRF tokens for state-changing operations
 */

// Store for CSRF tokens (in production, use Redis)
const csrfTokenStore = new Map<string, { token: string; expiresAt: number }>();

/**
 * Generate a CSRF token for a user session
 */
export function generateCsrfToken(userId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    csrfTokenStore.set(userId, { token, expiresAt });

    // Clean up expired tokens
    cleanupExpiredTokens();

    return token;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(userId: string, token: string): boolean {
    const stored = csrfTokenStore.get(userId);

    if (!stored) {
        return false;
    }

    if (stored.expiresAt < Date.now()) {
        csrfTokenStore.delete(userId);
        return false;
    }

    return stored.token === token;
}

/**
 * Middleware to validate CSRF token for state-changing operations
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        next();
        return;
    }

    const userId = req.user?.userId;

    if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    // Get CSRF token from header or body
    const token = req.headers['x-csrf-token'] as string || req.body._csrf;

    if (!token) {
        res.status(403).json({ error: 'CSRF token missing' });
        return;
    }

    if (!validateCsrfToken(userId, token)) {
        res.status(403).json({ error: 'Invalid CSRF token' });
        return;
    }

    next();
}

/**
 * Clean up expired CSRF tokens
 */
function cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [userId, data] of csrfTokenStore.entries()) {
        if (data.expiresAt < now) {
            csrfTokenStore.delete(userId);
        }
    }
}

/**
 * Session timeout middleware
 * Validates that the session hasn't exceeded 24 hours
 */
export function sessionTimeout(req: Request, res: Response, next: NextFunction): void {
    const user = req.user;

    if (!user) {
        next();
        return;
    }

    // Check if token has 'iat' (issued at) claim
    const issuedAt = (user as any).iat;

    if (!issuedAt) {
        next();
        return;
    }

    const now = Math.floor(Date.now() / 1000);
    const sessionAge = now - issuedAt;
    const maxSessionAge = 24 * 60 * 60; // 24 hours in seconds

    if (sessionAge > maxSessionAge) {
        res.status(401).json({
            error: 'Session expired',
            message: 'Your session has exceeded 24 hours. Please log in again.',
        });
        return;
    }

    next();
}

/**
 * Validate UUID format to prevent injection
 */
export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Middleware to validate UUID parameters
 */
export function validateUUIDParams(...paramNames: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        for (const paramName of paramNames) {
            const value = req.params[paramName];
            if (value && !isValidUUID(value)) {
                res.status(400).json({ error: `Invalid ${paramName} format` });
                return;
            }
        }
        next();
    };
}
