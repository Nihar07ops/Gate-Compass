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
