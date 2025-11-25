import { Request, Response, NextFunction } from 'express';
import { authenticateToken, requireAdmin } from './auth';
import { generateTokens } from '../utils/jwt';

describe('Authentication Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            cookies: {},
            headers: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        nextFunction = jest.fn();
    });

    describe('authenticateToken', () => {
        it('should authenticate valid token from cookie', () => {
            const tokens = generateTokens({
                userId: 'test-user',
                email: 'test@example.com',
                role: 'user',
            });

            mockRequest.cookies = { accessToken: tokens.accessToken };

            authenticateToken(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user).toBeDefined();
            expect(mockRequest.user?.userId).toBe('test-user');
        });

        it('should authenticate valid token from Authorization header', () => {
            const tokens = generateTokens({
                userId: 'test-user',
                email: 'test@example.com',
                role: 'user',
            });

            mockRequest.headers = {
                authorization: `Bearer ${tokens.accessToken}`,
            };

            authenticateToken(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
            expect(mockRequest.user).toBeDefined();
        });

        it('should reject request without token', () => {
            authenticateToken(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Authentication required',
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should reject request with invalid token', () => {
            mockRequest.cookies = { accessToken: 'invalid-token' };

            authenticateToken(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Invalid or expired token',
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('requireAdmin', () => {
        it('should allow admin users', () => {
            mockRequest.user = {
                userId: 'admin-user',
                email: 'admin@example.com',
                role: 'admin',
            };

            requireAdmin(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(nextFunction).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should reject non-admin users', () => {
            mockRequest.user = {
                userId: 'regular-user',
                email: 'user@example.com',
                role: 'user',
            };

            requireAdmin(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Admin access required',
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should reject unauthenticated requests', () => {
            requireAdmin(
                mockRequest as Request,
                mockResponse as Response,
                nextFunction
            );

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Authentication required',
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });
});
