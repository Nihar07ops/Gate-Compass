import { Pool } from 'pg';
import pool from '../config/database';
import redisClient from '../config/redis';
import {
    TestSession,
    TestSessionRow,
    SessionAnswer,
    SessionAnswerRow,
    QuestionTimeRow,
    TestSessionStatus,
} from '../types/models';

const TEST_DURATION = 10800; // 3 hours in seconds
const REDIS_SESSION_PREFIX = 'test_session:';
const REDIS_SESSION_TTL = 14400; // 4 hours (longer than test duration for safety)

export interface SaveAnswerRequest {
    questionId: string;
    selectedAnswer: string;
    markedForReview: boolean;
}

export interface TrackTimeRequest {
    questionId: string;
    timeSpent: number;
}

export interface SessionState {
    sessionId: string;
    userId: string;
    testId: string;
    startTime: Date;
    status: TestSessionStatus;
    answers: Record<string, SessionAnswer>;
    questionTimes: Record<string, number>;
    totalTimeSpent: number;
}

/**
 * Service for managing test sessions
 * Requirements: 4.1, 4.3, 4.5, 5.1, 5.2, 5.3, 5.4, 6.2, 6.3, 6.5
 */
export class TestSessionService {
    private pool: Pool;

    constructor() {
        this.pool = pool;
    }

    /**
     * Start a test session
     * Requirements: 4.1
     */
    async startTest(sessionId: string): Promise<TestSession> {
        // Get session from database
        const result = await this.pool.query<TestSessionRow>(
            `SELECT * FROM test_sessions WHERE id = $1`,
            [sessionId]
        );

        if (result.rows.length === 0) {
            throw new Error('Test session not found');
        }

        const sessionRow = result.rows[0];

        // Check if session is already started
        if (sessionRow.start_time) {
            // Session already started, return existing session
            return this.mapRowToTestSession(sessionRow);
        }

        // Update session with start time
        const updateResult = await this.pool.query<TestSessionRow>(
            `UPDATE test_sessions 
             SET start_time = NOW()
             WHERE id = $1
             RETURNING *`,
            [sessionId]
        );

        const session = this.mapRowToTestSession(updateResult.rows[0]);

        // Initialize session state in Redis
        await this.initializeSessionState(session);

        return session;
    }

    /**
     * Save an answer for a question
     * Requirements: 6.2, 6.3, 6.5
     */
    async saveAnswer(
        sessionId: string,
        request: SaveAnswerRequest
    ): Promise<void> {
        // Verify session is active
        await this.verifySessionActive(sessionId);

        // Check if answer already exists
        const existingAnswer = await this.pool.query<SessionAnswerRow>(
            `SELECT * FROM session_answers 
             WHERE session_id = $1 AND question_id = $2`,
            [sessionId, request.questionId]
        );

        if (existingAnswer.rows.length > 0) {
            // Update existing answer
            await this.pool.query(
                `UPDATE session_answers 
                 SET selected_answer = $1, marked_for_review = $2, answered_at = NOW()
                 WHERE session_id = $3 AND question_id = $4`,
                [
                    request.selectedAnswer,
                    request.markedForReview,
                    sessionId,
                    request.questionId,
                ]
            );
        } else {
            // Insert new answer
            await this.pool.query(
                `INSERT INTO session_answers 
                 (session_id, question_id, selected_answer, marked_for_review)
                 VALUES ($1, $2, $3, $4)`,
                [
                    sessionId,
                    request.questionId,
                    request.selectedAnswer,
                    request.markedForReview,
                ]
            );
        }

        // Update Redis cache
        await this.updateAnswerInRedis(sessionId, request);
    }

    /**
     * Track time spent on a question
     * Requirements: 5.1, 5.2, 5.3, 5.4
     */
    async trackQuestionTime(
        sessionId: string,
        request: TrackTimeRequest
    ): Promise<void> {
        // Verify session is active
        await this.verifySessionActive(sessionId);

        // Check if time record already exists
        const existingTime = await this.pool.query<QuestionTimeRow>(
            `SELECT * FROM question_times 
             WHERE session_id = $1 AND question_id = $2`,
            [sessionId, request.questionId]
        );

        if (existingTime.rows.length > 0) {
            // Update existing time (cumulative)
            const currentTime = existingTime.rows[0].time_spent;
            const newTime = currentTime + request.timeSpent;

            await this.pool.query(
                `UPDATE question_times 
                 SET time_spent = $1, updated_at = NOW()
                 WHERE session_id = $2 AND question_id = $3`,
                [newTime, sessionId, request.questionId]
            );
        } else {
            // Insert new time record
            await this.pool.query(
                `INSERT INTO question_times 
                 (session_id, question_id, time_spent)
                 VALUES ($1, $2, $3)`,
                [sessionId, request.questionId, request.timeSpent]
            );
        }

        // Update Redis cache
        await this.updateTimeInRedis(sessionId, request);
    }

