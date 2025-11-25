import { Request, Response, NextFunction } from 'express';
import {
    sanitizeInput,
    isValidUUID,
    validateUUIDParams,
    generateCsrfToken,
    validateCsrfToken,
} from './security';

describe('Security Middleware Tests', () => {
    describe('Input Sanitization', () => {
        it('should sanitize XSS attempts in request body', () => {
            const req = {
                body: {
                    name: '<script>alert("xss")</script>',
                    description: 'Normal text',
                },
                query: {},
                params: {},
            } as unknown as Request;

            const res = {} as Response;
            const next = jest.fn() as NextFunction;

            sanitizeInput(req, res, next);

            expect(req.body.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
            expect(req.body.description).toBe('Normal text');
            expect(next).toHaveBeenCalled();
        });

        it('should sanitize nested objects', () => {
            const req = {
                body: {
                    user: {
                        name: '<img src=x onerror=alert(1)>',
                        email: 'test@example.com',
                    },
                },
                query: {},
                params: {},
            } as unknown as Request;

            const res = {} as Response;
            const next = jest.fn() as NextFunction;

            sanitizeInput(req, res, next);

            expect(req.body.user.name).toBe('&lt;img src=x onerror=alert(1)&gt;');
            expect(req.body.user.email).toBe('test@example.com');
            expect(next).toHaveBeenCalled();
        });

        it('should sanitize arrays', () => {
            const req = {
                body: {
                    items: ['<script>alert(1)</script>', 'safe text', '<b>bold</b>'],
                },
                query: {},
                params: {},
            } as unknown as Request;

            const res = {} as Response;
            const next = jest.fn() as NextFunction;

            sanitizeInput(req, res, next);

            expect(req.body.items[0]).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
            expect(req.body.items[1]).toBe('safe text');
            expect(req.body.items[2]).toBe('&lt;b&gt;bold&lt;&#x2F;b&gt;');
            expect(next).toHaveBeenCalled();
        });

        it('should remove null bytes', () => {
            const req = {
                body: {
                    text: 'hello\0world',
                },
                query: {},
                params: {},
            } as unknown as Request;

            const res = {} as Response;
            const next = jest.fn() as NextFunction;

            sanitizeInput(req, res, next);

            expect(req.body.text).toBe('helloworld');
            expect(next).toHaveBeenCalled();
        });

        it('should handle non-string values', () => {
            const req = {
                body: {
                    count: 42,
                    active: true,
                    data: null,
                },
                query: {},
                params: {},
            } as unknown as Request;

            const res = {} as Response;
            const next = jest.fn() as NextFunction;

            sanitizeInput(req, res, next);

            expect(req.body.count).toBe(42);
            expect(req.body.active).toBe(true);
            expect(req.body.data).toBe(null);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('UUID Validation', () => {
        it('should validate correct UUIDs', () => {
            const validUUIDs = [
                '123e4567-e89b-12d3-a456-426614174000',
                'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                '550e8400-e29b-41d4-a716-446655440000',
            ];

            validUUIDs.forEach((uuid) => {
                expect(isValidUUID(uuid)).toBe(true);
            });
        });

        it('should reject invalid UUIDs', () => {
            const invalidUUIDs = [
                'not-a-uuid',
                '123',
                '123e4567-e89b-12d3-a456',
                '123e4567-e89b-12d3-a456-42661417400g',
                'SELECT * FROM users',
                '../../../etc/passwd',
                '',
            ];

            invalidUUIDs.forEach((uuid) => {
                expect(isValidUUID(uuid)).toBe(false);
            });
        });

        it('should validate UUID parameters middleware', () => {
            const validReq = {
                params: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                },
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            const next = jest.fn() as NextFunction;

            const middleware = validateUUIDParams('id');
            middleware(validReq, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should reject invalid UUID parameters', () => {
            const invalidReq = {
                params: {
                    id: 'invalid-uuid',
                },
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            const next = jest.fn() as NextFunction;

            const middleware = validateUUIDParams('id');
            middleware(invalidReq, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid id format' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('CSRF Token Management', () => {
        it('should generate unique CSRF tokens', () => {
            const userId1 = 'user-1';
            const userId2 = 'user-2';

            const token1 = generateCsrfToken(userId1);
            const token2 = generateCsrfToken(userId2);

            expect(token1).toBeTruthy();
            expect(token2).toBeTruthy();
            expect(token1).not.toBe(token2);
            expect(token1.length).toBe(64); // 32 bytes in hex
        });

        it('should validate correct CSRF tokens', () => {
            const userId = 'test-user';
            const token = generateCsrfToken(userId);

            expect(validateCsrfToken(userId, token)).toBe(true);
        });

        it('should reject invalid CSRF tokens', () => {
            const userId = 'test-user';
            generateCsrfToken(userId);

            expect(validateCsrfToken(userId, 'invalid-token')).toBe(false);
        });

        it('should reject tokens for different users', () => {
            const userId1 = 'user-1';
            const userId2 = 'user-2';

            const token1 = generateCsrfToken(userId1);

            expect(validateCsrfToken(userId2, token1)).toBe(false);
        });

        it('should reject tokens for non-existent users', () => {
            expect(validateCsrfToken('non-existent-user', 'some-token')).toBe(false);
        });
    });
});
