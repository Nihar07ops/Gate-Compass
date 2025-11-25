import { generateTokens, verifyToken, decodeToken } from './jwt';

describe('JWT Utilities', () => {
    const mockPayload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user' as const,
    };

    describe('generateTokens', () => {
        it('should generate access and refresh tokens', () => {
            const tokens = generateTokens(mockPayload);

            expect(tokens).toHaveProperty('accessToken');
            expect(tokens).toHaveProperty('refreshToken');
            expect(typeof tokens.accessToken).toBe('string');
            expect(typeof tokens.refreshToken).toBe('string');
            expect(tokens.accessToken.length).toBeGreaterThan(0);
            expect(tokens.refreshToken.length).toBeGreaterThan(0);
        });

        it('should generate different tokens for different payloads', () => {
            const tokens1 = generateTokens(mockPayload);
            const tokens2 = generateTokens({
                ...mockPayload,
                userId: 'different-user-id',
            });

            expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
            expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
        });
    });

    describe('verifyToken', () => {
        it('should verify and decode a valid token', () => {
            const tokens = generateTokens(mockPayload);
            const decoded = verifyToken(tokens.accessToken);

            expect(decoded.userId).toBe(mockPayload.userId);
            expect(decoded.email).toBe(mockPayload.email);
            expect(decoded.role).toBe(mockPayload.role);
        });

        it('should throw error for invalid token', () => {
            expect(() => verifyToken('invalid-token')).toThrow('Invalid or expired token');
        });

        it('should throw error for empty token', () => {
            expect(() => verifyToken('')).toThrow('Invalid or expired token');
        });
    });

    describe('decodeToken', () => {
        it('should decode a valid token without verification', () => {
            const tokens = generateTokens(mockPayload);
            const decoded = decodeToken(tokens.accessToken);

            expect(decoded).not.toBeNull();
            expect(decoded?.userId).toBe(mockPayload.userId);
            expect(decoded?.email).toBe(mockPayload.email);
        });

        it('should return null for invalid token', () => {
            const decoded = decodeToken('invalid-token');
            expect(decoded).toBeNull();
        });
    });
});