    /**
     * Submit test manually
     * Requirements: 4.5
     */
    async submitTest(sessionId: string): Promise<TestSession> {
        // Get session
        const sessionResult = await this.pool.query<TestSessionRow>(
            `SELECT * FROM test_sessions WHERE id = $1`,
            [sessionId]
        );

        if (sessionResult.rows.length === 0) {
            throw new Error('Test session not found');
        }

        const sessionRow = sessionResult.rows[0];

        // Check if already submitted
        if (sessionRow.status !== 'in_progress') {
            throw new Error('Test session is not in progress');
        }

        // Calculate actual time spent
        const startTime = new Date(sessionRow.start_time);
        const endTime = new Date();
        const totalTimeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        // Update session status
        const updateResult = await this.pool.query<TestSessionRow>(
            `UPDATE test_sessions 
             SET status = 'completed', 
                 end_time = NOW(),
                 total_time_spent = $1
             WHERE id = $2
             RETURNING *`,
            [totalTimeSpent, sessionId]
        );

        // Clear Redis cache
        await this.clearSessionFromRedis(sessionId);

        return this.mapRowToTestSession(updateResult.rows[0]);
    }

    /**
     * Auto-submit test when timer expires
     * Requirements: 4.3
     */
    async autoSubmitOnTimeout(sessionId: string): Promise<TestSession> {
        // Get session
        const sessionResult = await this.pool.query<TestSessionRow>(
            `SELECT * FROM test_sessions WHERE id = $1`,
            [sessionId]
        );

        if (sessionResult.rows.length === 0) {
            throw new Error('Test session not found');
        }

        const sessionRow = sessionResult.rows[0];

        // Check if already submitted
        if (sessionRow.status !== 'in_progress') {
            throw new Error('Test session is not in progress');
        }

        // Check if timer has actually expired
        const startTime = new Date(sessionRow.start_time);
        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);

        if (elapsedSeconds < TEST_DURATION) {
            throw new Error('Timer has not expired yet');
        }

        // Update session status to auto_submitted
        const updateResult = await this.pool.query<TestSessionRow>(
            `UPDATE test_sessions 
             SET status = 'auto_submitted', 
                 end_time = NOW(),
                 total_time_spent = $1
             WHERE id = $2
             RETURNING *`,
            [TEST_DURATION, sessionId]
        );

        // Clear Redis cache
        await this.clearSessionFromRedis(sessionId);

