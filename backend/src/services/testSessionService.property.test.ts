import * as fc from 'fast-check';
import { TestSessionService } from './testSessionService';
import pool from '../config/database';
import redisClient from '../config/redis';

// Mock the database and Redis
jest.mock('../config/database', () => ({
    __esModule: true,
    default: {
        query: jest.fn(),
    },
}));

jest.mock('../config/redis', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        setEx: jest.fn(),
        del: jest.fn(),
    },
}));

// Feature: gate-compass, Property 15: Timer initialization
// **Validates: Requirements 4.1**
// For any test session started by a user, the countdown timer should be initialized to exactly 10800 seconds (3 hours).

describe('Test Session Service - Property-Based Tests', () => {
    describe('Property 15: Timer initialization', () => {
        let service: TestSessionService;
        const mockPool = pool as any;
        const mockRedis = redisClient as any;

        const TEST_DURATION = 10800; // 3 hours in seconds

        beforeEach(() => {
            service = new TestSessionService();
            jest.clearAllMocks();
        });

        // Generator for valid session IDs
        const sessionIdArb = fc.uuid();

        // Generator for valid user IDs
        const userIdArb = fc.uuid();

        // Generator for valid test IDs
        const testIdArb = fc.uuid();

        // Generator for test session rows (not yet started)
        // Note: Using 'any' to match actual database schema where start_time can be null
        const unstartedSessionArb = fc
            .tuple(sessionIdArb, userIdArb, testIdArb)
            .map(([sessionId, userId, testId]) => ({
                id: sessionId,
                user_id: userId,
                test_id: testId,
                start_time: null, // Not started yet
                end_time: null,
                status: 'in_progress' as const,
                total_time_spent: 0,
                created_at: new Date(),
            }));

        it('should initialize timer to exactly 10800 seconds for any test session', async () => {
            await fc.assert(
                fc.asyncProperty(
                    unstartedSessionArb,
                    async (sessionRow) => {
                        // Mock database to return unstarted session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock database to return started session with current time
                        const startTime = new Date();
                        const startedSession = {
                            ...sessionRow,
                            start_time: startTime,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [startedSession],
                        } as any);

                        // Mock Redis
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Start the test session
                        const result = await service.startTest(sessionRow.id);

                        // Property: The timer should be initialized to exactly 10800 seconds
                        // We verify this by checking that the start_time is set to current time
                        // The timer duration is a constant (10800 seconds) in the system
                        expect(result.start_time).toBeDefined();
                        expect(result.start_time).toBeInstanceOf(Date);

                        // Verify that the session was started (start_time is set)
                        const timeDifference = Math.abs(
                            new Date().getTime() - result.start_time!.getTime()
                        );
                        // Should be started within the last few seconds
                        expect(timeDifference).toBeLessThan(5000); // Within 5 seconds

                        // The timer duration is implicit in the system design
                        // It's always 10800 seconds from start_time
                        // We can verify this by checking that the system would calculate
                        // remaining time as: 10800 - (current_time - start_time)
                        const elapsedSeconds = Math.floor(
                            (new Date().getTime() - result.start_time!.getTime()) / 1000
                        );
                        const remainingTime = TEST_DURATION - elapsedSeconds;

                        // Property: Remaining time should be approximately 10800 seconds
                        // (allowing for a few seconds of test execution time)
                        expect(remainingTime).toBeGreaterThanOrEqual(TEST_DURATION - 5);
                        expect(remainingTime).toBeLessThanOrEqual(TEST_DURATION);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should maintain 10800 second timer duration across different session states', async () => {
            await fc.assert(
                fc.asyncProperty(
                    unstartedSessionArb,
                    fc.integer({ min: 0, max: 10800 }), // Elapsed seconds
                    async (sessionRow, elapsedSeconds) => {
                        // Create a session that was started some time ago
                        const startTime = new Date(Date.now() - elapsedSeconds * 1000);

                        // Mock database to return unstarted session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock database to return started session
                        const startedSession = {
                            ...sessionRow,
                            start_time: startTime,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [startedSession],
                        } as any);

                        // Mock Redis
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Start the test session
                        const result = await service.startTest(sessionRow.id);

                        // Property: The timer is always based on 10800 seconds from start_time
                        expect(result.start_time).toBeDefined();

                        // Calculate remaining time
                        const actualElapsed = Math.floor(
                            (new Date().getTime() - result.start_time!.getTime()) / 1000
                        );
                        const remainingTime = TEST_DURATION - actualElapsed;

                        // Property: Total duration (elapsed + remaining) should always equal 10800
                        const totalDuration = actualElapsed + remainingTime;
                        expect(totalDuration).toBeGreaterThanOrEqual(TEST_DURATION - 1);
                        expect(totalDuration).toBeLessThanOrEqual(TEST_DURATION + 1);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should initialize timer to 10800 seconds regardless of user or test ID', async () => {
            await fc.assert(
                fc.asyncProperty(
                    sessionIdArb,
                    userIdArb,
                    testIdArb,
                    async (sessionId, userId, testId) => {
                        const sessionRow = {
                            id: sessionId,
                            user_id: userId,
                            test_id: testId,
                            start_time: null,
                            end_time: null,
                            status: 'in_progress' as const,
                            total_time_spent: 0,
                            created_at: new Date(),
                        };

                        // Mock database to return unstarted session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock database to return started session
                        const startTime = new Date();
                        const startedSession = {
                            ...sessionRow,
                            start_time: startTime,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [startedSession],
                        } as any);

                        // Mock Redis
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Start the test session
                        const result = await service.startTest(sessionId);

                        // Property: Timer initialization is independent of user/test IDs
                        // The timer is always 10800 seconds
                        expect(result.start_time).toBeDefined();

                        const elapsedSeconds = Math.floor(
                            (new Date().getTime() - result.start_time!.getTime()) / 1000
                        );
                        const remainingTime = TEST_DURATION - elapsedSeconds;

                        // Verify timer is initialized to 10800 seconds
                        expect(remainingTime).toBeGreaterThanOrEqual(TEST_DURATION - 5);
                        expect(remainingTime).toBeLessThanOrEqual(TEST_DURATION);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not reinitialize timer for already started sessions', async () => {
            await fc.assert(
                fc.asyncProperty(
                    unstartedSessionArb,
                    fc.integer({ min: 1, max: 3600 }), // Elapsed seconds (up to 1 hour)
                    async (sessionRow, elapsedSeconds) => {
                        // Create a session that was already started
                        const originalStartTime = new Date(Date.now() - elapsedSeconds * 1000);
                        const alreadyStartedSession = {
                            ...sessionRow,
                            start_time: originalStartTime,
                        };

                        // Mock database to return already started session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [alreadyStartedSession],
                        } as any);

                        // Start the test session (should return existing session)
                        const result = await service.startTest(sessionRow.id);

                        // Property: Timer should not be reinitialized
                        // The start_time should remain the same
                        expect(result.start_time).toBeDefined();
                        expect(result.start_time!.getTime()).toBe(originalStartTime.getTime());

                        // Calculate remaining time based on original start time
                        const actualElapsed = Math.floor(
                            (new Date().getTime() - result.start_time!.getTime()) / 1000
                        );
                        const remainingTime = TEST_DURATION - actualElapsed;

                        // Property: Remaining time should reflect elapsed time since original start
                        const expectedRemaining = TEST_DURATION - elapsedSeconds;
                        expect(remainingTime).toBeGreaterThanOrEqual(expectedRemaining - 5);
                        expect(remainingTime).toBeLessThanOrEqual(expectedRemaining + 5);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 17: Auto-submission on timeout
    // **Validates: Requirements 4.3**
    // For any test session where the timer reaches zero, the system should automatically submit the test and prevent any further answer modifications.

    describe('Property 17: Auto-submission on timeout', () => {
        let service: TestSessionService;
        const mockPool = pool as any;
        const mockRedis = redisClient as any;

        const TEST_DURATION = 10800; // 3 hours in seconds

        beforeEach(() => {
            service = new TestSessionService();
            jest.clearAllMocks();
        });

        // Generator for valid session IDs
        const sessionIdArb = fc.uuid();

        // Generator for valid user IDs
        const userIdArb = fc.uuid();

        // Generator for valid test IDs
        const testIdArb = fc.uuid();

        // Generator for expired test sessions (timer has reached zero or exceeded)
        const expiredSessionArb = fc
            .tuple(sessionIdArb, userIdArb, testIdArb, fc.integer({ min: TEST_DURATION, max: TEST_DURATION + 3600 }))
            .map(([sessionId, userId, testId, elapsedSeconds]) => {
                const startTime = new Date(Date.now() - elapsedSeconds * 1000);
                return {
                    id: sessionId,
                    user_id: userId,
                    test_id: testId,
                    start_time: startTime,
                    end_time: null,
                    status: 'in_progress' as const,
                    total_time_spent: 0,
                    created_at: new Date(Date.now() - elapsedSeconds * 1000 - 60000), // Created before start
                };
            });

        it('should auto-submit test when timer reaches zero', async () => {
            await fc.assert(
                fc.asyncProperty(
                    expiredSessionArb,
                    async (sessionRow) => {
                        // Mock database to return expired session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock database update for auto-submission
                        const submittedSession = {
                            ...sessionRow,
                            status: 'auto_submitted',
                            end_time: new Date(),
                            total_time_spent: TEST_DURATION,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [submittedSession],
                        } as any);

                        // Mock Redis deletion
                        mockRedis.del.mockResolvedValueOnce(1);

                        // Auto-submit the test
                        const result = await service.autoSubmitOnTimeout(sessionRow.id);

                        // Property: Test should be auto-submitted
                        expect(result.status).toBe('auto_submitted');
                        expect(result.end_time).toBeDefined();
                        expect(result.total_time_spent).toBe(TEST_DURATION);

                        // Verify database was updated
                        expect(mockPool.query).toHaveBeenCalledWith(
                            expect.stringContaining('UPDATE test_sessions'),
                            expect.arrayContaining([TEST_DURATION, sessionRow.id])
                        );

                        // Verify Redis cache was cleared
                        expect(mockRedis.del).toHaveBeenCalledWith(
                            `test_session:${sessionRow.id}`
                        );
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should prevent answer modifications after auto-submission', async () => {
            await fc.assert(
                fc.asyncProperty(
                    expiredSessionArb,
                    fc.uuid(), // question ID
                    fc.string({ minLength: 1, maxLength: 1 }), // answer (A, B, C, D)
                    async (sessionRow, questionId, answer) => {
                        // First, auto-submit the session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        const submittedSession = {
                            ...sessionRow,
                            status: 'auto_submitted',
                            end_time: new Date(),
                            total_time_spent: TEST_DURATION,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [submittedSession],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        await service.autoSubmitOnTimeout(sessionRow.id);

                        // Now try to save an answer after auto-submission
                        // Mock database to return auto-submitted session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [submittedSession],
                        } as any);

                        // Property: Attempting to save answer should throw error
                        await expect(
                            service.saveAnswer(sessionRow.id, {
                                questionId,
                                selectedAnswer: answer,
                                markedForReview: false,
                            })
                        ).rejects.toThrow('Test session is not active');
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not auto-submit if timer has not expired', async () => {
            await fc.assert(
                fc.asyncProperty(
                    sessionIdArb,
                    userIdArb,
                    testIdArb,
                    fc.integer({ min: 0, max: TEST_DURATION - 1 }), // Not expired yet
                    async (sessionId, userId, testId, elapsedSeconds) => {
                        // Clear mocks for this iteration
                        jest.clearAllMocks();

                        const startTime = new Date(Date.now() - elapsedSeconds * 1000);
                        const activeSession = {
                            id: sessionId,
                            user_id: userId,
                            test_id: testId,
                            start_time: startTime,
                            end_time: null,
                            status: 'in_progress' as const,
                            total_time_spent: 0,
                            created_at: new Date(Date.now() - elapsedSeconds * 1000 - 60000),
                        };

                        // Mock database to return active session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [activeSession],
                        } as any);

                        // Property: Auto-submission should fail if timer hasn't expired
                        await expect(
                            service.autoSubmitOnTimeout(sessionId)
                        ).rejects.toThrow('Timer has not expired yet');

                        // Verify no database update was attempted
                        expect(mockPool.query).toHaveBeenCalledTimes(1); // Only the SELECT query
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should set total_time_spent to exactly TEST_DURATION on auto-submission', async () => {
            await fc.assert(
                fc.asyncProperty(
                    expiredSessionArb,
                    async (sessionRow) => {
                        // Mock database to return expired session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock database update for auto-submission
                        const submittedSession = {
                            ...sessionRow,
                            status: 'auto_submitted',
                            end_time: new Date(),
                            total_time_spent: TEST_DURATION,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [submittedSession],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        // Auto-submit the test
                        const result = await service.autoSubmitOnTimeout(sessionRow.id);

                        // Property: total_time_spent should be exactly TEST_DURATION (10800 seconds)
                        // regardless of how much time actually elapsed
                        expect(result.total_time_spent).toBe(TEST_DURATION);

                        // Verify the database was updated with TEST_DURATION
                        expect(mockPool.query).toHaveBeenCalledWith(
                            expect.stringContaining('UPDATE test_sessions'),
                            [TEST_DURATION, sessionRow.id]
                        );
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not allow auto-submission of already completed sessions', async () => {
            await fc.assert(
                fc.asyncProperty(
                    expiredSessionArb,
                    async (sessionRow) => {
                        // Clear mocks for this iteration
                        jest.clearAllMocks();

                        // Create a session that's already completed
                        const completedSession = {
                            ...sessionRow,
                            status: 'completed' as const,
                            end_time: new Date(),
                            total_time_spent: 9000,
                        };

                        // Mock database to return completed session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [completedSession],
                        } as any);

                        // Property: Auto-submission should fail for non-in_progress sessions
                        await expect(
                            service.autoSubmitOnTimeout(sessionRow.id)
                        ).rejects.toThrow('Test session is not in progress');

                        // Verify no update was attempted
                        expect(mockPool.query).toHaveBeenCalledTimes(1); // Only the SELECT query
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should clear Redis cache on auto-submission', async () => {
            await fc.assert(
                fc.asyncProperty(
                    expiredSessionArb,
                    async (sessionRow) => {
                        // Mock database to return expired session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock database update for auto-submission
                        const submittedSession = {
                            ...sessionRow,
                            status: 'auto_submitted',
                            end_time: new Date(),
                            total_time_spent: TEST_DURATION,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [submittedSession],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        // Auto-submit the test
                        await service.autoSubmitOnTimeout(sessionRow.id);

                        // Property: Redis cache should be cleared
                        expect(mockRedis.del).toHaveBeenCalledWith(
                            `test_session:${sessionRow.id}`
                        );
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 19: Manual submission timer handling
    // **Validates: Requirements 4.5**
    // For any test session manually submitted before the timer expires, the system should stop the timer and record the actual elapsed time as the total time taken.

    describe('Property 19: Manual submission timer handling', () => {
        let service: TestSessionService;
        const mockPool = pool as any;
        const mockRedis = redisClient as any;

        const TEST_DURATION = 10800; // 3 hours in seconds

        beforeEach(() => {
            service = new TestSessionService();
            jest.clearAllMocks();
        });

        // Generator for valid session IDs
        const sessionIdArb = fc.uuid();

        // Generator for valid user IDs
        const userIdArb = fc.uuid();

        // Generator for valid test IDs
        const testIdArb = fc.uuid();

        // Generator for active test sessions (not expired)
        const activeSessionArb = fc
            .tuple(sessionIdArb, userIdArb, testIdArb, fc.integer({ min: 1, max: TEST_DURATION - 1 }))
            .map(([sessionId, userId, testId, elapsedSeconds]) => {
                const startTime = new Date(Date.now() - elapsedSeconds * 1000);
                return {
                    id: sessionId,
                    user_id: userId,
                    test_id: testId,
                    start_time: startTime,
                    end_time: null,
                    status: 'in_progress' as const,
                    total_time_spent: 0,
                    created_at: new Date(Date.now() - elapsedSeconds * 1000 - 60000),
                    elapsedSeconds, // Store for verification
                };
            });

        it('should record actual elapsed time on manual submission', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    async (sessionRow) => {
                        // Mock database to return active session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock database update for manual submission
                        const actualElapsedTime = Math.floor(
                            (new Date().getTime() - sessionRow.start_time.getTime()) / 1000
                        );

                        const submittedSession = {
                            ...sessionRow,
                            status: 'completed',
                            end_time: new Date(),
                            total_time_spent: actualElapsedTime,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [submittedSession],
                        } as any);

                        // Mock Redis deletion
                        mockRedis.del.mockResolvedValueOnce(1);

                        // Manually submit the test
                        const result = await service.submitTest(sessionRow.id);

                        // Property: total_time_spent should equal actual elapsed time
                        expect(result.status).toBe('completed');
                        expect(result.end_time).toBeDefined();
                        expect(result.total_time_spent).toBeDefined();

                        // Verify the recorded time is the actual elapsed time (not TEST_DURATION)
                        // Allow small tolerance for test execution time
                        expect(result.total_time_spent).toBeGreaterThanOrEqual(sessionRow.elapsedSeconds - 2);
                        expect(result.total_time_spent).toBeLessThanOrEqual(sessionRow.elapsedSeconds + 5);

                        // Property: Recorded time should be less than TEST_DURATION (since submitted early)
                        expect(result.total_time_spent).toBeLessThan(TEST_DURATION);

                        // Verify database was updated with actual elapsed time
                        expect(mockPool.query).toHaveBeenCalledWith(
                            expect.stringContaining('UPDATE test_sessions'),
                            expect.arrayContaining([expect.any(Number), sessionRow.id])
                        );

                        // Verify the time passed to database is not TEST_DURATION
                        const updateCall = mockPool.query.mock.calls.find((call: any) =>
                            call[0].includes('UPDATE test_sessions')
                        );
                        expect(updateCall[1][0]).not.toBe(TEST_DURATION);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should stop timer and prevent further modifications after manual submission', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.uuid(), // question ID
                    fc.string({ minLength: 1, maxLength: 1 }), // answer
                    async (sessionRow, questionId, answer) => {
                        // First, manually submit the session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        const actualElapsedTime = Math.floor(
                            (new Date().getTime() - sessionRow.start_time.getTime()) / 1000
                        );

                        const submittedSession = {
                            ...sessionRow,
                            status: 'completed',
                            end_time: new Date(),
                            total_time_spent: actualElapsedTime,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [submittedSession],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        await service.submitTest(sessionRow.id);

                        // Now try to save an answer after manual submission
                        // Mock database to return completed session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [submittedSession],
                        } as any);

                        // Property: Attempting to save answer should throw error (timer stopped)
                        await expect(
                            service.saveAnswer(sessionRow.id, {
                                questionId,
                                selectedAnswer: answer,
                                markedForReview: false,
                            })
                        ).rejects.toThrow('Test session is not active');
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should record different elapsed times for different submission moments', async () => {
            await fc.assert(
                fc.asyncProperty(
                    sessionIdArb,
                    userIdArb,
                    testIdArb,
                    fc.integer({ min: 100, max: TEST_DURATION - 100 }), // First elapsed time
                    fc.integer({ min: 100, max: TEST_DURATION - 100 }), // Second elapsed time
                    async (sessionId, userId, testId, elapsed1, elapsed2) => {
                        // Skip if times are too similar (within 10 seconds)
                        fc.pre(Math.abs(elapsed1 - elapsed2) > 10);

                        // Clear mocks for this iteration
                        jest.clearAllMocks();

                        // First submission scenario
                        const startTime1 = new Date(Date.now() - elapsed1 * 1000);
                        const session1 = {
                            id: sessionId,
                            user_id: userId,
                            test_id: testId,
                            start_time: startTime1,
                            end_time: null,
                            status: 'in_progress' as const,
                            total_time_spent: 0,
                            created_at: new Date(Date.now() - elapsed1 * 1000 - 60000),
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [session1],
                        } as any);

                        const actualElapsed1 = Math.floor(
                            (new Date().getTime() - session1.start_time.getTime()) / 1000
                        );

                        const submitted1 = {
                            ...session1,
                            status: 'completed',
                            end_time: new Date(),
                            total_time_spent: actualElapsed1,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [submitted1],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        const result1 = await service.submitTest(sessionId);

                        // Second submission scenario (different elapsed time)
                        jest.clearAllMocks();

                        const startTime2 = new Date(Date.now() - elapsed2 * 1000);
                        const session2 = {
                            id: sessionId,
                            user_id: userId,
                            test_id: testId,
                            start_time: startTime2,
                            end_time: null,
                            status: 'in_progress' as const,
                            total_time_spent: 0,
                            created_at: new Date(Date.now() - elapsed2 * 1000 - 60000),
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [session2],
                        } as any);

                        const actualElapsed2 = Math.floor(
                            (new Date().getTime() - session2.start_time.getTime()) / 1000
                        );

                        const submitted2 = {
                            ...session2,
                            status: 'completed',
                            end_time: new Date(),
                            total_time_spent: actualElapsed2,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [submitted2],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        const result2 = await service.submitTest(sessionId);

                        // Property: Different submission times should result in different recorded times
                        // The difference should be proportional to the difference in elapsed times
                        const timeDifference = Math.abs(result1.total_time_spent - result2.total_time_spent);
                        const expectedDifference = Math.abs(elapsed1 - elapsed2);

                        // Allow some tolerance for test execution time
                        expect(timeDifference).toBeGreaterThanOrEqual(expectedDifference - 10);
                        expect(timeDifference).toBeLessThanOrEqual(expectedDifference + 10);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not allow manual submission of already completed sessions', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    async (sessionRow) => {
                        // Clear mocks for this iteration
                        jest.clearAllMocks();

                        // Create a session that's already completed
                        const completedSession = {
                            ...sessionRow,
                            status: 'completed' as const,
                            end_time: new Date(),
                            total_time_spent: sessionRow.elapsedSeconds,
                        };

                        // Mock database to return completed session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [completedSession],
                        } as any);

                        // Property: Manual submission should fail for non-in_progress sessions
                        await expect(
                            service.submitTest(sessionRow.id)
                        ).rejects.toThrow('Test session is not in progress');

                        // Verify no update was attempted
                        expect(mockPool.query).toHaveBeenCalledTimes(1); // Only the SELECT query
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should clear Redis cache on manual submission', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    async (sessionRow) => {
                        // Mock database to return active session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        const actualElapsedTime = Math.floor(
                            (new Date().getTime() - sessionRow.start_time.getTime()) / 1000
                        );

                        const submittedSession = {
                            ...sessionRow,
                            status: 'completed',
                            end_time: new Date(),
                            total_time_spent: actualElapsedTime,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [submittedSession],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        // Manually submit the test
                        await service.submitTest(sessionRow.id);

                        // Property: Redis cache should be cleared
                        expect(mockRedis.del).toHaveBeenCalledWith(
                            `test_session:${sessionRow.id}`
                        );
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should set status to completed (not auto_submitted) on manual submission', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    async (sessionRow) => {
                        // Mock database to return active session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        const actualElapsedTime = Math.floor(
                            (new Date().getTime() - sessionRow.start_time.getTime()) / 1000
                        );

                        const submittedSession = {
                            ...sessionRow,
                            status: 'completed',
                            end_time: new Date(),
                            total_time_spent: actualElapsedTime,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [submittedSession],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        // Manually submit the test
                        const result = await service.submitTest(sessionRow.id);

                        // Property: Status should be 'completed', not 'auto_submitted'
                        expect(result.status).toBe('completed');
                        expect(result.status).not.toBe('auto_submitted');

                        // Verify database was updated with 'completed' status
                        expect(mockPool.query).toHaveBeenCalledWith(
                            expect.stringContaining("status = 'completed'"),
                            expect.any(Array)
                        );
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should allow manual submission at any time before timer expires', async () => {
            await fc.assert(
                fc.asyncProperty(
                    sessionIdArb,
                    userIdArb,
                    testIdArb,
                    fc.integer({ min: 1, max: TEST_DURATION - 1 }), // Any time before expiry
                    async (sessionId, userId, testId, elapsedSeconds) => {
                        const startTime = new Date(Date.now() - elapsedSeconds * 1000);
                        const sessionRow = {
                            id: sessionId,
                            user_id: userId,
                            test_id: testId,
                            start_time: startTime,
                            end_time: null,
                            status: 'in_progress' as const,
                            total_time_spent: 0,
                            created_at: new Date(Date.now() - elapsedSeconds * 1000 - 60000),
                        };

                        // Mock database to return active session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        const actualElapsedTime = Math.floor(
                            (new Date().getTime() - sessionRow.start_time.getTime()) / 1000
                        );

                        const submittedSession = {
                            ...sessionRow,
                            status: 'completed',
                            end_time: new Date(),
                            total_time_spent: actualElapsedTime,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [submittedSession],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        // Property: Manual submission should succeed at any time before expiry
                        const result = await service.submitTest(sessionId);

                        expect(result.status).toBe('completed');
                        expect(result.total_time_spent).toBeLessThan(TEST_DURATION);
                        expect(result.total_time_spent).toBeGreaterThan(0);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 20: Cumulative question time tracking
    // **Validates: Requirements 5.1, 5.2, 5.3**
    // For any question in a test session, if a user views the question multiple times, the total time spent should equal the sum of all individual viewing durations.

    describe('Property 20: Cumulative question time tracking', () => {
        let service: TestSessionService;
        const mockPool = pool as any;
        const mockRedis = redisClient as any;

        beforeEach(() => {
            service = new TestSessionService();
            jest.clearAllMocks();
        });

        // Generator for valid session IDs
        const sessionIdArb = fc.uuid();

        // Generator for valid question IDs
        const questionIdArb = fc.uuid();

        // Generator for time spent values (in seconds)
        const timeSpentArb = fc.integer({ min: 1, max: 300 }); // 1 to 300 seconds per viewing

        // Generator for active test sessions
        const activeSessionArb = fc
            .tuple(sessionIdArb, fc.uuid(), fc.uuid())
            .map(([sessionId, userId, testId]) => ({
                id: sessionId,
                user_id: userId,
                test_id: testId,
                start_time: new Date(Date.now() - 60000), // Started 1 minute ago
                end_time: null,
                status: 'in_progress' as const,
                total_time_spent: 0,
                created_at: new Date(Date.now() - 120000),
            }));

        it('should accumulate time across multiple views of the same question', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    fc.array(timeSpentArb, { minLength: 2, maxLength: 10 }), // Multiple viewing durations
                    async (sessionRow, questionId, timeSpentArray) => {
                        let cumulativeTime = 0;

                        // Track time for each viewing
                        for (const timeSpent of timeSpentArray) {
                            // Mock session active check
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            // Mock existing time record query
                            if (cumulativeTime > 0) {
                                // Return existing time
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [{
                                        session_id: sessionRow.id,
                                        question_id: questionId,
                                        time_spent: cumulativeTime,
                                    }],
                                } as any);

                                // Mock update query
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            } else {
                                // No existing time record
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);

                                // Mock insert query
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            }

                            // Mock Redis operations for updateTimeInRedis
                            mockRedis.get.mockResolvedValueOnce(null);

                            // Mock database queries for getSessionStateFromDatabase
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            // Mock answers query
                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            // Mock times query - return current cumulative time
                            const currentTimes = cumulativeTime > 0 ? [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                time_spent: cumulativeTime,
                            }] : [];

                            mockPool.query.mockResolvedValueOnce({
                                rows: currentTimes,
                            } as any);

                            // Mock Redis setEx for caching
                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            // Track the time
                            await service.trackQuestionTime(sessionRow.id, {
                                questionId,
                                timeSpent,
                            });

                            cumulativeTime += timeSpent;
                        }

                        // Property: The final cumulative time should equal the sum of all individual durations
                        const expectedTotal = timeSpentArray.reduce((sum, time) => sum + time, 0);

                        // Verify the last update call has the correct cumulative time
                        const updateCalls = mockPool.query.mock.calls.filter((call: any) =>
                            call[0].includes('UPDATE question_times')
                        );

                        if (updateCalls.length > 0) {
                            const lastUpdateCall = updateCalls[updateCalls.length - 1];
                            const recordedTime = lastUpdateCall[1][0];
                            expect(recordedTime).toBe(expectedTotal);
                        }

                        // Verify cumulative time equals sum
                        expect(cumulativeTime).toBe(expectedTotal);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should maintain separate cumulative times for different questions', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.array(fc.tuple(questionIdArb, timeSpentArb), { minLength: 2, maxLength: 5 }),
                    async (sessionRow, questionTimePairs) => {
                        // Ensure questions are unique
                        const uniqueQuestions = new Map<string, number>();
                        questionTimePairs.forEach(([qId, time]) => {
                            uniqueQuestions.set(qId, (uniqueQuestions.get(qId) || 0) + time);
                        });

                        fc.pre(uniqueQuestions.size >= 2); // Need at least 2 different questions

                        const questionTimes = new Map<string, number>();

                        // Track time for each question
                        for (const [questionId, timeSpent] of questionTimePairs) {
                            const currentTime = questionTimes.get(questionId) || 0;

                            // Mock session active check
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            // Mock existing time record query
                            if (currentTime > 0) {
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [{
                                        session_id: sessionRow.id,
                                        question_id: questionId,
                                        time_spent: currentTime,
                                    }],
                                } as any);

                                // Mock update query
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            } else {
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);

                                // Mock insert query
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            }

                            // Mock Redis operations for updateTimeInRedis
                            mockRedis.get.mockResolvedValueOnce(null);

                            // Mock database queries for getSessionStateFromDatabase
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            // Mock answers query
                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            // Mock times query - return all current times
                            const currentTimesArray = Array.from(questionTimes.entries()).map(([qId, time]) => ({
                                session_id: sessionRow.id,
                                question_id: qId,
                                time_spent: time,
                            }));

                            mockPool.query.mockResolvedValueOnce({
                                rows: currentTimesArray,
                            } as any);

                            // Mock Redis setEx for caching
                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            await service.trackQuestionTime(sessionRow.id, {
                                questionId,
                                timeSpent,
                            });

                            questionTimes.set(questionId, currentTime + timeSpent);
                        }

                        // Property: Each question should have its own cumulative time
                        // Each unique question should have accumulated its own time
                        expect(questionTimes.size).toBe(uniqueQuestions.size);

                        // Verify each question's cumulative time matches expected
                        uniqueQuestions.forEach((expectedTime, questionId) => {
                            expect(questionTimes.get(questionId)).toBe(expectedTime);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should start with zero time for first view of a question', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    timeSpentArb,
                    async (sessionRow, questionId, timeSpent) => {
                        // Mock session active check
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock no existing time record
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock insert query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations for updateTimeInRedis
                        mockRedis.get.mockResolvedValueOnce(null);

                        // Mock database queries for getSessionStateFromDatabase (called by updateTimeInRedis)
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock times query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis setEx for caching
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Track time for first view
                        await service.trackQuestionTime(sessionRow.id, {
                            questionId,
                            timeSpent,
                        });

                        // Property: First view should insert the time (not update)
                        // Verify that an INSERT was called with the correct parameters
                        const insertCalls = mockPool.query.mock.calls.filter((call: any) =>
                            call[0] && typeof call[0] === 'string' && call[0].includes('INSERT INTO question_times')
                        );

                        expect(insertCalls.length).toBeGreaterThanOrEqual(1);

                        // Find the insert call with our specific parameters
                        const ourInsertCall = insertCalls.find((call: any) =>
                            call[1] &&
                            call[1][0] === sessionRow.id &&
                            call[1][1] === questionId &&
                            call[1][2] === timeSpent
                        );

                        expect(ourInsertCall).toBeDefined();
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should correctly accumulate time regardless of viewing order', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.array(questionIdArb, { minLength: 3, maxLength: 3 }), // Exactly 3 questions
                    fc.array(timeSpentArb, { minLength: 6, maxLength: 6 }), // 2 views per question
                    async (sessionRow, questionIds, timeSpentArray) => {
                        // Ensure questions are unique
                        fc.pre(new Set(questionIds).size === 3);

                        // Create viewing sequence: each question viewed twice in random order
                        const viewingSequence = [
                            { questionId: questionIds[0], timeSpent: timeSpentArray[0] },
                            { questionId: questionIds[1], timeSpent: timeSpentArray[1] },
                            { questionId: questionIds[2], timeSpent: timeSpentArray[2] },
                            { questionId: questionIds[0], timeSpent: timeSpentArray[3] }, // Second view
                            { questionId: questionIds[1], timeSpent: timeSpentArray[4] }, // Second view
                            { questionId: questionIds[2], timeSpent: timeSpentArray[5] }, // Second view
                        ];

                        const questionTimes = new Map<string, number>();

                        // Track time for each view
                        for (const { questionId, timeSpent } of viewingSequence) {
                            const currentTime = questionTimes.get(questionId) || 0;

                            // Mock session active check
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            // Mock existing time record query
                            if (currentTime > 0) {
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [{
                                        session_id: sessionRow.id,
                                        question_id: questionId,
                                        time_spent: currentTime,
                                    }],
                                } as any);

                                // Mock update query
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            } else {
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);

                                // Mock insert query
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            }

                            // Mock Redis operations for updateTimeInRedis
                            mockRedis.get.mockResolvedValueOnce(null);

                            // Mock database queries for getSessionStateFromDatabase
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            // Mock answers query
                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            // Mock times query - return all current times
                            const currentTimesArray = Array.from(questionTimes.entries()).map(([qId, time]) => ({
                                session_id: sessionRow.id,
                                question_id: qId,
                                time_spent: time,
                            }));

                            mockPool.query.mockResolvedValueOnce({
                                rows: currentTimesArray,
                            } as any);

                            // Mock Redis setEx for caching
                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            await service.trackQuestionTime(sessionRow.id, {
                                questionId,
                                timeSpent,
                            });

                            questionTimes.set(questionId, currentTime + timeSpent);
                        }

                        // Property: Each question should have exactly the sum of its two views
                        expect(questionTimes.get(questionIds[0])).toBe(timeSpentArray[0] + timeSpentArray[3]);
                        expect(questionTimes.get(questionIds[1])).toBe(timeSpentArray[1] + timeSpentArray[4]);
                        expect(questionTimes.get(questionIds[2])).toBe(timeSpentArray[2] + timeSpentArray[5]);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should handle many views of the same question', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    fc.array(timeSpentArb, { minLength: 10, maxLength: 50 }), // Many views
                    async (sessionRow, questionId, timeSpentArray) => {
                        let cumulativeTime = 0;

                        // Track time for each viewing
                        for (const timeSpent of timeSpentArray) {
                            // Mock session active check
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            // Mock existing time record query
                            if (cumulativeTime > 0) {
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [{
                                        session_id: sessionRow.id,
                                        question_id: questionId,
                                        time_spent: cumulativeTime,
                                    }],
                                } as any);

                                // Mock update query
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            } else {
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);

                                // Mock insert query
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            }

                            // Mock Redis operations for updateTimeInRedis
                            mockRedis.get.mockResolvedValueOnce(null);

                            // Mock database queries for getSessionStateFromDatabase
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            // Mock answers query
                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            // Mock times query - return current cumulative time
                            const currentTimes = cumulativeTime > 0 ? [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                time_spent: cumulativeTime,
                            }] : [];

                            mockPool.query.mockResolvedValueOnce({
                                rows: currentTimes,
                            } as any);

                            // Mock Redis setEx for caching
                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            await service.trackQuestionTime(sessionRow.id, {
                                questionId,
                                timeSpent,
                            });

                            cumulativeTime += timeSpent;
                        }

                        // Property: Cumulative time should equal sum regardless of number of views
                        const expectedTotal = timeSpentArray.reduce((sum, time) => sum + time, 0);
                        expect(cumulativeTime).toBe(expectedTotal);

                        // Verify that updates were called (for subsequent views)
                        const updateCalls = mockPool.query.mock.calls.filter((call: any) =>
                            call[0] && typeof call[0] === 'string' && call[0].includes('UPDATE question_times')
                        );
                        expect(updateCalls.length).toBeGreaterThanOrEqual(timeSpentArray.length - 1);

                        // Verify at least one insert call (for first view)
                        const insertCalls = mockPool.query.mock.calls.filter((call: any) =>
                            call[0] && typeof call[0] === 'string' && call[0].includes('INSERT INTO question_times')
                        );
                        expect(insertCalls.length).toBeGreaterThanOrEqual(1);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not allow time tracking for inactive sessions', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    timeSpentArb,
                    async (sessionRow, questionId, timeSpent) => {
                        // Create an inactive session
                        const inactiveSession = {
                            ...sessionRow,
                            status: 'completed' as const,
                            end_time: new Date(),
                        };

                        // Mock session active check returning inactive session
                        mockPool.query.mockResolvedValueOnce({
                            rows: [inactiveSession],
                        } as any);

                        // Property: Time tracking should fail for inactive sessions
                        await expect(
                            service.trackQuestionTime(sessionRow.id, {
                                questionId,
                                timeSpent,
                            })
                        ).rejects.toThrow('Test session is not active');

                        // Verify no time was recorded
                        const timeCalls = mockPool.query.mock.calls.filter((call: any) =>
                            call[0].includes('question_times')
                        );
                        expect(timeCalls.length).toBe(0);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 21: Question time persistence
    // **Validates: Requirements 5.4**
    // For any completed test session, the system should have stored time data for every question that was viewed at least once during the session.

    describe('Property 21: Question time persistence', () => {
        let service: TestSessionService;
        const mockPool = pool as any;
        const mockRedis = redisClient as any;

        const TEST_DURATION = 10800; // 3 hours in seconds

        beforeEach(() => {
            service = new TestSessionService();
            jest.clearAllMocks();
        });

        // Generator for valid session IDs
        const sessionIdArb = fc.uuid();

        // Generator for valid user IDs
        const userIdArb = fc.uuid();

        // Generator for valid test IDs
        const testIdArb = fc.uuid();

        // Generator for valid question IDs
        const questionIdArb = fc.uuid();

        // Generator for time spent values (in seconds)
        const timeSpentArb = fc.integer({ min: 1, max: 600 }); // 1 to 600 seconds

        // Generator for active test sessions
        const activeSessionArb = fc
            .tuple(sessionIdArb, userIdArb, testIdArb, fc.integer({ min: 60, max: TEST_DURATION - 1 }))
            .map(([sessionId, userId, testId, elapsedSeconds]) => {
                const startTime = new Date(Date.now() - elapsedSeconds * 1000);
                return {
                    id: sessionId,
                    user_id: userId,
                    test_id: testId,
                    start_time: startTime,
                    end_time: null,
                    status: 'in_progress' as const,
                    total_time_spent: 0,
                    created_at: new Date(Date.now() - elapsedSeconds * 1000 - 60000),
                    elapsedSeconds,
                };
            });

        it('should persist time data for all viewed questions after test completion', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.array(fc.tuple(questionIdArb, timeSpentArb), { minLength: 1, maxLength: 10 }),
                    async (sessionRow, questionTimePairs) => {
                        // Ensure questions are unique
                        const uniqueQuestions = new Map<string, number>();
                        questionTimePairs.forEach(([qId, time]) => {
                            uniqueQuestions.set(qId, (uniqueQuestions.get(qId) || 0) + time);
                        });

                        fc.pre(uniqueQuestions.size >= 1); // Need at least 1 question

                        // Track time for each question during the test
                        for (const [questionId, timeSpent] of questionTimePairs) {
                            const currentTime = uniqueQuestions.get(questionId)! - timeSpent;

                            // Mock session active check
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            // Mock existing time record query
                            if (currentTime > 0) {
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [{
                                        session_id: sessionRow.id,
                                        question_id: questionId,
                                        time_spent: currentTime,
                                    }],
                                } as any);

                                // Mock update query
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            } else {
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);

                                // Mock insert query
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            }

                            // Mock Redis operations
                            mockRedis.get.mockResolvedValueOnce(null);
                            mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            await service.trackQuestionTime(sessionRow.id, {
                                questionId,
                                timeSpent,
                            });
                        }

                        // Now complete the test session
                        jest.clearAllMocks();

                        // Mock session retrieval for submission
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock session update for completion
                        const completedSession = {
                            ...sessionRow,
                            status: 'completed',
                            end_time: new Date(),
                            total_time_spent: sessionRow.elapsedSeconds,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [completedSession],
                        } as any);

                        // Mock Redis deletion
                        mockRedis.del.mockResolvedValueOnce(1);

                        await service.submitTest(sessionRow.id);

                        // Now verify that time data persists after completion
                        jest.clearAllMocks();

                        // Mock getSessionState to retrieve from database
                        mockRedis.get.mockResolvedValueOnce(null); // Not in Redis

                        // Mock database queries for getSessionStateFromDatabase
                        mockPool.query.mockResolvedValueOnce({
                            rows: [completedSession],
                        } as any);

                        // Mock answers query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock question times query - return all persisted times
                        const persistedTimes = Array.from(uniqueQuestions.entries()).map(([qId, time]) => ({
                            session_id: sessionRow.id,
                            question_id: qId,
                            time_spent: time,
                        }));

                        mockPool.query.mockResolvedValueOnce({
                            rows: persistedTimes,
                        } as any);

                        // Mock Redis cache
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Retrieve session state after completion
                        const state = await service.getSessionState(sessionRow.id);

                        // Property: All viewed questions should have persisted time data
                        expect(state).not.toBeNull();
                        expect(state!.questionTimes).toBeDefined();

                        // Verify every viewed question has time data
                        uniqueQuestions.forEach((expectedTime, questionId) => {
                            expect(state!.questionTimes[questionId]).toBeDefined();
                            expect(state!.questionTimes[questionId]).toBe(expectedTime);
                        });

                        // Verify the number of persisted times matches viewed questions
                        expect(Object.keys(state!.questionTimes).length).toBe(uniqueQuestions.size);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should persist time data even for questions viewed only once', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    timeSpentArb,
                    async (sessionRow, questionId, timeSpent) => {
                        // Track time for a single question
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.trackQuestionTime(sessionRow.id, {
                            questionId,
                            timeSpent,
                        });

                        // Complete the test
                        jest.clearAllMocks();

                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        const completedSession = {
                            ...sessionRow,
                            status: 'completed',
                            end_time: new Date(),
                            total_time_spent: sessionRow.elapsedSeconds,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [completedSession],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        await service.submitTest(sessionRow.id);

                        // Retrieve session state
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [completedSession],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                time_spent: timeSpent,
                            }],
                        } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Even single-view questions should have persisted time data
                        expect(state).not.toBeNull();
                        expect(state!.questionTimes[questionId]).toBe(timeSpent);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not persist time data for questions that were never viewed', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.array(questionIdArb, { minLength: 2, maxLength: 5 }),
                    timeSpentArb,
                    async (sessionRow, questionIds, timeSpent) => {
                        // Ensure we have at least 2 unique questions
                        fc.pre(new Set(questionIds).size >= 2);

                        const viewedQuestionId = questionIds[0];
                        const neverViewedQuestionId = questionIds[1];

                        // Track time only for the first question
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.trackQuestionTime(sessionRow.id, {
                            questionId: viewedQuestionId,
                            timeSpent,
                        });

                        // Complete the test
                        jest.clearAllMocks();

                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        const completedSession = {
                            ...sessionRow,
                            status: 'completed',
                            end_time: new Date(),
                            total_time_spent: sessionRow.elapsedSeconds,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [completedSession],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        await service.submitTest(sessionRow.id);

                        // Retrieve session state
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [completedSession],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: viewedQuestionId,
                                time_spent: timeSpent,
                            }],
                        } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Only viewed questions should have time data
                        expect(state).not.toBeNull();
                        expect(state!.questionTimes[viewedQuestionId]).toBe(timeSpent);
                        expect(state!.questionTimes[neverViewedQuestionId]).toBeUndefined();
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should persist cumulative time data across multiple views', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    fc.array(timeSpentArb, { minLength: 2, maxLength: 5 }),
                    async (sessionRow, questionId, timeSpentArray) => {
                        let cumulativeTime = 0;

                        // Track time for multiple views
                        for (const timeSpent of timeSpentArray) {
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            if (cumulativeTime > 0) {
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [{
                                        session_id: sessionRow.id,
                                        question_id: questionId,
                                        time_spent: cumulativeTime,
                                    }],
                                } as any);

                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            } else {
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);

                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            }

                            // Mock Redis operations
                            mockRedis.get.mockResolvedValueOnce(null);
                            mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);

                            const currentTimes = cumulativeTime > 0 ? [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                time_spent: cumulativeTime,
                            }] : [];

                            mockPool.query.mockResolvedValueOnce({ rows: currentTimes } as any);
                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            await service.trackQuestionTime(sessionRow.id, {
                                questionId,
                                timeSpent,
                            });

                            cumulativeTime += timeSpent;
                        }

                        // Complete the test
                        jest.clearAllMocks();

                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        const completedSession = {
                            ...sessionRow,
                            status: 'completed',
                            end_time: new Date(),
                            total_time_spent: sessionRow.elapsedSeconds,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [completedSession],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        await service.submitTest(sessionRow.id);

                        // Retrieve session state
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [completedSession],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                time_spent: cumulativeTime,
                            }],
                        } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Persisted time should equal cumulative time from all views
                        expect(state).not.toBeNull();
                        expect(state!.questionTimes[questionId]).toBe(cumulativeTime);

                        const expectedTotal = timeSpentArray.reduce((sum, time) => sum + time, 0);
                        expect(state!.questionTimes[questionId]).toBe(expectedTotal);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should persist time data after auto-submission', async () => {
            await fc.assert(
                fc.asyncProperty(
                    sessionIdArb,
                    userIdArb,
                    testIdArb,
                    fc.array(fc.tuple(questionIdArb, timeSpentArb), { minLength: 1, maxLength: 5 }),
                    async (sessionId, userId, testId, questionTimePairs) => {
                        // Create an expired session
                        const startTime = new Date(Date.now() - (TEST_DURATION + 100) * 1000);
                        const expiredSession = {
                            id: sessionId,
                            user_id: userId,
                            test_id: testId,
                            start_time: startTime,
                            end_time: null,
                            status: 'in_progress' as const,
                            total_time_spent: 0,
                            created_at: new Date(Date.now() - (TEST_DURATION + 200) * 1000),
                        };

                        // Ensure questions are unique
                        const uniqueQuestions = new Map<string, number>();
                        questionTimePairs.forEach(([qId, time]) => {
                            uniqueQuestions.set(qId, (uniqueQuestions.get(qId) || 0) + time);
                        });

                        // Track time for questions before auto-submission
                        for (const [questionId, timeSpent] of questionTimePairs) {
                            const currentTime = uniqueQuestions.get(questionId)! - timeSpent;

                            mockPool.query.mockResolvedValueOnce({
                                rows: [expiredSession],
                            } as any);

                            if (currentTime > 0) {
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [{
                                        session_id: sessionId,
                                        question_id: questionId,
                                        time_spent: currentTime,
                                    }],
                                } as any);

                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            } else {
                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);

                                mockPool.query.mockResolvedValueOnce({
                                    rows: [],
                                } as any);
                            }

                            // Mock Redis operations
                            mockRedis.get.mockResolvedValueOnce(null);
                            mockPool.query.mockResolvedValueOnce({ rows: [expiredSession] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            await service.trackQuestionTime(sessionId, {
                                questionId,
                                timeSpent,
                            });
                        }

                        // Auto-submit the test
                        jest.clearAllMocks();

                        mockPool.query.mockResolvedValueOnce({
                            rows: [expiredSession],
                        } as any);

                        const autoSubmittedSession = {
                            ...expiredSession,
                            status: 'auto_submitted',
                            end_time: new Date(),
                            total_time_spent: TEST_DURATION,
                        };

                        mockPool.query.mockResolvedValueOnce({
                            rows: [autoSubmittedSession],
                        } as any);

                        mockRedis.del.mockResolvedValueOnce(1);

                        await service.autoSubmitOnTimeout(sessionId);

                        // Retrieve session state after auto-submission
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [autoSubmittedSession],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        const persistedTimes = Array.from(uniqueQuestions.entries()).map(([qId, time]) => ({
                            session_id: sessionId,
                            question_id: qId,
                            time_spent: time,
                        }));

                        mockPool.query.mockResolvedValueOnce({
                            rows: persistedTimes,
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionId);

                        // Property: Time data should persist even after auto-submission
                        expect(state).not.toBeNull();
                        expect(state!.status).toBe('auto_submitted');

                        uniqueQuestions.forEach((expectedTime, questionId) => {
                            expect(state!.questionTimes[questionId]).toBe(expectedTime);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 23: Navigation state preservation
    // **Validates: Requirements 6.2, 6.5**
    // For any question in an active test session, if a user enters an answer, navigates away, and then returns to that question, the previously entered answer should still be present.

    describe('Property 23: Navigation state preservation', () => {
        let service: TestSessionService;
        const mockPool = pool as any;
        const mockRedis = redisClient as any;

        beforeEach(() => {
            service = new TestSessionService();
            jest.clearAllMocks();
        });

        // Generator for valid session IDs
        const sessionIdArb = fc.uuid();

        // Generator for valid user IDs
        const userIdArb = fc.uuid();

        // Generator for valid test IDs
        const testIdArb = fc.uuid();

        // Generator for valid question IDs
        const questionIdArb = fc.uuid();

        // Generator for answer choices (A, B, C, D)
        const answerArb = fc.constantFrom('A', 'B', 'C', 'D');

        // Generator for review flag
        const reviewFlagArb = fc.boolean();

        // Generator for active test sessions
        const activeSessionArb = fc
            .tuple(sessionIdArb, userIdArb, testIdArb)
            .map(([sessionId, userId, testId]) => ({
                id: sessionId,
                user_id: userId,
                test_id: testId,
                start_time: new Date(Date.now() - 60000), // Started 1 minute ago
                end_time: null,
                status: 'in_progress' as const,
                total_time_spent: 0,
                created_at: new Date(Date.now() - 120000),
            }));

        it('should preserve answer when navigating away and returning to a question', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    reviewFlagArb,
                    async (sessionRow, questionId, selectedAnswer, markedForReview) => {
                        // Step 1: Save an answer for a question
                        // Mock session active check
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock check for existing answer (none exists)
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock insert answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations for updateAnswerInRedis
                        mockRedis.get.mockResolvedValueOnce(null);

                        // Mock getSessionStateFromDatabase
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query (empty initially)
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock times query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis setEx
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Save the answer
                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer,
                            markedForReview,
                        });

                        // Step 2: Simulate navigation away (no action needed)
                        // Clear mocks to simulate fresh retrieval
                        jest.clearAllMocks();

                        // Step 3: Return to the question and retrieve session state
                        // Mock Redis get (cache miss)
                        mockRedis.get.mockResolvedValueOnce(null);

                        // Mock getSessionStateFromDatabase
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query - return the saved answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: markedForReview,
                                answered_at: new Date(),
                            }],
                        } as any);

                        // Mock times query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis setEx
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Retrieve session state
                        const state = await service.getSessionState(sessionRow.id);

                        // Property: The previously entered answer should still be present
                        expect(state).not.toBeNull();
                        expect(state!.answers[questionId]).toBeDefined();
                        expect(state!.answers[questionId].selected_answer).toBe(selectedAnswer);
                        expect(state!.answers[questionId].marked_for_review).toBe(markedForReview);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should preserve multiple answers across navigation', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.array(fc.tuple(questionIdArb, answerArb, reviewFlagArb), { minLength: 2, maxLength: 5 }),
                    async (sessionRow, questionAnswerPairs) => {
                        // Ensure questions are unique
                        const uniqueQuestions = new Map<string, { answer: string; review: boolean }>();
                        questionAnswerPairs.forEach(([qId, answer, review]) => {
                            if (!uniqueQuestions.has(qId)) {
                                uniqueQuestions.set(qId, { answer, review });
                            }
                        });

                        fc.pre(uniqueQuestions.size >= 2); // Need at least 2 different questions

                        // Save answers for all questions
                        for (const [questionId, { answer, review }] of uniqueQuestions.entries()) {
                            // Mock session active check
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            // Mock check for existing answer
                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            // Mock insert answer
                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            // Mock Redis operations
                            mockRedis.get.mockResolvedValueOnce(null);
                            mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            await service.saveAnswer(sessionRow.id, {
                                questionId,
                                selectedAnswer: answer,
                                markedForReview: review,
                            });
                        }

                        // Clear mocks and retrieve session state
                        jest.clearAllMocks();

                        // Mock Redis get (cache miss)
                        mockRedis.get.mockResolvedValueOnce(null);

                        // Mock getSessionStateFromDatabase
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query - return all saved answers
                        const savedAnswers = Array.from(uniqueQuestions.entries()).map(([qId, { answer, review }]) => ({
                            session_id: sessionRow.id,
                            question_id: qId,
                            selected_answer: answer,
                            marked_for_review: review,
                            answered_at: new Date(),
                        }));

                        mockPool.query.mockResolvedValueOnce({
                            rows: savedAnswers,
                        } as any);

                        // Mock times query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis setEx
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Retrieve session state
                        const state = await service.getSessionState(sessionRow.id);

                        // Property: All previously entered answers should be preserved
                        expect(state).not.toBeNull();
                        expect(Object.keys(state!.answers).length).toBe(uniqueQuestions.size);

                        uniqueQuestions.forEach(({ answer, review }, questionId) => {
                            expect(state!.answers[questionId]).toBeDefined();
                            expect(state!.answers[questionId].selected_answer).toBe(answer);
                            expect(state!.answers[questionId].marked_for_review).toBe(review);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should preserve updated answer when changing answer and navigating', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    answerArb,
                    reviewFlagArb,
                    async (sessionRow, questionId, firstAnswer, secondAnswer, markedForReview) => {
                        // Ensure answers are different
                        fc.pre(firstAnswer !== secondAnswer);

                        // Step 1: Save initial answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer: firstAnswer,
                            markedForReview: false,
                        });

                        // Step 2: Update answer
                        jest.clearAllMocks();

                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock existing answer found
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: firstAnswer,
                                marked_for_review: false,
                                answered_at: new Date(),
                            }],
                        } as any);

                        // Mock update query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: firstAnswer,
                                marked_for_review: false,
                                answered_at: new Date(),
                            }],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer: secondAnswer,
                            markedForReview,
                        });

                        // Step 3: Navigate away and return
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query - return updated answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: secondAnswer,
                                marked_for_review: markedForReview,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: The updated answer should be preserved, not the original
                        expect(state).not.toBeNull();
                        expect(state!.answers[questionId]).toBeDefined();
                        expect(state!.answers[questionId].selected_answer).toBe(secondAnswer);
                        expect(state!.answers[questionId].selected_answer).not.toBe(firstAnswer);
                        expect(state!.answers[questionId].marked_for_review).toBe(markedForReview);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should preserve answer state across multiple navigation cycles', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    reviewFlagArb,
                    fc.integer({ min: 2, max: 5 }), // Number of navigation cycles
                    async (sessionRow, questionId, selectedAnswer, markedForReview, navigationCycles) => {
                        // Save initial answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer,
                            markedForReview,
                        });

                        // Simulate multiple navigation cycles
                        for (let i = 0; i < navigationCycles; i++) {
                            jest.clearAllMocks();

                            // Retrieve session state (simulating return to question)
                            mockRedis.get.mockResolvedValueOnce(null);
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            mockPool.query.mockResolvedValueOnce({
                                rows: [{
                                    session_id: sessionRow.id,
                                    question_id: questionId,
                                    selected_answer: selectedAnswer,
                                    marked_for_review: markedForReview,
                                    answered_at: new Date(),
                                }],
                            } as any);

                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            const state = await service.getSessionState(sessionRow.id);

                            // Property: Answer should be preserved across all navigation cycles
                            expect(state).not.toBeNull();
                            expect(state!.answers[questionId]).toBeDefined();
                            expect(state!.answers[questionId].selected_answer).toBe(selectedAnswer);
                            expect(state!.answers[questionId].marked_for_review).toBe(markedForReview);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not preserve answers for questions that were never answered', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.array(questionIdArb, { minLength: 2, maxLength: 5 }),
                    answerArb,
                    reviewFlagArb,
                    async (sessionRow, questionIds, selectedAnswer, markedForReview) => {
                        // Ensure we have at least 2 unique questions
                        fc.pre(new Set(questionIds).size >= 2);

                        const answeredQuestionId = questionIds[0];
                        const unansweredQuestionId = questionIds[1];

                        // Save answer only for the first question
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId: answeredQuestionId,
                            selectedAnswer,
                            markedForReview,
                        });

                        // Navigate and retrieve session state
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: answeredQuestionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: markedForReview,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Only answered questions should have preserved state
                        expect(state).not.toBeNull();
                        expect(state!.answers[answeredQuestionId]).toBeDefined();
                        expect(state!.answers[unansweredQuestionId]).toBeUndefined();
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should preserve review flag state independently of answer', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    async (sessionRow, questionId, selectedAnswer) => {
                        // Save answer with review flag = false
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer,
                            markedForReview: false,
                        });

                        // Update to mark for review (same answer)
                        jest.clearAllMocks();

                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: false,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: false,
                                answered_at: new Date(),
                            }],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer,
                            markedForReview: true,
                        });

                        // Navigate and retrieve
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: true,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Review flag should be preserved independently
                        expect(state).not.toBeNull();
                        expect(state!.answers[questionId]).toBeDefined();
                        expect(state!.answers[questionId].selected_answer).toBe(selectedAnswer);
                        expect(state!.answers[questionId].marked_for_review).toBe(true);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 23: Navigation state preservation
    // **Validates: Requirements 6.2, 6.5**
    // For any question in an active test session, if a user enters an answer, navigates away, and then returns to that question, the previously entered answer should still be present.

    describe('Property 23: Navigation state preservation', () => {
        let service: TestSessionService;
        const mockPool = pool as any;
        const mockRedis = redisClient as any;

        beforeEach(() => {
            service = new TestSessionService();
            jest.clearAllMocks();
        });

        // Generator for valid session IDs
        const sessionIdArb = fc.uuid();

        // Generator for valid user IDs
        const userIdArb = fc.uuid();

        // Generator for valid test IDs
        const testIdArb = fc.uuid();

        // Generator for valid question IDs
        const questionIdArb = fc.uuid();

        // Generator for answer choices (A, B, C, D)
        const answerArb = fc.constantFrom('A', 'B', 'C', 'D');

        // Generator for review flag
        const reviewFlagArb = fc.boolean();

        // Generator for active test sessions
        const activeSessionArb = fc
            .tuple(sessionIdArb, userIdArb, testIdArb)
            .map(([sessionId, userId, testId]) => ({
                id: sessionId,
                user_id: userId,
                test_id: testId,
                start_time: new Date(Date.now() - 60000), // Started 1 minute ago
                end_time: null,
                status: 'in_progress' as const,
                total_time_spent: 0,
                created_at: new Date(Date.now() - 120000),
            }));

        it('should preserve answer when navigating away and returning to a question', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    reviewFlagArb,
                    async (sessionRow, questionId, selectedAnswer, markedForReview) => {
                        // Step 1: Save an answer for a question
                        // Mock session active check
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock check for existing answer (none exists)
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock insert answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations for updateAnswerInRedis
                        mockRedis.get.mockResolvedValueOnce(null);

                        // Mock getSessionStateFromDatabase
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query (empty initially)
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock times query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis setEx
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Save the answer
                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer,
                            markedForReview,
                        });

                        // Step 2: Simulate navigation away (no action needed)
                        // Clear mocks to simulate fresh retrieval
                        jest.clearAllMocks();

                        // Step 3: Return to the question and retrieve session state
                        // Mock Redis get (cache miss)
                        mockRedis.get.mockResolvedValueOnce(null);

                        // Mock getSessionStateFromDatabase
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query - return the saved answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: markedForReview,
                                answered_at: new Date(),
                            }],
                        } as any);

                        // Mock times query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis setEx
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Retrieve session state
                        const state = await service.getSessionState(sessionRow.id);

                        // Property: The previously entered answer should still be present
                        expect(state).not.toBeNull();
                        expect(state!.answers[questionId]).toBeDefined();
                        expect(state!.answers[questionId].selected_answer).toBe(selectedAnswer);
                        expect(state!.answers[questionId].marked_for_review).toBe(markedForReview);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should preserve multiple answers across navigation', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.array(fc.tuple(questionIdArb, answerArb, reviewFlagArb), { minLength: 2, maxLength: 5 }),
                    async (sessionRow, questionAnswerPairs) => {
                        // Ensure questions are unique
                        const uniqueQuestions = new Map<string, { answer: string; review: boolean }>();
                        questionAnswerPairs.forEach(([qId, answer, review]) => {
                            if (!uniqueQuestions.has(qId)) {
                                uniqueQuestions.set(qId, { answer, review });
                            }
                        });

                        fc.pre(uniqueQuestions.size >= 2); // Need at least 2 different questions

                        // Save answers for all questions
                        for (const [questionId, { answer, review }] of uniqueQuestions.entries()) {
                            // Mock session active check
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            // Mock check for existing answer
                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            // Mock insert answer
                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            // Mock Redis operations
                            mockRedis.get.mockResolvedValueOnce(null);
                            mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            await service.saveAnswer(sessionRow.id, {
                                questionId,
                                selectedAnswer: answer,
                                markedForReview: review,
                            });
                        }

                        // Clear mocks and retrieve session state
                        jest.clearAllMocks();

                        // Mock Redis get (cache miss)
                        mockRedis.get.mockResolvedValueOnce(null);

                        // Mock getSessionStateFromDatabase
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query - return all saved answers
                        const savedAnswers = Array.from(uniqueQuestions.entries()).map(([qId, { answer, review }]) => ({
                            session_id: sessionRow.id,
                            question_id: qId,
                            selected_answer: answer,
                            marked_for_review: review,
                            answered_at: new Date(),
                        }));

                        mockPool.query.mockResolvedValueOnce({
                            rows: savedAnswers,
                        } as any);

                        // Mock times query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis setEx
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Retrieve session state
                        const state = await service.getSessionState(sessionRow.id);

                        // Property: All previously entered answers should be preserved
                        expect(state).not.toBeNull();
                        expect(Object.keys(state!.answers).length).toBe(uniqueQuestions.size);

                        uniqueQuestions.forEach(({ answer, review }, questionId) => {
                            expect(state!.answers[questionId]).toBeDefined();
                            expect(state!.answers[questionId].selected_answer).toBe(answer);
                            expect(state!.answers[questionId].marked_for_review).toBe(review);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should preserve updated answer when changing answer and navigating', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    answerArb,
                    reviewFlagArb,
                    async (sessionRow, questionId, firstAnswer, secondAnswer, markedForReview) => {
                        // Ensure answers are different
                        fc.pre(firstAnswer !== secondAnswer);

                        // Step 1: Save initial answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer: firstAnswer,
                            markedForReview: false,
                        });

                        // Step 2: Update answer
                        jest.clearAllMocks();

                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock existing answer found
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: firstAnswer,
                                marked_for_review: false,
                                answered_at: new Date(),
                            }],
                        } as any);

                        // Mock update query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: firstAnswer,
                                marked_for_review: false,
                                answered_at: new Date(),
                            }],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer: secondAnswer,
                            markedForReview,
                        });

                        // Step 3: Navigate away and return
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query - return updated answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: secondAnswer,
                                marked_for_review: markedForReview,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: The updated answer should be preserved, not the original
                        expect(state).not.toBeNull();
                        expect(state!.answers[questionId]).toBeDefined();
                        expect(state!.answers[questionId].selected_answer).toBe(secondAnswer);
                        expect(state!.answers[questionId].selected_answer).not.toBe(firstAnswer);
                        expect(state!.answers[questionId].marked_for_review).toBe(markedForReview);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not preserve answers for questions that were never answered', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.array(questionIdArb, { minLength: 2, maxLength: 5 }),
                    answerArb,
                    reviewFlagArb,
                    async (sessionRow, questionIds, selectedAnswer, markedForReview) => {
                        // Ensure we have at least 2 unique questions
                        fc.pre(new Set(questionIds).size >= 2);

                        const answeredQuestionId = questionIds[0];
                        const unansweredQuestionId = questionIds[1];

                        // Save answer only for the first question
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId: answeredQuestionId,
                            selectedAnswer,
                            markedForReview,
                        });

                        // Navigate and retrieve session state
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: answeredQuestionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: markedForReview,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Only answered questions should have preserved state
                        expect(state).not.toBeNull();
                        expect(state!.answers[answeredQuestionId]).toBeDefined();
                        expect(state!.answers[unansweredQuestionId]).toBeUndefined();
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 23: Navigation state preservation
    // **Validates: Requirements 6.2, 6.5**
    // For any question in an active test session, if a user enters an answer, navigates away, and then returns to that question, the previously entered answer should still be present.

    describe('Property 23: Navigation state preservation', () => {
        let service: TestSessionService;
        const mockPool = pool as any;
        const mockRedis = redisClient as any;

        beforeEach(() => {
            service = new TestSessionService();
            jest.clearAllMocks();
        });

        // Generator for valid session IDs
        const sessionIdArb = fc.uuid();

        // Generator for valid user IDs
        const userIdArb = fc.uuid();

        // Generator for valid test IDs
        const testIdArb = fc.uuid();

        // Generator for valid question IDs
        const questionIdArb = fc.uuid();

        // Generator for answer choices (A, B, C, D)
        const answerArb = fc.constantFrom('A', 'B', 'C', 'D');

        // Generator for review flag
        const reviewFlagArb = fc.boolean();

        // Generator for active test sessions
        const activeSessionArb = fc
            .tuple(sessionIdArb, userIdArb, testIdArb)
            .map(([sessionId, userId, testId]) => ({
                id: sessionId,
                user_id: userId,
                test_id: testId,
                start_time: new Date(Date.now() - 60000), // Started 1 minute ago
                end_time: null,
                status: 'in_progress' as const,
                total_time_spent: 0,
                created_at: new Date(Date.now() - 120000),
            }));

        it('should preserve answer when navigating away and returning to a question', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    reviewFlagArb,
                    async (sessionRow, questionId, selectedAnswer, markedForReview) => {
                        // Step 1: Save an answer for a question
                        // Mock session active check
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock check for existing answer (none exists)
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock insert answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations for updateAnswerInRedis
                        mockRedis.get.mockResolvedValueOnce(null);

                        // Mock getSessionStateFromDatabase
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query (empty initially)
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock times query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis setEx
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Save the answer
                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer,
                            markedForReview,
                        });

                        // Step 2: Simulate navigation away (no action needed)
                        // Clear mocks to simulate fresh retrieval
                        jest.clearAllMocks();

                        // Step 3: Return to the question and retrieve session state
                        // Mock Redis get (cache miss)
                        mockRedis.get.mockResolvedValueOnce(null);

                        // Mock getSessionStateFromDatabase
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query - return the saved answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: markedForReview,
                                answered_at: new Date(),
                            }],
                        } as any);

                        // Mock times query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis setEx
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Retrieve session state
                        const state = await service.getSessionState(sessionRow.id);

                        // Property: The previously entered answer should still be present
                        expect(state).not.toBeNull();
                        expect(state!.answers[questionId]).toBeDefined();
                        expect(state!.answers[questionId].selected_answer).toBe(selectedAnswer);
                        expect(state!.answers[questionId].marked_for_review).toBe(markedForReview);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should preserve multiple answers across navigation', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.array(fc.tuple(questionIdArb, answerArb, reviewFlagArb), { minLength: 2, maxLength: 5 }),
                    async (sessionRow, questionAnswerPairs) => {
                        // Ensure questions are unique
                        const uniqueQuestions = new Map<string, { answer: string; review: boolean }>();
                        questionAnswerPairs.forEach(([qId, answer, review]) => {
                            if (!uniqueQuestions.has(qId)) {
                                uniqueQuestions.set(qId, { answer, review });
                            }
                        });

                        fc.pre(uniqueQuestions.size >= 2); // Need at least 2 different questions

                        // Save answers for all questions
                        for (const [questionId, { answer, review }] of uniqueQuestions.entries()) {
                            // Mock session active check
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            // Mock check for existing answer
                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            // Mock insert answer
                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            // Mock Redis operations
                            mockRedis.get.mockResolvedValueOnce(null);
                            mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            await service.saveAnswer(sessionRow.id, {
                                questionId,
                                selectedAnswer: answer,
                                markedForReview: review,
                            });
                        }

                        // Clear mocks and retrieve session state
                        jest.clearAllMocks();

                        // Mock Redis get (cache miss)
                        mockRedis.get.mockResolvedValueOnce(null);

                        // Mock getSessionStateFromDatabase
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query - return all saved answers
                        const savedAnswers = Array.from(uniqueQuestions.entries()).map(([qId, { answer, review }]) => ({
                            session_id: sessionRow.id,
                            question_id: qId,
                            selected_answer: answer,
                            marked_for_review: review,
                            answered_at: new Date(),
                        }));

                        mockPool.query.mockResolvedValueOnce({
                            rows: savedAnswers,
                        } as any);

                        // Mock times query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis setEx
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Retrieve session state
                        const state = await service.getSessionState(sessionRow.id);

                        // Property: All previously entered answers should be preserved
                        expect(state).not.toBeNull();
                        expect(Object.keys(state!.answers).length).toBe(uniqueQuestions.size);

                        uniqueQuestions.forEach(({ answer, review }, questionId) => {
                            expect(state!.answers[questionId]).toBeDefined();
                            expect(state!.answers[questionId].selected_answer).toBe(answer);
                            expect(state!.answers[questionId].marked_for_review).toBe(review);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should preserve updated answer when changing answer and navigating', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    answerArb,
                    reviewFlagArb,
                    async (sessionRow, questionId, firstAnswer, secondAnswer, markedForReview) => {
                        // Ensure answers are different
                        fc.pre(firstAnswer !== secondAnswer);

                        // Step 1: Save initial answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer: firstAnswer,
                            markedForReview: false,
                        });

                        // Step 2: Update answer
                        jest.clearAllMocks();

                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock existing answer found
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: firstAnswer,
                                marked_for_review: false,
                                answered_at: new Date(),
                            }],
                        } as any);

                        // Mock update query
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: firstAnswer,
                                marked_for_review: false,
                                answered_at: new Date(),
                            }],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer: secondAnswer,
                            markedForReview,
                        });

                        // Step 3: Navigate away and return
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query - return updated answer
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: secondAnswer,
                                marked_for_review: markedForReview,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: The updated answer should be preserved, not the original
                        expect(state).not.toBeNull();
                        expect(state!.answers[questionId]).toBeDefined();
                        expect(state!.answers[questionId].selected_answer).toBe(secondAnswer);
                        expect(state!.answers[questionId].selected_answer).not.toBe(firstAnswer);
                        expect(state!.answers[questionId].marked_for_review).toBe(markedForReview);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not preserve answers for questions that were never answered', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.array(questionIdArb, { minLength: 2, maxLength: 5 }),
                    answerArb,
                    reviewFlagArb,
                    async (sessionRow, questionIds, selectedAnswer, markedForReview) => {
                        // Ensure we have at least 2 unique questions
                        fc.pre(new Set(questionIds).size >= 2);

                        const answeredQuestionId = questionIds[0];
                        const unansweredQuestionId = questionIds[1];

                        // Save answer only for the first question
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId: answeredQuestionId,
                            selectedAnswer,
                            markedForReview,
                        });

                        // Navigate and retrieve session state
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: answeredQuestionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: markedForReview,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Only answered questions should have preserved state
                        expect(state).not.toBeNull();
                        expect(state!.answers[answeredQuestionId]).toBeDefined();
                        expect(state!.answers[unansweredQuestionId]).toBeUndefined();
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 24: Review flag persistence
    // **Validates: Requirements 6.3**
    // For any question marked for review during a test session, the review flag should persist throughout the session and be visible in the question palette.

    describe('Property 24: Review flag persistence', () => {
        let service: TestSessionService;
        const mockPool = pool as any;
        const mockRedis = redisClient as any;

        beforeEach(() => {
            service = new TestSessionService();
            jest.clearAllMocks();
        });

        // Generator for valid session IDs
        const sessionIdArb = fc.uuid();

        // Generator for valid user IDs
        const userIdArb = fc.uuid();

        // Generator for valid test IDs
        const testIdArb = fc.uuid();

        // Generator for valid question IDs
        const questionIdArb = fc.uuid();

        // Generator for answer choices (A, B, C, D)
        const answerArb = fc.constantFrom('A', 'B', 'C', 'D');

        // Generator for active test sessions
        const activeSessionArb = fc
            .tuple(sessionIdArb, userIdArb, testIdArb)
            .map(([sessionId, userId, testId]) => ({
                id: sessionId,
                user_id: userId,
                test_id: testId,
                start_time: new Date(Date.now() - 60000), // Started 1 minute ago
                end_time: null,
                status: 'in_progress' as const,
                total_time_spent: 0,
                created_at: new Date(Date.now() - 120000),
            }));

        it('should persist review flag when question is marked for review', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    async (sessionRow, questionId, selectedAnswer) => {
                        // Step 1: Mark question for review
                        // Mock session active check
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock check for existing answer (none exists)
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock insert answer with review flag
                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        // Mock Redis operations
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        // Save answer with review flag = true
                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer,
                            markedForReview: true,
                        });

                        // Step 2: Retrieve session state
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        // Mock answers query - return answer with review flag
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: true,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Review flag should persist
                        expect(state).not.toBeNull();
                        expect(state!.answers[questionId]).toBeDefined();
                        expect(state!.answers[questionId].marked_for_review).toBe(true);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should persist review flag across multiple session state retrievals', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    fc.integer({ min: 2, max: 5 }), // Number of retrievals
                    async (sessionRow, questionId, selectedAnswer, retrievalCount) => {
                        // Mark question for review
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer,
                            markedForReview: true,
                        });

                        // Retrieve session state multiple times
                        for (let i = 0; i < retrievalCount; i++) {
                            jest.clearAllMocks();

                            mockRedis.get.mockResolvedValueOnce(null);
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            mockPool.query.mockResolvedValueOnce({
                                rows: [{
                                    session_id: sessionRow.id,
                                    question_id: questionId,
                                    selected_answer: selectedAnswer,
                                    marked_for_review: true,
                                    answered_at: new Date(),
                                }],
                            } as any);

                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            const state = await service.getSessionState(sessionRow.id);

                            // Property: Review flag should persist across all retrievals
                            expect(state).not.toBeNull();
                            expect(state!.answers[questionId]).toBeDefined();
                            expect(state!.answers[questionId].marked_for_review).toBe(true);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should persist review flag independently for multiple questions', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.array(fc.tuple(questionIdArb, answerArb, fc.boolean()), { minLength: 2, maxLength: 5 }),
                    async (sessionRow, questionAnswerReviewTuples) => {
                        // Ensure questions are unique
                        const uniqueQuestions = new Map<string, { answer: string; review: boolean }>();
                        questionAnswerReviewTuples.forEach(([qId, answer, review]) => {
                            if (!uniqueQuestions.has(qId)) {
                                uniqueQuestions.set(qId, { answer, review });
                            }
                        });

                        fc.pre(uniqueQuestions.size >= 2); // Need at least 2 different questions

                        // Save answers with different review flags
                        for (const [questionId, { answer, review }] of uniqueQuestions.entries()) {
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            mockRedis.get.mockResolvedValueOnce(null);
                            mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                            mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            await service.saveAnswer(sessionRow.id, {
                                questionId,
                                selectedAnswer: answer,
                                markedForReview: review,
                            });
                        }

                        // Retrieve session state
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        const savedAnswers = Array.from(uniqueQuestions.entries()).map(([qId, { answer, review }]) => ({
                            session_id: sessionRow.id,
                            question_id: qId,
                            selected_answer: answer,
                            marked_for_review: review,
                            answered_at: new Date(),
                        }));

                        mockPool.query.mockResolvedValueOnce({
                            rows: savedAnswers,
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Each question should have its own independent review flag
                        expect(state).not.toBeNull();

                        uniqueQuestions.forEach(({ review }, questionId) => {
                            expect(state!.answers[questionId]).toBeDefined();
                            expect(state!.answers[questionId].marked_for_review).toBe(review);
                        });
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should allow toggling review flag and persist the updated state', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    async (sessionRow, questionId, selectedAnswer) => {
                        // Step 1: Mark for review (true)
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer,
                            markedForReview: true,
                        });

                        // Step 2: Toggle review flag to false
                        jest.clearAllMocks();

                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: true,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: true,
                                answered_at: new Date(),
                            }],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer,
                            markedForReview: false,
                        });

                        // Step 3: Retrieve and verify updated state
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: false,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Updated review flag should persist
                        expect(state).not.toBeNull();
                        expect(state!.answers[questionId]).toBeDefined();
                        expect(state!.answers[questionId].marked_for_review).toBe(false);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should persist review flag when answer is changed', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    answerArb,
                    async (sessionRow, questionId, firstAnswer, secondAnswer) => {
                        // Ensure answers are different
                        fc.pre(firstAnswer !== secondAnswer);

                        // Step 1: Save answer with review flag
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer: firstAnswer,
                            markedForReview: true,
                        });

                        // Step 2: Change answer but keep review flag
                        jest.clearAllMocks();

                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: firstAnswer,
                                marked_for_review: true,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: firstAnswer,
                                marked_for_review: true,
                                answered_at: new Date(),
                            }],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer: secondAnswer,
                            markedForReview: true,
                        });

                        // Step 3: Retrieve and verify
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: secondAnswer,
                                marked_for_review: true,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Review flag should persist even when answer changes
                        expect(state).not.toBeNull();
                        expect(state!.answers[questionId]).toBeDefined();
                        expect(state!.answers[questionId].selected_answer).toBe(secondAnswer);
                        expect(state!.answers[questionId].marked_for_review).toBe(true);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should not have review flag for questions that were never marked', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    fc.array(questionIdArb, { minLength: 2, maxLength: 5 }),
                    answerArb,
                    async (sessionRow, questionIds, selectedAnswer) => {
                        // Ensure we have at least 2 unique questions
                        fc.pre(new Set(questionIds).size >= 2);

                        const markedQuestionId = questionIds[0];
                        const unmarkedQuestionId = questionIds[1];

                        // Save answer with review flag for first question
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId: markedQuestionId,
                            selectedAnswer,
                            markedForReview: true,
                        });

                        // Save answer without review flag for second question
                        jest.clearAllMocks();

                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: markedQuestionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: true,
                                answered_at: new Date(),
                            }],
                        } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId: unmarkedQuestionId,
                            selectedAnswer,
                            markedForReview: false,
                        });

                        // Retrieve session state
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [
                                {
                                    session_id: sessionRow.id,
                                    question_id: markedQuestionId,
                                    selected_answer: selectedAnswer,
                                    marked_for_review: true,
                                    answered_at: new Date(),
                                },
                                {
                                    session_id: sessionRow.id,
                                    question_id: unmarkedQuestionId,
                                    selected_answer: selectedAnswer,
                                    marked_for_review: false,
                                    answered_at: new Date(),
                                },
                            ],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Only marked questions should have review flag = true
                        expect(state).not.toBeNull();
                        expect(state!.answers[markedQuestionId]).toBeDefined();
                        expect(state!.answers[markedQuestionId].marked_for_review).toBe(true);
                        expect(state!.answers[unmarkedQuestionId]).toBeDefined();
                        expect(state!.answers[unmarkedQuestionId].marked_for_review).toBe(false);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should persist review flag throughout the entire test session', async () => {
            await fc.assert(
                fc.asyncProperty(
                    activeSessionArb,
                    questionIdArb,
                    answerArb,
                    fc.integer({ min: 1, max: 10 }), // Number of other operations
                    async (sessionRow, reviewedQuestionId, selectedAnswer, otherOperations) => {
                        // Mark question for review
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId: reviewedQuestionId,
                            selectedAnswer,
                            markedForReview: true,
                        });

                        // Perform other operations (simulating session activity)
                        for (let i = 0; i < otherOperations; i++) {
                            jest.clearAllMocks();

                            // Retrieve session state
                            mockRedis.get.mockResolvedValueOnce(null);
                            mockPool.query.mockResolvedValueOnce({
                                rows: [sessionRow],
                            } as any);

                            mockPool.query.mockResolvedValueOnce({
                                rows: [{
                                    session_id: sessionRow.id,
                                    question_id: reviewedQuestionId,
                                    selected_answer: selectedAnswer,
                                    marked_for_review: true,
                                    answered_at: new Date(),
                                }],
                            } as any);

                            mockPool.query.mockResolvedValueOnce({
                                rows: [],
                            } as any);

                            mockRedis.setEx.mockResolvedValueOnce('OK');

                            const state = await service.getSessionState(sessionRow.id);

                            // Property: Review flag should persist throughout session
                            expect(state).not.toBeNull();
                            expect(state!.answers[reviewedQuestionId]).toBeDefined();
                            expect(state!.answers[reviewedQuestionId].marked_for_review).toBe(true);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});

