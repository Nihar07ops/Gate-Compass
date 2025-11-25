import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import pool from './database';
import { UserRow } from '../types/models';

/**
 * Configure Passport with Google OAuth 2.0 strategy
 */
export function configurePassport(): void {
    // Read environment variables inside the function, after dotenv has loaded them
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
    const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/callback';

    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: GOOGLE_CALLBACK_URL,
            },
            async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
                try {
                    const googleId = profile.id;
                    const email = profile.emails?.[0]?.value || '';
                    const name = profile.displayName || '';
                    const profilePicture = profile.photos?.[0]?.value || '';

                    // Check if user exists
                    const existingUserResult = await pool.query<UserRow>(
                        'SELECT * FROM users WHERE google_id = $1',
                        [googleId]
                    );

                    let user: UserRow;

                    if (existingUserResult.rows.length > 0) {
                        // Update last login time
                        const updateResult = await pool.query<UserRow>(
                            'UPDATE users SET last_login_at = NOW() WHERE google_id = $1 RETURNING *',
                            [googleId]
                        );
                        user = updateResult.rows[0];
                    } else {
                        // Create new user
                        const insertResult = await pool.query<UserRow>(
                            `INSERT INTO users (google_id, email, name, profile_picture, role, created_at, last_login_at)
                             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                             RETURNING *`,
                            [googleId, email, name, profilePicture, 'user']
                        );
                        user = insertResult.rows[0];
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error as Error, undefined);
                }
            }
        )
    );

    // Serialize user for session
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id: string, done) => {
        try {
            const result = await pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
            if (result.rows.length > 0) {
                done(null, result.rows[0]);
            } else {
                done(new Error('User not found'), null);
            }
        } catch (error) {
            done(error, null);
        }
    });
}