        return this.mapRowToTestSession(updateResult.rows[0]);
    }

    /**
     * Get session state from Redis or database
     */
    async getSessionState(sessionId: string): Promise<SessionState | null> {
        // Try to get from Redis first
        const redisKey = `${REDIS_SESSION_PREFIX}${sessionId}`;

        try {
            const cachedState = await redisClient.get(redisKey);

            if (cachedState) {
                return JSON.parse(cachedState);
            }
        } catch (error) {
            console.error('Error getting session from Redis:', error);
        }

        // Fall back to database
        return await this.getSessionStateFromDatabase(sessionId);
    }

    /**
     * Get session state from database
     */
    private async getSessionStateFromDatabase(sessionId: string): Promise<SessionState | null> {
        // Get session
        const sessionResult = await this.pool.query<TestSessionRow>(
            `SELECT * FROM test_sessions WHERE id = $1`,
            [sessionId]
        );

        if (sessionResult.rows.length === 0) {
            return null;
        }

        const sessionRow = sessionResult.rows[0];

        // Get answers
        const answersResult = await this.pool.query<SessionAnswerRow>(
            `SELECT * FROM session_answers WHERE session_id = $1`,
            [sessionId]
        );

        const answers: Record<string, SessionAnswer> = {};
        answersResult.rows.forEach(row => {
            answers[row.question_id] = this.mapRowToSessionAnswer(row);
        });

        // Get question times
        const timesResult = await this.pool.query<QuestionTimeRow>(
            `SELECT * FROM question_times WHERE session_id = $1`,
            [sessionId]
        );

        const questionTimes: Record<string, number> = {};
        timesResult.rows.forEach(row => {
            questionTimes[row.question_id] = row.time_spent;
        });

        const state: SessionState = {
            sessionId: sessionRow.id,
            userId: sessionRow.user_id,
            testId: sessionRow.test_id,
            startTime: sessionRow.start_time,
            status: sessionRow.status,
            answers,
            questionTimes,
            totalTimeSpent: sessionRow.total_time_spent,
        };

        // Cache in Redis
        await this.cacheSessionState(state);

        return state;
    }

    /**
     * Initialize session state in Redis
     */
    private async initializeSessionState(session: TestSession): Promise<void> {
        const state: SessionState = {
            sessionId: session.id,
            userId: session.user_id,
            testId: session.test_id,
            startTime: session.start_time!,
            status: session.status,
            answers: {},
            questionTimes: {},
            totalTimeSpent: 0,
        };

        await this.cacheSessionState(state);
    }

    /**
     * Cache session state in Redis
     */
    private async cacheSessionState(state: SessionState): Promise<void> {
        const redisKey = `${REDIS_SESSION_PREFIX}${state.sessionId}`;

        try {
            await redisClient.setEx(
                redisKey,
                REDIS_SESSION_TTL,
                JSON.stringify(state)
            );
        } catch (error) {
            console.error('Error caching session state in Redis:', error);
            // Don't throw error, just log it
        }
    }

    /**
     * Update answer in Redis cache
     */
    private async updateAnswerInRedis(
        sessionId: string,
        request: SaveAnswerRequest
    ): Promise<void> {
        try {
            const state = await this.getSessionState(sessionId);

            if (state) {
                state.answers[request.questionId] = {
                    id: '', // Not needed for cache
                    session_id: sessionId,
                    question_id: request.questionId,
                    selected_answer: request.selectedAnswer,
                    marked_for_review: request.markedForReview,
                    answered_at: new Date(),
                };

                await this.cacheSessionState(state);
            }
        } catch (error) {
            console.error('Error updating answer in Redis:', error);
        }
    }

    /**
     * Update time in Redis cache
     */
    private async updateTimeInRedis(
        sessionId: string,
        request: TrackTimeRequest
    ): Promise<void> {
        try {
            const state = await this.getSessionState(sessionId);

            if (state) {
                const currentTime = state.questionTimes[request.questionId] || 0;
                state.questionTimes[request.questionId] = currentTime + request.timeSpent;

                await this.cacheSessionState(state);
            }
        } catch (error) {
            console.error('Error updating time in Redis:', error);
        }
    }

    /**
     * Clear session from Redis
     */
    private async clearSessionFromRedis(sessionId: string): Promise<void> {
        const redisKey = `${REDIS_SESSION_PREFIX}${sessionId}`;

        try {
            await redisClient.del(redisKey);
        } catch (error) {
            console.error('Error clearing session from Redis:', error);
        }
    }

    /**
     * Verify session is active
     */
    private async verifySessionActive(sessionId: string): Promise<void> {
        const result = await this.pool.query<TestSessionRow>(
            `SELECT status FROM test_sessions WHERE id = $1`,
            [sessionId]
        );

        if (result.rows.length === 0) {
            throw new Error('Test session not found');
        }

        if (result.rows[0].status !== 'in_progress') {
            throw new Error('Test session is not active');
        }
    }

    /**
     * Map database row to TestSession model
     */
    private mapRowToTestSession(row: TestSessionRow): TestSession {
        return {
            id: row.id,
            user_id: row.user_id,
            test_id: row.test_id,
            start_time: row.start_time,
            end_time: row.end_time || undefined,
            status: row.status,
            total_time_spent: row.total_time_spent,
            created_at: row.created_at,
        };
    }

    /**
     * Map database row to SessionAnswer model
     */
    private mapRowToSessionAnswer(row: SessionAnswerRow): SessionAnswer {
        return {
            id: row.id,
            session_id: row.session_id,
            question_id: row.question_id,
            selected_answer: row.selected_answer,
            marked_for_review: row.marked_for_review,
            answered_at: row.answered_at,
        };
    }
}
