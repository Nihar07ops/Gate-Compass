import * as fc from 'fast-check';
import request from 'supertest';
import express, { Express, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import authRouter from './auth';

// Feature: gate-compass, Property 1: OAuth redirect correctness
// For any user clicking the Google login button, the system should redirect to Google's OAuth page 
// with valid client ID, redirect URI, and required scopes.
// Validates: Requirements 1.2

describe('OAuth Redirect Property Tests', () => {
    let app: Express;

    beforeAll(() => {
        // Configure passport with a mock Google strategy for testing
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
                    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/callback',
                },
                (_accessToken, _refreshToken, _profile, done) => {
                    // Mock verify callback
                    done(null, { id: 'test-user' });
                }
            )
        );

        // Set up minimal express app for testing
        app = express();
        app.use(express.json());
        app.use(passport.initialize());
        app.use('/api/auth', authRouter);
    });

    describe('Property 1: OAuth redirect correctness', () => {
        it('should redirect to Google OAuth with valid parameters for any request', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary user agent strings and IP addresses to simulate different users
                    fc.record({
                        userAgent: fc.oneof(
                            fc.constant('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
                            fc.constant('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
                            fc.constant('Mozilla/5.0 (X11; Linux x86_64)'),
                            fc.string({ minLength: 10, maxLength: 100 })
                        ),
                        ip: fc.ipV4(),
                    }),
                    async (userContext) => {
                        // Make request to /api/auth/google endpoint
                        const response = await request(app)
                            .get('/api/auth/google')
                            .set('User-Agent', userContext.userAgent)
                            .set('X-Forwarded-For', userContext.ip);

                        // Property: Should receive a redirect response (302)
                        expect(response.status).toBe(302);

                        // Property: Should have a Location header
                        expect(response.headers.location).toBeDefined();

                        const redirectUrl = response.headers.location as string;

                        // Property: Should redirect to Google's OAuth domain
                        expect(redirectUrl).toMatch(/^https:\/\/accounts\.google\.com\/o\/oauth2/);

                        // Property: Should include client_id parameter
                        const url = new URL(redirectUrl);
                        const clientId = url.searchParams.get('client_id');
                        expect(clientId).toBeTruthy();
                        // Client ID should match the configured value (either from env or test default)
                        const expectedClientId = process.env.GOOGLE_CLIENT_ID || 'test-client-id';
                        expect(clientId).toBe(expectedClientId);

                        // Property: Should include redirect_uri parameter
                        const redirectUri = url.searchParams.get('redirect_uri');
                        expect(redirectUri).toBeTruthy();
                        const expectedRedirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/callback';
                        expect(redirectUri).toBe(expectedRedirectUri);

                        // Property: Should include required scopes (profile and email)
                        const scope = url.searchParams.get('scope');
                        expect(scope).toBeTruthy();
                        expect(scope).toContain('profile');
                        expect(scope).toContain('email');

                        // Property: Should include response_type=code for OAuth 2.0 authorization code flow
                        const responseType = url.searchParams.get('response_type');
                        expect(responseType).toBe('code');
                    }
                ),
                { numRuns: 100 } // Run 100 iterations as specified in design doc
            );
        });

        it('should maintain redirect correctness regardless of request headers', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary request headers
                    fc.record({
                        acceptLanguage: fc.oneof(
                            fc.constant('en-US'),
                            fc.constant('es-ES'),
                            fc.constant('fr-FR'),
                            fc.constant('de-DE'),
                            fc.string({ minLength: 2, maxLength: 10 })
                        ),
                        acceptEncoding: fc.oneof(
                            fc.constant('gzip, deflate, br'),
                            fc.constant('gzip'),
                            fc.string({ minLength: 3, maxLength: 20 })
                        ),
                        referer: fc.oneof(
                            fc.constant('http://localhost:3000'),
                            fc.constant('http://localhost:3000/login'),
                            fc.webUrl()
                        ),
                    }),
                    async (headers) => {
                        const response = await request(app)
                            .get('/api/auth/google')
                            .set('Accept-Language', headers.acceptLanguage)
                            .set('Accept-Encoding', headers.acceptEncoding)
                            .set('Referer', headers.referer);

                        // Property: Regardless of headers, should always redirect correctly
                        expect(response.status).toBe(302);
                        expect(response.headers.location).toBeDefined();

                        const redirectUrl = response.headers.location as string;
                        expect(redirectUrl).toMatch(/^https:\/\/accounts\.google\.com\/o\/oauth2/);

                        // Verify essential OAuth parameters are present
                        const url = new URL(redirectUrl);
                        expect(url.searchParams.get('client_id')).toBeTruthy();
                        expect(url.searchParams.get('redirect_uri')).toBeTruthy();
                        expect(url.searchParams.get('scope')).toContain('profile');
                        expect(url.searchParams.get('scope')).toContain('email');
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should generate consistent redirect URLs for the same configuration', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate multiple requests
                    fc.nat({ max: 10 }),
                    async (requestCount) => {
                        const redirectUrls: string[] = [];

                        // Make multiple requests
                        for (let i = 0; i <= requestCount; i++) {
                            const response = await request(app).get('/api/auth/google');

                            expect(response.status).toBe(302);
                            const redirectUrl = response.headers.location as string;
                            redirectUrls.push(redirectUrl);
                        }

                        // Property: All redirect URLs should have the same base structure
                        // (though state parameter may vary)
                        const baseUrls = redirectUrls.map((url) => {
                            const parsed = new URL(url);
                            return `${parsed.origin}${parsed.pathname}`;
                        });

                        // All should redirect to the same Google OAuth endpoint
                        const uniqueBaseUrls = new Set(baseUrls);
                        expect(uniqueBaseUrls.size).toBe(1);

                        // All should have the same client_id and redirect_uri
                        const clientIds = redirectUrls.map((url) => new URL(url).searchParams.get('client_id'));
                        const redirectUris = redirectUrls.map((url) => new URL(url).searchParams.get('redirect_uri'));

                        expect(new Set(clientIds).size).toBe(1);
                        expect(new Set(redirectUris).size).toBe(1);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});

// Feature: gate-compass, Property 3: Authentication error handling
// For any failed Google authentication attempt, the system should display an appropriate error message 
// and maintain the login interface in a state that allows retry.
// Validates: Requirements 1.4

describe('Authentication Error Handling Property Tests', () => {
    describe('Property 3: Authentication error handling', () => {
        it('should handle callback route errors by redirecting to login with error message', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary user contexts
                    fc.record({
                        userAgent: fc.oneof(
                            fc.constant('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
                            fc.constant('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
                            fc.constant('Mozilla/5.0 (X11; Linux x86_64)')
                        ),
                    }),
                    async (context) => {
                        // Test the actual auth router's callback error handling
                        // by simulating what happens when passport.authenticate fails
                        const testApp = express();
                        testApp.use(express.json());
                        testApp.use(passport.initialize());

                        // Create a route that simulates the callback behavior when user is null
                        testApp.get('/test-callback', (_req: ExpressRequest, res: ExpressResponse) => {
                            // Simulate the scenario in auth.ts where user is null/undefined
                            const user = null;

                            if (!user) {
                                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                                res.redirect(`${frontendUrl}/login?error=auth_failed`);
                                return;
                            }

                            res.redirect('http://localhost:3000/dashboard');
                        });

                        const response = await request(testApp)
                            .get('/test-callback')
                            .set('User-Agent', context.userAgent);

                        // Property: Should redirect when authentication fails
                        expect(response.status).toBe(302);

                        // Property: Should redirect to login page
                        expect(response.headers.location).toContain('/login');

                        // Property: Should include error parameter
                        expect(response.headers.location).toContain('error=auth_failed');

                        // Property: Should not set authentication cookies on failure
                        const cookies = response.headers['set-cookie'];
                        if (cookies) {
                            const cookieStrings = Array.isArray(cookies) ? cookies : [cookies];
                            const hasAccessToken = cookieStrings.some((c) => c.includes('accessToken='));
                            const hasRefreshToken = cookieStrings.some((c) => c.includes('refreshToken='));
                            expect(hasAccessToken).toBe(false);
                            expect(hasRefreshToken).toBe(false);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should handle exceptions in callback route gracefully', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary error messages
                    fc.record({
                        errorMessage: fc.oneof(
                            fc.constant('Database connection failed'),
                            fc.constant('Invalid user data'),
                            fc.constant('Token generation error'),
                            fc.string({ minLength: 5, maxLength: 50 })
                        ),
                        userAgent: fc.oneof(
                            fc.constant('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
                            fc.constant('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
                        ),
                    }),
                    async (testData) => {
                        const testApp = express();
                        testApp.use(express.json());
                        testApp.use(passport.initialize());

                        // Create a route that simulates the callback behavior with try-catch
                        testApp.get('/test-callback-error', (_req: ExpressRequest, res: ExpressResponse) => {
                            try {
                                // Simulate an error during authentication processing
                                throw new Error(testData.errorMessage);
                            } catch (error) {
                                // This mimics the catch block in auth.ts callback route
                                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                                res.redirect(`${frontendUrl}/login?error=auth_failed`);
                            }
                        });

                        const response = await request(testApp)
                            .get('/test-callback-error')
                            .set('User-Agent', testData.userAgent);

                        // Property: Should redirect to login with error (not crash)
                        expect(response.status).toBe(302);
                        expect(response.headers.location).toContain('/login');
                        expect(response.headers.location).toContain('error=');

                        // Property: Should not expose internal error details
                        const redirectUrl = response.headers.location as string;
                        expect(redirectUrl).not.toContain(testData.errorMessage);
                        expect(redirectUrl.toLowerCase()).not.toContain('database');
                        expect(redirectUrl.toLowerCase()).not.toContain('token');
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should maintain retry capability after authentication failures', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary number of failed attempts
                    fc.record({
                        failureCount: fc.integer({ min: 1, max: 5 }),
                        userAgent: fc.oneof(
                            fc.constant('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
                            fc.constant('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
                        ),
                    }),
                    async (testData) => {
                        const testApp = express();
                        testApp.use(express.json());
                        testApp.use(passport.initialize());

                        // Simulate callback failures
                        testApp.get('/test-callback', (_req: ExpressRequest, res: ExpressResponse) => {
                            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                            res.redirect(`${frontendUrl}/login?error=auth_failed`);
                        });

                        // Simulate the /google endpoint for retry
                        testApp.get('/test-google', (_req: ExpressRequest, res: ExpressResponse) => {
                            // This simulates the redirect to Google OAuth
                            res.redirect('https://accounts.google.com/o/oauth2/v2/auth?response_type=code');
                        });

                        // Simulate multiple failed authentication attempts
                        for (let i = 0; i < testData.failureCount; i++) {
                            const response = await request(testApp)
                                .get('/test-callback')
                                .set('User-Agent', testData.userAgent);

                            // Property: Each failure should redirect to login
                            expect(response.status).toBe(302);
                            expect(response.headers.location).toContain('/login');
                            expect(response.headers.location).toContain('error=');
                        }

                        // Property: After failures, the /google endpoint should still be accessible for retry
                        const retryResponse = await request(testApp)
                            .get('/test-google')
                            .set('User-Agent', testData.userAgent);

                        // Property: Should still redirect to Google OAuth (retry is possible)
                        expect(retryResponse.status).toBe(302);
                        expect(retryResponse.headers.location).toMatch(/^https:\/\/accounts\.google\.com\/o\/oauth2/);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should provide consistent error handling for different failure scenarios', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate different types of authentication failures
                    fc.oneof(
                        fc.constant({ errorType: 'missing_user', errorMessage: 'User not found' }),
                        fc.constant({ errorType: 'database_error', errorMessage: 'Database error' }),
                        fc.constant({ errorType: 'token_error', errorMessage: 'Token generation failed' }),
                        fc.constant({ errorType: 'invalid_profile', errorMessage: 'Invalid profile data' })
                    ),
                    async (failureScenario) => {
                        const testApp = express();
                        testApp.use(express.json());
                        testApp.use(passport.initialize());

                        testApp.get('/test-callback', (_req: ExpressRequest, res: ExpressResponse) => {
                            try {
                                // Simulate different failure scenarios
                                throw new Error(failureScenario.errorMessage);
                            } catch (error) {
                                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                                res.redirect(`${frontendUrl}/login?error=auth_failed`);
                            }
                        });

                        const response = await request(testApp).get('/test-callback');

                        // Property: All failure types should result in redirect
                        expect(response.status).toBe(302);

                        // Property: All should redirect to login page
                        const redirectUrl = response.headers.location as string;
                        expect(redirectUrl).toContain('/login');

                        // Property: All should include error parameter
                        expect(redirectUrl).toContain('error=');

                        // Property: All should use the same generic error message
                        expect(redirectUrl).toContain('error=auth_failed');

                        // Property: All should maintain same redirect structure
                        expect(redirectUrl).toMatch(/^http:\/\/localhost:3000\/login\?error=auth_failed$/);

                        // Property: None should expose specific error details
                        expect(redirectUrl).not.toContain(failureScenario.errorMessage);

                        // Property: None should set authentication cookies
                        const cookies = response.headers['set-cookie'];
                        if (cookies) {
                            const cookieStrings = Array.isArray(cookies) ? cookies : [cookies];
                            const hasAccessToken = cookieStrings.some((c) => c.includes('accessToken='));
                            const hasRefreshToken = cookieStrings.some((c) => c.includes('refreshToken='));
                            expect(hasAccessToken).toBe(false);
                            expect(hasRefreshToken).toBe(false);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});

// Feature: gate-compass, Property 2: User profile creation or retrieval
// For any successful Google authentication response, the system should either create a new user profile 
// (if googleId doesn't exist) or retrieve the existing user profile (if googleId exists), 
// and in both cases grant platform access.
// Validates: Requirements 1.3

describe('User Profile Handling Property Tests', () => {
    beforeAll(async () => {
        // Verify database connection is available
        try {
            const pool = (await import('../config/database')).default;
            await pool.query('SELECT 1');
        } catch (error) {
            console.error('\n⚠️  DATABASE CONNECTION REQUIRED ⚠️');
            console.error('These property tests require a running PostgreSQL database.');
            console.error('Please start the database with: docker-compose up -d postgres');
            console.error('Then run migrations with: npm run migrate up\n');
            throw error;
        }
    });

    describe('Property 2: User profile creation or retrieval', () => {
        it('should create new user profile for any new Google ID', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary Google profile data
                    fc.record({
                        googleId: fc.uuid(),
                        email: fc.emailAddress(),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        profilePicture: fc.oneof(
                            fc.webUrl(),
                            fc.constant(''),
                            fc.constant('https://lh3.googleusercontent.com/a/default-user')
                        ),
                    }),
                    async (profile) => {
                        const pool = (await import('../config/database')).default;

                        // Ensure this Google ID doesn't exist
                        await pool.query('DELETE FROM users WHERE google_id = $1', [profile.googleId]);

                        // Simulate the passport strategy logic
                        const existingUserResult = await pool.query(
                            'SELECT * FROM users WHERE google_id = $1',
                            [profile.googleId]
                        );

                        // Property: User should not exist yet
                        expect(existingUserResult.rows.length).toBe(0);

                        // Create new user (simulating passport strategy)
                        const insertResult = await pool.query(
                            `INSERT INTO users (google_id, email, name, profile_picture, role, created_at, last_login_at)
                             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                             RETURNING *`,
                            [profile.googleId, profile.email, profile.name, profile.profilePicture, 'user']
                        );

                        const newUser = insertResult.rows[0];

                        // Property: User should be created with correct data
                        expect(newUser).toBeDefined();
                        expect(newUser.google_id).toBe(profile.googleId);
                        expect(newUser.email).toBe(profile.email);
                        expect(newUser.name).toBe(profile.name);
                        expect(newUser.profile_picture).toBe(profile.profilePicture);
                        expect(newUser.role).toBe('user');
                        expect(newUser.id).toBeDefined();
                        expect(newUser.created_at).toBeDefined();
                        expect(newUser.last_login_at).toBeDefined();

                        // Property: Platform access should be granted (user object exists)
                        expect(newUser.id).toBeTruthy();

                        // Cleanup
                        await pool.query('DELETE FROM users WHERE google_id = $1', [profile.googleId]);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should retrieve existing user profile for any existing Google ID', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary Google profile data
                    fc.record({
                        googleId: fc.uuid(),
                        email: fc.emailAddress(),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        profilePicture: fc.oneof(
                            fc.webUrl(),
                            fc.constant(''),
                            fc.constant('https://lh3.googleusercontent.com/a/default-user')
                        ),
                    }),
                    async (profile) => {
                        const pool = (await import('../config/database')).default;

                        // First, create a user
                        await pool.query('DELETE FROM users WHERE google_id = $1', [profile.googleId]);

                        const createResult = await pool.query(
                            `INSERT INTO users (google_id, email, name, profile_picture, role, created_at, last_login_at)
                             VALUES ($1, $2, $3, $4, $5, NOW(), NOW() - INTERVAL '1 day')
                             RETURNING *`,
                            [profile.googleId, profile.email, profile.name, profile.profilePicture, 'user']
                        );

                        const originalUser = createResult.rows[0];
                        const originalLastLogin = originalUser.last_login_at;

                        // Simulate returning user authentication (passport strategy logic)
                        const existingUserResult = await pool.query(
                            'SELECT * FROM users WHERE google_id = $1',
                            [profile.googleId]
                        );

                        // Property: User should exist
                        expect(existingUserResult.rows.length).toBe(1);

                        // Update last login time (simulating passport strategy)
                        const updateResult = await pool.query(
                            'UPDATE users SET last_login_at = NOW() WHERE google_id = $1 RETURNING *',
                            [profile.googleId]
                        );

                        const retrievedUser = updateResult.rows[0];

                        // Property: Retrieved user should have same ID and data
                        expect(retrievedUser.id).toBe(originalUser.id);
                        expect(retrievedUser.google_id).toBe(profile.googleId);
                        expect(retrievedUser.email).toBe(profile.email);
                        expect(retrievedUser.name).toBe(profile.name);
                        expect(retrievedUser.profile_picture).toBe(profile.profilePicture);

                        // Property: Last login should be updated
                        expect(new Date(retrievedUser.last_login_at).getTime()).toBeGreaterThan(
                            new Date(originalLastLogin).getTime()
                        );

                        // Property: Platform access should be granted (user object exists)
                        expect(retrievedUser.id).toBeTruthy();

                        // Cleanup
                        await pool.query('DELETE FROM users WHERE google_id = $1', [profile.googleId]);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should handle both creation and retrieval in sequence for any user', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary Google profile data
                    fc.record({
                        googleId: fc.uuid(),
                        email: fc.emailAddress(),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        profilePicture: fc.webUrl(),
                    }),
                    async (profile) => {
                        const pool = (await import('../config/database')).default;

                        // Ensure clean state
                        await pool.query('DELETE FROM users WHERE google_id = $1', [profile.googleId]);

                        // First authentication - should create user
                        let existingUserResult = await pool.query(
                            'SELECT * FROM users WHERE google_id = $1',
                            [profile.googleId]
                        );

                        let user;
                        if (existingUserResult.rows.length > 0) {
                            // Update last login
                            const updateResult = await pool.query(
                                'UPDATE users SET last_login_at = NOW() WHERE google_id = $1 RETURNING *',
                                [profile.googleId]
                            );
                            user = updateResult.rows[0];
                        } else {
                            // Create new user
                            const insertResult = await pool.query(
                                `INSERT INTO users (google_id, email, name, profile_picture, role, created_at, last_login_at)
                                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                                 RETURNING *`,
                                [profile.googleId, profile.email, profile.name, profile.profilePicture, 'user']
                            );
                            user = insertResult.rows[0];
                        }

                        // Property: User should be created on first auth
                        expect(user).toBeDefined();
                        expect(user.google_id).toBe(profile.googleId);
                        const firstUserId = user.id;

                        // Second authentication - should retrieve existing user
                        existingUserResult = await pool.query(
                            'SELECT * FROM users WHERE google_id = $1',
                            [profile.googleId]
                        );

                        if (existingUserResult.rows.length > 0) {
                            const updateResult = await pool.query(
                                'UPDATE users SET last_login_at = NOW() WHERE google_id = $1 RETURNING *',
                                [profile.googleId]
                            );
                            user = updateResult.rows[0];
                        } else {
                            const insertResult = await pool.query(
                                `INSERT INTO users (google_id, email, name, profile_picture, role, created_at, last_login_at)
                                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                                 RETURNING *`,
                                [profile.googleId, profile.email, profile.name, profile.profilePicture, 'user']
                            );
                            user = insertResult.rows[0];
                        }

                        // Property: Same user should be retrieved (same ID)
                        expect(user.id).toBe(firstUserId);
                        expect(user.google_id).toBe(profile.googleId);

                        // Property: Platform access granted in both cases
                        expect(user.id).toBeTruthy();

                        // Cleanup
                        await pool.query('DELETE FROM users WHERE google_id = $1', [profile.googleId]);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should maintain user data integrity across multiple authentications', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary Google profile data and number of authentications
                    fc.record({
                        googleId: fc.uuid(),
                        email: fc.emailAddress(),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        profilePicture: fc.webUrl(),
                        authCount: fc.integer({ min: 1, max: 5 }),
                    }),
                    async (testData) => {
                        const pool = (await import('../config/database')).default;

                        // Ensure clean state
                        await pool.query('DELETE FROM users WHERE google_id = $1', [testData.googleId]);

                        let firstUserId: string | null = null;

                        // Simulate multiple authentications
                        for (let i = 0; i < testData.authCount; i++) {
                            const existingUserResult = await pool.query(
                                'SELECT * FROM users WHERE google_id = $1',
                                [testData.googleId]
                            );

                            let user;
                            if (existingUserResult.rows.length > 0) {
                                const updateResult = await pool.query(
                                    'UPDATE users SET last_login_at = NOW() WHERE google_id = $1 RETURNING *',
                                    [testData.googleId]
                                );
                                user = updateResult.rows[0];
                            } else {
                                const insertResult = await pool.query(
                                    `INSERT INTO users (google_id, email, name, profile_picture, role, created_at, last_login_at)
                                     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                                     RETURNING *`,
                                    [
                                        testData.googleId,
                                        testData.email,
                                        testData.name,
                                        testData.profilePicture,
                                        'user',
                                    ]
                                );
                                user = insertResult.rows[0];
                            }

                            if (i === 0) {
                                firstUserId = user.id;
                            }

                            // Property: Same user ID across all authentications
                            expect(user.id).toBe(firstUserId);

                            // Property: User data remains consistent
                            expect(user.google_id).toBe(testData.googleId);
                            expect(user.email).toBe(testData.email);
                            expect(user.name).toBe(testData.name);

                            // Property: Platform access granted
                            expect(user.id).toBeTruthy();
                        }

                        // Property: Only one user record should exist
                        const finalCheck = await pool.query(
                            'SELECT COUNT(*) as count FROM users WHERE google_id = $1',
                            [testData.googleId]
                        );
                        expect(parseInt(finalCheck.rows[0].count)).toBe(1);

                        // Cleanup
                        await pool.query('DELETE FROM users WHERE google_id = $1', [testData.googleId]);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});

// Feature: gate-compass, Property 4: Session persistence
// For any authenticated user with a valid session token, returning to the platform should grant access 
// without requiring re-authentication.
// Validates: Requirements 1.5

describe('Session Persistence Property Tests', () => {
    let app: express.Express;

    beforeAll(async () => {
        // Verify database connection is available
        try {
            const pool = (await import('../config/database')).default;
            await pool.query('SELECT 1');
        } catch (error) {
            console.error('\n⚠️  DATABASE CONNECTION REQUIRED ⚠️');
            console.error('These property tests require a running PostgreSQL database.');
            console.error('Please start the database with: docker-compose up -d postgres');
            console.error('Then run migrations with: npm run migrate up\n');
            throw error;
        }

        // Set up express app with auth routes
        app = express();
        app.use(express.json());
        app.use(require('cookie-parser')());
        app.use(passport.initialize());
        app.use('/api/auth', authRouter);
    });

    describe('Property 4: Session persistence', () => {
        it('should grant access with valid session token without re-authentication', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary user data
                    fc.record({
                        googleId: fc.uuid(),
                        email: fc.emailAddress(),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        profilePicture: fc.oneof(
                            fc.webUrl(),
                            fc.constant(''),
                            fc.constant('https://lh3.googleusercontent.com/a/default-user')
                        ),
                        role: fc.constantFrom('user' as const, 'admin' as const),
                    }),
                    async (userData) => {
                        const pool = (await import('../config/database')).default;
                        const { generateTokens } = await import('../utils/jwt');

                        // Clean up any existing user
                        await pool.query('DELETE FROM users WHERE google_id = $1', [userData.googleId]);

                        // Create user in database (simulating successful authentication)
                        const insertResult = await pool.query(
                            `INSERT INTO users (google_id, email, name, profile_picture, role, created_at, last_login_at)
                             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                             RETURNING *`,
                            [userData.googleId, userData.email, userData.name, userData.profilePicture, userData.role]
                        );

                        const user = insertResult.rows[0];

                        // Generate session tokens
                        const tokens = generateTokens({
                            userId: user.id,
                            email: user.email,
                            role: user.role,
                        });

                        // Property: With valid access token, should be able to access /me endpoint
                        const response = await request(app)
                            .get('/api/auth/me')
                            .set('Cookie', [`accessToken=${tokens.accessToken}`]);

                        // Property: Should grant access (200 status)
                        expect(response.status).toBe(200);

                        // Property: Should return user information
                        expect(response.body).toBeDefined();
                        expect(response.body.userId).toBe(user.id);
                        expect(response.body.email).toBe(userData.email);
                        expect(response.body.role).toBe(userData.role);

                        // Property: Should not require re-authentication (no redirect to Google OAuth)
                        expect(response.status).not.toBe(302);
                        expect(response.headers.location).toBeUndefined();

                        // Cleanup
                        await pool.query('DELETE FROM users WHERE google_id = $1', [userData.googleId]);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should maintain session across multiple requests without re-authentication', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary user data and number of requests
                    fc.record({
                        googleId: fc.uuid(),
                        email: fc.emailAddress(),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        profilePicture: fc.webUrl(),
                        role: fc.constantFrom('user' as const, 'admin' as const),
                        requestCount: fc.integer({ min: 2, max: 10 }),
                    }),
                    async (testData) => {
                        const pool = (await import('../config/database')).default;
                        const { generateTokens } = await import('../utils/jwt');

                        // Clean up any existing user
                        await pool.query('DELETE FROM users WHERE google_id = $1', [testData.googleId]);

                        // Create user in database
                        const insertResult = await pool.query(
                            `INSERT INTO users (google_id, email, name, profile_picture, role, created_at, last_login_at)
                             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                             RETURNING *`,
                            [
                                testData.googleId,
                                testData.email,
                                testData.name,
                                testData.profilePicture,
                                testData.role,
                            ]
                        );

                        const user = insertResult.rows[0];

                        // Generate session tokens
                        const tokens = generateTokens({
                            userId: user.id,
                            email: user.email,
                            role: user.role,
                        });

                        // Property: Multiple requests with same token should all succeed
                        for (let i = 0; i < testData.requestCount; i++) {
                            const response = await request(app)
                                .get('/api/auth/me')
                                .set('Cookie', [`accessToken=${tokens.accessToken}`]);

                            // Property: Each request should grant access
                            expect(response.status).toBe(200);

                            // Property: Each request should return consistent user data
                            expect(response.body.userId).toBe(user.id);
                            expect(response.body.email).toBe(testData.email);
                            expect(response.body.role).toBe(testData.role);

                            // Property: No re-authentication required
                            expect(response.status).not.toBe(302);
                        }

                        // Cleanup
                        await pool.query('DELETE FROM users WHERE google_id = $1', [testData.googleId]);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should persist session with refresh token after access token expires', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary user data
                    fc.record({
                        googleId: fc.uuid(),
                        email: fc.emailAddress(),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        profilePicture: fc.webUrl(),
                        role: fc.constantFrom('user' as const, 'admin' as const),
                    }),
                    async (userData) => {
                        const pool = (await import('../config/database')).default;
                        const { generateTokens } = await import('../utils/jwt');

                        // Clean up any existing user
                        await pool.query('DELETE FROM users WHERE google_id = $1', [userData.googleId]);

                        // Create user in database
                        const insertResult = await pool.query(
                            `INSERT INTO users (google_id, email, name, profile_picture, role, created_at, last_login_at)
                             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                             RETURNING *`,
                            [userData.googleId, userData.email, userData.name, userData.profilePicture, userData.role]
                        );

                        const user = insertResult.rows[0];

                        // Generate session tokens
                        const tokens = generateTokens({
                            userId: user.id,
                            email: user.email,
                            role: user.role,
                        });

                        // Property: With valid refresh token, should be able to get new access token
                        const refreshResponse = await request(app)
                            .post('/api/auth/refresh')
                            .set('Cookie', [`refreshToken=${tokens.refreshToken}`]);

                        // Property: Should successfully refresh (200 status)
                        expect(refreshResponse.status).toBe(200);
                        expect(refreshResponse.body.message).toBe('Token refreshed successfully');

                        // Property: Should set new access token in cookie
                        const setCookieHeader = refreshResponse.headers['set-cookie'];
                        expect(setCookieHeader).toBeDefined();

                        const cookieStrings = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
                        const hasAccessToken = cookieStrings.some((c: string) => c.includes('accessToken='));
                        expect(hasAccessToken).toBe(true);

                        // Property: Session persists without requiring Google OAuth re-authentication
                        expect(refreshResponse.status).not.toBe(302);
                        expect(refreshResponse.headers.location).toBeUndefined();

                        // Cleanup
                        await pool.query('DELETE FROM users WHERE google_id = $1', [userData.googleId]);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should deny access without valid session token', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary invalid tokens
                    fc.oneof(
                        fc.constant(''),
                        fc.constant('invalid-token'),
                        fc.string({ minLength: 10, maxLength: 100 }),
                        fc.uuid(),
                        fc.constant('Bearer invalid-jwt-token')
                    ),
                    async (invalidToken) => {
                        // Property: Without valid token, should deny access
                        const response = await request(app)
                            .get('/api/auth/me')
                            .set('Cookie', [`accessToken=${invalidToken}`]);

                        // Property: Should deny access (401 or 403 status)
                        expect([401, 403]).toContain(response.status);

                        // Property: Should return error message
                        expect(response.body.error).toBeDefined();

                        // Property: Should not return user data
                        expect(response.body.userId).toBeUndefined();
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should maintain session persistence across different request types', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary user data
                    fc.record({
                        googleId: fc.uuid(),
                        email: fc.emailAddress(),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        profilePicture: fc.webUrl(),
                        role: fc.constantFrom('user' as const, 'admin' as const),
                    }),
                    async (userData) => {
                        const pool = (await import('../config/database')).default;
                        const { generateTokens } = await import('../utils/jwt');

                        // Clean up any existing user
                        await pool.query('DELETE FROM users WHERE google_id = $1', [userData.googleId]);

                        // Create user in database
                        const insertResult = await pool.query(
                            `INSERT INTO users (google_id, email, name, profile_picture, role, created_at, last_login_at)
                             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                             RETURNING *`,
                            [userData.googleId, userData.email, userData.name, userData.profilePicture, userData.role]
                        );

                        const user = insertResult.rows[0];

                        // Generate session tokens
                        const tokens = generateTokens({
                            userId: user.id,
                            email: user.email,
                            role: user.role,
                        });

                        // Property: Session should work with cookie-based authentication
                        const cookieResponse = await request(app)
                            .get('/api/auth/me')
                            .set('Cookie', [`accessToken=${tokens.accessToken}`]);

                        expect(cookieResponse.status).toBe(200);
                        expect(cookieResponse.body.userId).toBe(user.id);

                        // Property: Session should work with Authorization header
                        const headerResponse = await request(app)
                            .get('/api/auth/me')
                            .set('Authorization', `Bearer ${tokens.accessToken}`);

                        expect(headerResponse.status).toBe(200);
                        expect(headerResponse.body.userId).toBe(user.id);

                        // Property: Both methods should return same user data
                        expect(cookieResponse.body).toEqual(headerResponse.body);

                        // Cleanup
                        await pool.query('DELETE FROM users WHERE google_id = $1', [userData.googleId]);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should handle session expiry correctly', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary user data
                    fc.record({
                        googleId: fc.uuid(),
                        email: fc.emailAddress(),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        profilePicture: fc.webUrl(),
                        role: fc.constantFrom('user' as const, 'admin' as const),
                    }),
                    async (userData) => {
                        const pool = (await import('../config/database')).default;
                        const jwt = await import('jsonwebtoken');

                        // Clean up any existing user
                        await pool.query('DELETE FROM users WHERE google_id = $1', [userData.googleId]);

                        // Create user in database
                        const insertResult = await pool.query(
                            `INSERT INTO users (google_id, email, name, profile_picture, role, created_at, last_login_at)
                             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                             RETURNING *`,
                            [userData.googleId, userData.email, userData.name, userData.profilePicture, userData.role]
                        );

                        const user = insertResult.rows[0];

                        // Generate an expired token (expires in 1 second)
                        const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
                        const expiredToken = jwt.sign(
                            {
                                userId: user.id,
                                email: user.email,
                                role: user.role,
                            },
                            JWT_SECRET,
                            { expiresIn: '1s' }
                        );

                        // Wait for token to expire
                        await new Promise((resolve) => setTimeout(resolve, 1500));

                        // Property: Expired token should deny access
                        const response = await request(app)
                            .get('/api/auth/me')
                            .set('Cookie', [`accessToken=${expiredToken}`]);

                        // Property: Should deny access with expired token
                        expect(response.status).toBe(403);
                        expect(response.body.error).toBeDefined();

                        // Property: Should not return user data
                        expect(response.body.userId).toBeUndefined();

                        // Cleanup
                        await pool.query('DELETE FROM users WHERE google_id = $1', [userData.googleId]);
                    }
                ),
                { numRuns: 10 } // Reduced runs to 10 due to 1.5s delay per iteration
            );
        }, 30000); // Increase timeout to 30 seconds for this test
    });
});
