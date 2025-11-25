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

describe('TestSessionService', () => {
    let service: TestSessionService;
    const mockPool = pool as any;
    const mockRedis = redisClient as any;

    beforeEach(() => {
        service = new TestSessionService();
        jest.clearAllMocks();
    });

    describe('startTest', () => {
        it('should start a test session and initialize Redis state', async () => {
            const sessionId = 'test-session-id';
            const mockSession = {
                id: sessionId,
                user_id: 'user-123',
                test_id: 'test-456',
                start_time: null,
                end_time: null,
                status: 'in_progress' as const,
                total_time_spent: 0,
                created_at: new Date(),
            };

            const updatedSession = {
                ...mockSession,
                start_time: new Date(),
            };

            // First query returns session without start_time
            mockPool.query.mockResolvedValueOnce({
                rows: [mockSession],
            } as any);

            // Second query returns updated session with start_time
            mockPool.query.mockResolvedValueOnce({
                rows: [updatedSession],
            } as any);

            mockRedis.setEx.mockResolvedValueOnce('OK' as any);

            const result = await service.startTest(sessionId);

            expect(result.id).toBe(sessionId);
            expect(result.start_time).toBeDefined();
            expect(mockPool.query).toHaveBeenCalledTimes(2);
            expect(mockRedis.setEx).toHaveBeenCalled();
        });

        it('should return existing session if already started', async () => {
            const sessionId = 'test-session-id';
            const mockSession = {
                id: sessionId,
                user_id: 'user-123',
                test_id: 'test-456',
                start_time: new Date(),
                end_time: null,
                status: 'in_progress' as const,
                total_time_spent: 0,
                created_at: new Date(),
            };

            mockPool.query.mockResolvedValueOnce({
                rows: [mockSession],
            } as any);

            const result = await service.startTest(sessionId);

            expect(result.id).toBe(sessionId);
            expect(mockPool.query).toHaveBeenCalledTimes(1);
        });

        it('should throw error if session not found', async () => {
            mockPool.query.mockResolvedValueOnce({
                rows: [],
            } as any);

            await expect(service.startTest('invalid-id')).rejects.toThrow('Test session not found');
        });
    });

    describe('saveAnswer', () => {
        it('should save a new answer', async () => {
            const sessionId = 'test-session-id';
            const request = {
                questionId: 'q1',
                selectedAnswer: 'A',
                markedForReview: false,
            };

            // Verify session is active
            mockPool.query.mockResolvedValueOnce({
                rows: [{ status: 'in_progress' }],
            } as any);

            // Check if answer exists
            mockPool.query.mockResolvedValueOnce({
                rows: [],
            } as any);

            // Insert new answer
            mockPool.query.mockResolvedValueOnce({
                rows: [],
            } as any);

            mockRedis.get.mockResolvedValueOnce(null);

            await service.saveAnswer(sessionId, request);

            expect(mockPool.query).toHaveBeenCalled();
        });

        it('should update existing answer', async () => {
            const sessionId = 'test-session-id';
            const request = {
                questionId: 'q1',
                selectedAnswer: 'B',
                markedForReview: true,
            };

            // Verify session is active
            mockPool.query.mockResolvedValueOnce({
                rows: [{ status: 'in_progress' }],
            } as any);

            // Check if answer exists
            mockPool.query.mockResolvedValueOnce({
                rows: [{ id: 'answer-1' }],
            } as any);

            // Update existing answer
            mockPool.query.mockResolvedValueOnce({
                rows: [],
            } as any);

            mockRedis.get.mockResolvedValueOnce(null);

            await service.saveAnswer(sessionId, request);

            expect(mockPool.query).toHaveBeenCalled();
        });

        it('should throw error if session is not active', async () => {
            const sessionId = 'test-session-id';
            const request = {
                questionId: 'q1',
                selectedAnswer: 'A',
                markedForReview: false,
            };

            mockPool.query.mockResolvedValueOnce({
                rows: [{ status: 'completed' }],
            } as any);

            await expect(service.saveAnswer(sessionId, request)).rejects.toThrow('Test session is not active');
        });
    });

    describe('trackQuestionTime', () => {
        it('should track time for a new question', async () => {
            const sessionId = 'test-session-id';
            const request = {
                questionId: 'q1',
                timeSpent: 30,
            };

            // Verify session is active
            mockPool.query.mockResolvedValueOnce({
                rows: [{ status: 'in_progress' }],
            } as any);

            // Check if time record exists
            mockPool.query.mockResolvedValueOnce({
                rows: [],
            } as any);

            // Insert new time record
            mockPool.query.mockResolvedValueOnce({
                rows: [],
            } as any);

            mockRedis.get.mockResolvedValueOnce(null);

            await service.trackQuestionTime(sessionId, request);

            expect(mockPool.query).toHaveBeenCalled();
        });

        it('should accumulate time for existing question', async () => {
            const sessionId = 'test-session-id';
            const request = {
                questionId: 'q1',
                timeSpent: 30,
            };

            // Verify session is active
            mockPool.query.mockResolvedValueOnce({
                rows: [{ status: 'in_progress' }],
            } as any);

            // Check if time record exists
            mockPool.query.mockResolvedValueOnce({
                rows: [{ time_spent: 60 }],
            } as any);

            // Update time record
            mockPool.query.mockResolvedValueOnce({
                rows: [],
            } as any);

            mockRedis.get.mockResolvedValueOnce(null);

            await service.trackQuestionTime(sessionId, request);

            expect(mockPool.query).toHaveBeenCalled();
        });
    });

    describe('submitTest', () => {
        it('should submit test and calculate time spent', async () => {
            const sessionId = 'test-session-id';
            const startTime = new Date(Date.now() - 3600000); // 1 hour ago
            const mockSession = {
                id: sessionId,
                user_id: 'user-123',
                test_id: 'test-456',
                start_time: startTime,
                end_time: null,
                status: 'in_progress' as const,
                total_time_spent: 0,
                created_at: new Date(),
            };

            mockPool.query.mockResolvedValueOnce({
                rows: [mockSession],
            } as any);

            mockPool.query.mockResolvedValueOnce({
                rows: [{
                    ...mockSession,
                    status: 'completed',
                    end_time: new Date(),
                    total_time_spent: 3600,
                }],
            } as any);

            mockRedis.del.mockResolvedValueOnce(1);

            const result = await service.submitTest(sessionId);

            expect(result.status).toBe('completed');
            expect(result.end_time).toBeDefined();
            expect(mockRedis.del).toHaveBeenCalled();
        });

        it('should throw error if session not in progress', async () => {
            const mockSession = {
                id: 'test-session-id',
                user_id: 'user-123',
                test_id: 'test-456',
                start_time: new Date(),
                end_time: new Date(),
                status: 'completed' as const,
                total_time_spent: 3600,
                created_at: new Date(),
            };

            mockPool.query.mockResolvedValueOnce({
                rows: [mockSession],
            } as any);

            await expect(service.submitTest('test-session-id')).rejects.toThrow('Test session is not in progress');
        });
    });

    describe('autoSubmitOnTimeout', () => {
        it('should auto-submit test when timer expires', async () => {
            const sessionId = 'test-session-id';
            const startTime = new Date(Date.now() - 11000000); // More than 3 hours ago
            const mockSession = {
                id: sessionId,
                user_id: 'user-123',
                test_id: 'test-456',
                start_time: startTime,
                end_time: null,
                status: 'in_progress' as const,
                total_time_spent: 0,
                created_at: new Date(),
            };

            mockPool.query.mockResolvedValueOnce({
                rows: [mockSession],
            } as any);

            mockPool.query.mockResolvedValueOnce({
                rows: [{
                    ...mockSession,
                    status: 'auto_submitted',
                    end_time: new Date(),
                    total_time_spent: 10800,
                }],
            } as any);

            mockRedis.del.mockResolvedValueOnce(1);

            const result = await service.autoSubmitOnTimeout(sessionId);

            expect(result.status).toBe('auto_submitted');
            expect(result.total_time_spent).toBe(10800);
        });

        it('should throw error if timer has not expired', async () => {
            const sessionId = 'test-session-id';
            const startTime = new Date(Date.now() - 1800000); // 30 minutes ago
            const mockSession = {
                id: sessionId,
                user_id: 'user-123',
                test_id: 'test-456',
                start_time: startTime,
                end_time: null,
                status: 'in_progress' as const,
                total_time_spent: 0,
                created_at: new Date(),
            };

            mockPool.query.mockResolvedValueOnce({
                rows: [mockSession],
            } as any);

            await expect(service.autoSubmitOnTimeout(sessionId)).rejects.toThrow('Timer has not expired yet');
        });
    });
});
