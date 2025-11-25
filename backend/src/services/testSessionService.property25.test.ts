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

// Feature: gate-compass, Property 25: Question palette status accuracy
// **Validates: Requirements 6.4**
// For any question in the palette, its displayed status (answered/unanswered/marked for review) should accurately reflect the current state of that question in the test session.

describe('Property 25: Question palette status accuracy', () => {
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

    // Generator for question state (answered, unanswered, marked for review)
    const questionStateArb = fc.oneof(
        fc.constant({ answered: false, markedForReview: false, answer: null }), // unanswered
        fc.tuple(answerArb).map(([answer]) => ({ answered: true, markedForReview: false, answer })), // answered
        fc.tuple(answerArb).map(([answer]) => ({ answered: true, markedForReview: true, answer })) // marked for review
    );

    // Helper function to derive expected status from session state
    const deriveExpectedStatus = (questionId: string, sessionState: any) => {
        const answer = sessionState.answers[questionId];

        if (!answer) {
            return { answered: false, markedForReview: false };
        }

        return {
            answered: true,
            markedForReview: answer.marked_for_review,
        };
    };

    it('should accurately reflect unanswered status for questions without answers', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                fc.array(questionIdArb, { minLength: 3, maxLength: 10 }),
                async (sessionRow, questionIds) => {
                    // Ensure unique questions
                    const uniqueQuestions = Array.from(new Set(questionIds));
                    fc.pre(uniqueQuestions.length >= 3);

                    // Don't save any answers - all questions should be unanswered

                    // Retrieve session state
                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    // No answers saved
                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    const state = await service.getSessionState(sessionRow.id);

                    // Property: All questions should show as unanswered
                    expect(state).not.toBeNull();

                    uniqueQuestions.forEach(questionId => {
                        const status = deriveExpectedStatus(questionId, state!);
                        expect(status.answered).toBe(false);
                        expect(status.markedForReview).toBe(false);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should accurately reflect answered status for questions with answers', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                fc.array(fc.tuple(questionIdArb, answerArb), { minLength: 2, maxLength: 5 }),
                async (sessionRow, questionAnswerPairs) => {
                    // Ensure unique questions
                    const uniqueQuestions = new Map<string, string>();
                    questionAnswerPairs.forEach(([qId, answer]) => {
                        if (!uniqueQuestions.has(qId)) {
                            uniqueQuestions.set(qId, answer);
                        }
                    });

                    fc.pre(uniqueQuestions.size >= 2);

                    // Save answers for all questions (not marked for review)
                    for (const [questionId, answer] of uniqueQuestions.entries()) {
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
                            markedForReview: false,
                        });
                    }

                    // Retrieve session state
                    jest.clearAllMocks();

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    const savedAnswers = Array.from(uniqueQuestions.entries()).map(([qId, answer]) => ({
                        session_id: sessionRow.id,
                        question_id: qId,
                        selected_answer: answer,
                        marked_for_review: false,
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

                    // Property: All questions should show as answered but not marked for review
                    expect(state).not.toBeNull();

                    uniqueQuestions.forEach((_answer, questionId) => {
                        const status = deriveExpectedStatus(questionId, state!);
                        expect(status.answered).toBe(true);
                        expect(status.markedForReview).toBe(false);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should accurately reflect marked for review status', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                fc.array(fc.tuple(questionIdArb, answerArb), { minLength: 2, maxLength: 5 }),
                async (sessionRow, questionAnswerPairs) => {
                    // Ensure unique questions
                    const uniqueQuestions = new Map<string, string>();
                    questionAnswerPairs.forEach(([qId, answer]) => {
                        if (!uniqueQuestions.has(qId)) {
                            uniqueQuestions.set(qId, answer);
                        }
                    });

                    fc.pre(uniqueQuestions.size >= 2);

                    // Save answers for all questions (marked for review)
                    for (const [questionId, answer] of uniqueQuestions.entries()) {
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
                            markedForReview: true,
                        });
                    }

                    // Retrieve session state
                    jest.clearAllMocks();

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    const savedAnswers = Array.from(uniqueQuestions.entries()).map(([qId, answer]) => ({
                        session_id: sessionRow.id,
                        question_id: qId,
                        selected_answer: answer,
                        marked_for_review: true,
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

                    // Property: All questions should show as answered AND marked for review
                    expect(state).not.toBeNull();

                    uniqueQuestions.forEach((_answer, questionId) => {
                        const status = deriveExpectedStatus(questionId, state!);
                        expect(status.answered).toBe(true);
                        expect(status.markedForReview).toBe(true);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should accurately reflect mixed statuses across multiple questions', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                fc.array(fc.tuple(questionIdArb, questionStateArb), { minLength: 5, maxLength: 10 }),
                async (sessionRow, questionStatePairs) => {
                    // Ensure unique questions
                    const uniqueQuestions = new Map<string, any>();
                    questionStatePairs.forEach(([qId, state]) => {
                        if (!uniqueQuestions.has(qId)) {
                            uniqueQuestions.set(qId, state);
                        }
                    });

                    fc.pre(uniqueQuestions.size >= 5);

                    // Save answers for questions that are answered
                    for (const [questionId, state] of uniqueQuestions.entries()) {
                        if (state.answered && state.answer) {
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
                                selectedAnswer: state.answer,
                                markedForReview: state.markedForReview,
                            });
                        }
                    }

                    // Retrieve session state
                    jest.clearAllMocks();

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    const savedAnswers = Array.from(uniqueQuestions.entries())
                        .filter(([_, state]) => state.answered && state.answer)
                        .map(([qId, state]) => ({
                            session_id: sessionRow.id,
                            question_id: qId,
                            selected_answer: state.answer,
                            marked_for_review: state.markedForReview,
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

                    // Property: Each question's status should accurately reflect its state
                    expect(state).not.toBeNull();

                    uniqueQuestions.forEach((expectedState, questionId) => {
                        const actualStatus = deriveExpectedStatus(questionId, state!);

                        if (expectedState.answered) {
                            expect(actualStatus.answered).toBe(true);
                            expect(actualStatus.markedForReview).toBe(expectedState.markedForReview);
                        } else {
                            expect(actualStatus.answered).toBe(false);
                            expect(actualStatus.markedForReview).toBe(false);
                        }
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should accurately update status when question state changes', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                questionIdArb,
                answerArb,
                answerArb,
                async (sessionRow, questionId, firstAnswer, secondAnswer) => {
                    fc.pre(firstAnswer !== secondAnswer);

                    // Step 1: Question is unanswered
                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    let state = await service.getSessionState(sessionRow.id);
                    let status = deriveExpectedStatus(questionId, state!);

                    // Should be unanswered
                    expect(status.answered).toBe(false);
                    expect(status.markedForReview).toBe(false);

                    // Step 2: Answer the question (not marked for review)
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
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    await service.saveAnswer(sessionRow.id, {
                        questionId,
                        selectedAnswer: firstAnswer,
                        markedForReview: false,
                    });

                    jest.clearAllMocks();

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [{
                            session_id: sessionRow.id,
                            question_id: questionId,
                            selected_answer: firstAnswer,
                            marked_for_review: false,
                            answered_at: new Date(),
                        }],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    state = await service.getSessionState(sessionRow.id);
                    status = deriveExpectedStatus(questionId, state!);

                    // Should be answered but not marked
                    expect(status.answered).toBe(true);
                    expect(status.markedForReview).toBe(false);

                    // Step 3: Mark for review
                    jest.clearAllMocks();

                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [{
                            session_id: sessionRow.id,
                            question_id: questionId,
                            selected_answer: firstAnswer,
                            marked_for_review: false,
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
                            marked_for_review: false,
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

                    state = await service.getSessionState(sessionRow.id);
                    status = deriveExpectedStatus(questionId, state!);

                    // Should be answered and marked
                    expect(status.answered).toBe(true);
                    expect(status.markedForReview).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('should maintain accurate status for all questions when one question changes', async () => {
        await fc.assert(
            fc.asyncProperty(
                activeSessionArb,
                fc.array(fc.tuple(questionIdArb, answerArb, fc.boolean()), { minLength: 3, maxLength: 6 }),
                questionIdArb,
                answerArb,
                async (sessionRow, initialQuestions, changeQuestionId, newAnswer) => {
                    // Ensure unique questions
                    const uniqueQuestions = new Map<string, { answer: string; review: boolean }>();
                    initialQuestions.forEach(([qId, answer, review]) => {
                        if (!uniqueQuestions.has(qId)) {
                            uniqueQuestions.set(qId, { answer, review });
                        }
                    });

                    fc.pre(uniqueQuestions.size >= 3);
                    fc.pre(!uniqueQuestions.has(changeQuestionId)); // Ensure change question is different

                    // Save initial answers
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

                    // Add new question
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

                    const existingAnswers = Array.from(uniqueQuestions.entries()).map(([qId, { answer, review }]) => ({
                        session_id: sessionRow.id,
                        question_id: qId,
                        selected_answer: answer,
                        marked_for_review: review,
                        answered_at: new Date(),
                    }));

                    mockPool.query.mockResolvedValueOnce({
                        rows: existingAnswers,
                    } as any);
                    mockPool.query.mockResolvedValueOnce({ rows: [] } as any);
                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    await service.saveAnswer(sessionRow.id, {
                        questionId: changeQuestionId,
                        selectedAnswer: newAnswer,
                        markedForReview: true,
                    });

                    // Retrieve final state
                    jest.clearAllMocks();

                    mockRedis.get.mockResolvedValueOnce(null);
                    mockPool.query.mockResolvedValueOnce({
                        rows: [sessionRow],
                    } as any);

                    const allAnswers = [
                        ...existingAnswers,
                        {
                            session_id: sessionRow.id,
                            question_id: changeQuestionId,
                            selected_answer: newAnswer,
                            marked_for_review: true,
                            answered_at: new Date(),
                        }
                    ];

                    mockPool.query.mockResolvedValueOnce({
                        rows: allAnswers,
                    } as any);

                    mockPool.query.mockResolvedValueOnce({
                        rows: [],
                    } as any);

                    mockRedis.setEx.mockResolvedValueOnce('OK');

                    const state = await service.getSessionState(sessionRow.id);

                    // Property: All original questions should maintain their status
                    expect(state).not.toBeNull();

                    uniqueQuestions.forEach(({ review }, questionId) => {
                        const status = deriveExpectedStatus(questionId, state!);
                        expect(status.answered).toBe(true);
                        expect(status.markedForReview).toBe(review);
                    });

                    // New question should have correct status
                    const newStatus = deriveExpectedStatus(changeQuestionId, state!);
                    expect(newStatus.answered).toBe(true);
                    expect(newStatus.markedForReview).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });
});
