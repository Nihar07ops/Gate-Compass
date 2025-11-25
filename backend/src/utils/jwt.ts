import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export interface TokenPayload {
    userId: string;
    email: string;
    role: 'user' | 'admin';
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

/**
 * Generate access and refresh tokens for a user
 */
export function generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRY as string,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRY as string,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Decode token without verification (for expired token refresh)
 */
export function decodeToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.decode(token) as TokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}