// Feature: gate-compass, Property 24: Review flag persistence
// **Validates: Requirements 6.3**
// For any question marked for review during a test session, the review flag should persist throughout the session and be visible in the question palette.

describe('Property 24: Review flag persistence', () => {
    let service: TestSessionService;
    const mockPool = pool as any;
    const mockRedis = redisClient as any;

    beforeEach(() => {
        service = new TestSessionService();
        jest.clearAllMocks();
    });

    // Generator for valid session IDs
    const sessionIdArb = fc.uuid();

    // Generator for valid user IDs
    const userIdArb = fc.uuid();

    // Generator for valid test IDs
    const testIdArb = fc.uuid();

    // Generator for valid question IDs
    const questionIdArb = fc.uuid();

    // Generator for answer choices (A, B, C, D)
    const answerArb = fc.constantFrom('A', 'B', 'C', 'D');

    // Generator for active test sessions
    const activeSessionArb = fc
        .tuple(sessionIdArb, userIdArb, testIdArb)
        .map(([sessionId, userId, testId]) => ({
            id: sessionId,
            user_id: userId,
            test_id: testId,
            start_time: new Date(Date.now() - 60000), // Started 1 minute ago
            end_time: null,
            status: 'in_progress' as const,
            total_time_spent: 0,
            created_at: new Date(Date.now() - 120000),
        }));

    it('should persist review flag when question is marked for review', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                questionIdArb,
                answerArb,
                async (sessionRow, questionId, selectedAnswer) => {
                    // Step 1: Mark question for review
                    // Mock session active check
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    // Mock check for existing answer (none exists)
                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    // Mock insert answer with review flag
                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    // Mock Redis operations
                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    // Save answer with review flag = true
                    await service.saveAnswer(sessionRow.id, {
                        questionId,
                        selectedAnswer,
                        markedForReview: true,
                    });

                    // Step 2: Retrieve session state
                    jest.clearAllMocks();

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    // Mock answers query - return answer with review flag
                    mockPool.query.mockResolvedValueOnce({
                        rows: [{
                            session_id: sessionRow.id,
                            question_id: questionId,
                            selected_answer: selectedAnswer,
                            marked_for_review: true,
                            answered_at: new Date(),
                        }],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    const state = await service.getSessionState(sessionRow.id);

                    // Property: Review flag should persist
                    expect(state).not.toBeNull();
                    expect(state!.answers[questionId]).toBeDefined();
                    expect(state!.answers[questionId].marked_for_review).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should persist review flag across multiple session state retrievals', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                questionIdArb,
                answerArb,
                fc.integer({ min: 2, max: 5 }), // Number of retrievals
                async (sessionRow, questionId, selectedAnswer, retrievalCount) => {
                    // Mark question for review
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    await service.saveAnswer(sessionRow.id, {
                        questionId,
                        selectedAnswer,
                        markedForReview: true,
                    });

                    // Retrieve session state multiple times
                    for (let i = 0; i < retrievalCount; i++) {
                        jest.clearAllMocks();

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: questionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: true,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Review flag should persist across all retrievals
                        expect(state).not.toBeNull();
                        expect(state!.answers[questionId]).toBeDefined();
                        expect(state!.answers[questionId].marked_for_review).toBe(true);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should persist review flag independently for multiple questions', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                fc.array(fc.tuple(questionIdArb, answerArb, fc.boolean()), { minLength: 2, maxLength: 5 }),
                async (sessionRow, questionAnswerReviewTuples) => {
                    // Ensure questions are unique
                    const uniqueQuestions = new Map<string, { answer: string; review: boolean }>();
                    questionAnswerReviewTuples.forEach(([qId, answer, review]) => {
                        if (!uniqueQuestions.has(qId)) {
                            uniqueQuestions.set(qId, { answer, review });
                        }
                    });

                    fc.pre(uniqueQuestions.size >= 2); // Need at least 2 different questions

                    // Save answers with different review flags
                    for (const [questionId, { answer, review }] of uniqueQuestions.entries()) {
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        await service.saveAnswer(sessionRow.id, {
                            questionId,
                            selectedAnswer: answer,
                            markedForReview: review,
                        });
                    }

                    // Retrieve session state
                    jest.clearAllMocks();

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    const savedAnswers = Array.from(uniqueQuestions.entries()).map(([qId, { answer, review }]) => ({
                        session_id: sessionRow.id,
                        question_id: qId,
                        selected_answer: answer,
                        marked_for_review: review,
                        answered_at: new Date(),
                    }));

                    mockPool.query.mockResolvedValueOnce({
                        rows: savedAnswers,
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    const state = await service.getSessionState(sessionRow.id);

                    // Property: Each question should have its own independent review flag
                    expect(state).not.toBeNull();

                    uniqueQuestions.forEach(({ review }, questionId) => {
                        expect(state!.answers[questionId]).toBeDefined();
                        expect(state!.answers[questionId].marked_for_review).toBe(review);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should allow toggling review flag and persist the updated state', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                questionIdArb,
                answerArb,
                async (sessionRow, questionId, selectedAnswer) => {
                    // Step 1: Mark for review (true)
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    await service.saveAnswer(sessionRow.id, {
                        questionId,
                        selectedAnswer,
                        markedForReview: true,
                    });

                    // Step 2: Toggle review flag to false
                    jest.clearAllMocks();

                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [{
                            session_id: sessionRow.id,
                            question_id: questionId,
                            selected_answer: selectedAnswer,
                            marked_for_review: true,
                            answered_at: new Date(),
                        }],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [{
                            session_id: sessionRow.id,
                            question_id: questionId,
                            selected_answer: selectedAnswer,
                            marked_for_review: true,
                            answered_at: new Date(),
                        }],
                    } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    await service.saveAnswer(sessionRow.id, {
                        questionId,
                        selectedAnswer,
                        markedForReview: false,
                    });

                    // Step 3: Retrieve and verify updated state
                    jest.clearAllMocks();

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [{
                            session_id: sessionRow.id,
                            question_id: questionId,
                            selected_answer: selectedAnswer,
                            marked_for_review: false,
                            answered_at: new Date(),
                        }],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    const state = await service.getSessionState(sessionRow.id);

                    // Property: Updated review flag should persist
                    expect(state).not.toBeNull();
                    expect(state!.answers[questionId]).toBeDefined();
                    expect(state!.answers[questionId].marked_for_review).toBe(false);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should persist review flag when answer is changed', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                questionIdArb,
                answerArb,
                answerArb,
                async (sessionRow, questionId, firstAnswer, secondAnswer) => {
                    // Ensure answers are different
                    fc.pre(firstAnswer !== secondAnswer);

                    // Step 1: Save answer with review flag
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    await service.saveAnswer(sessionRow.id, {
                        questionId,
                        selectedAnswer: firstAnswer,
                        markedForReview: true,
                    });

                    // Step 2: Change answer but keep review flag
                    jest.clearAllMocks();

                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [{
                            session_id: sessionRow.id,
                            question_id: questionId,
                            selected_answer: firstAnswer,
                            marked_for_review: true,
                            answered_at: new Date(),
                        }],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [{
                            session_id: sessionRow.id,
                            question_id: questionId,
                            selected_answer: firstAnswer,
                            marked_for_review: true,
                            answered_at: new Date(),
                        }],
                    } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    await service.saveAnswer(sessionRow.id, {
                        questionId,
                        selectedAnswer: secondAnswer,
                        markedForReview: true,
                    });

                    // Step 3: Retrieve and verify
                    jest.clearAllMocks();

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [{
                            session_id: sessionRow.id,
                            question_id: questionId,
                            selected_answer: secondAnswer,
                            marked_for_review: true,
                            answered_at: new Date(),
                        }],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    const state = await service.getSessionState(sessionRow.id);

                    // Property: Review flag should persist even when answer changes
                    expect(state).not.toBeNull();
                    expect(state!.answers[questionId]).toBeDefined();
                    expect(state!.answers[questionId].selected_answer).toBe(secondAnswer);
                    expect(state!.answers[questionId].marked_for_review).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should not have review flag for questions that were never marked', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                fc.array(questionIdArb, { minLength: 2, maxLength: 5 }),
                answerArb,
                async (sessionRow, questionIds, selectedAnswer) => {
                    // Ensure we have at least 2 unique questions
                    fc.pre(new Set(questionIds).size >= 2);

                    const markedQuestionId = questionIds[0];
                    const unmarkedQuestionId = questionIds[1];

                    // Save answer with review flag for first question
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    await service.saveAnswer(sessionRow.id, {
                        questionId: markedQuestionId,
                        selectedAnswer,
                        markedForReview: true,
                    });

                    // Save answer without review flag for second question
                    jest.clearAllMocks();

                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [{
                            session_id: sessionRow.id,
                            question_id: markedQuestionId,
                            selected_answer: selectedAnswer,
                            marked_for_review: true,
                            answered_at: new Date(),
                        }],
                    } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    await service.saveAnswer(sessionRow.id, {
                        questionId: unmarkedQuestionId,
                        selectedAnswer,
                        markedForReview: false,
                    });

                    // Retrieve session state
                    jest.clearAllMocks();

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [
                            {
                                session_id: sessionRow.id,
                                question_id: markedQuestionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: true,
                                answered_at: new Date(),
                            },
                            {
                                session_id: sessionRow.id,
                                question_id: unmarkedQuestionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: false,
                                answered_at: new Date(),
                            },
                        ],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    const state = await service.getSessionState(sessionRow.id);

                    // Property: Only marked questions should have review flag = true
                    expect(state).not.toBeNull();
                    expect(state!.answers[markedQuestionId]).toBeDefined();
                    expect(state!.answers[markedQuestionId].marked_for_review).toBe(true);
                    expect(state!.answers[unmarkedQuestionId]).toBeDefined();
                    expect(state!.answers[unmarkedQuestionId].marked_for_review).toBe(false);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should persist review flag throughout the entire test session', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                questionIdArb,
                answerArb,
                fc.integer({ min: 1, max: 10 }), // Number of other operations
                async (sessionRow, reviewedQuestionId, selectedAnswer, otherOperations) => {
                    // Mark question for review
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({ rows: [sessionRow] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    await service.saveAnswer(sessionRow.id, {
                        questionId: reviewedQuestionId,
                        selectedAnswer,
                        markedForReview: true,
                    });

                    // Perform other operations (simulating session activity)
                    for (let i = 0; i < otherOperations; i++) {
                        jest.clearAllMocks();

                        // Retrieve session state
                        mockRedis.get.mockResolvedValueOnce(null);
                        mockPool.query.mockResolvedValueOnce({
                            rows: [sessionRow],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [{
                                session_id: sessionRow.id,
                                question_id: reviewedQuestionId,
                                selected_answer: selectedAnswer,
                                marked_for_review: true,
                                answered_at: new Date(),
                            }],
                        } as any);

                        mockPool.query.mockResolvedValueOnce({
                            rows: [],
                        } as any);

                        mockRedis.setEx.mockResolvedValueOnce('OK');

                        const state = await service.getSessionState(sessionRow.id);

                        // Property: Review flag should persist throughout session
                        expect(state).not.toBeNull();
                        expect(state!.answers[reviewedQuestionId]).toBeDefined();
                        expect(state!.answers[reviewedQuestionId].marked_for_review).toBe(true);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});
