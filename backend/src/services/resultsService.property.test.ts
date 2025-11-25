import * as fc from 'fast-check';
import { ResultsService } from './resultsService';
import {
    Question,
    QuestionOption,
    Difficulty,
    TestSessionRow,
    SessionAnswerRow,
    QuestionRow,
    ConceptRow,
    QuestionTimeRow,
    TestResultRow,
} from '../types/models';

// Feature: gate-compass, Property 26: Score calculation correctness
// **Validates: Requirements 7.1**
// For any submitted test session, the calculated score should equal the number of questions
// where the user's selected answer matches the correct answer.

describe('Results Service - Property-Based Tests', () => {
    describe('Property 26: Score calculation correctness', () => {
        let service: ResultsService;
        let mockPool: any;

        beforeEach(() => {
            // Create a mock pool
            mockPool = {
                query: jest.fn(),
                connect: jest.fn(),
                end: jest.fn(),
                on: jest.fn(),
            };

            // Create service instance and inject mock pool
            service = new ResultsService();
            (service as any).pool = mockPool;
        });

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for valid questions
        const validQuestionArb: fc.Arbitrary<Question> = fc
            .tuple(
                fc.uuid(), // id
                fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0), // content
                fc.array(validOptionArb, { minLength: 2, maxLength: 6 }), // options
                fc.constantFrom<Difficulty>('easy', 'medium', 'hard'), // difficulty
                fc.uuid(), // concept_id
                fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0), // source
                fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length > 0), // explanation
                fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }), // sub_concept
                fc.option(fc.integer({ min: 1990, max: new Date().getFullYear() }), { nil: undefined }) // year_appeared
            )
            .chain(([id, content, options, difficulty, concept_id, source, explanation, sub_concept, year_appeared]) => {
                return fc.constantFrom(...options.map(opt => opt.id)).map(correct_answer => ({
                    id,
                    content,
                    options,
                    correct_answer,
                    explanation,
                    concept_id,
                    sub_concept,
                    difficulty,
                    source,
                    year_appeared,
                    created_at: new Date(),
                    updated_at: new Date(),
                }));
            });

        // Helper function to setup mocks for a test iteration
        const setupMocks = (
            sessionId: string,
            userId: string,
            testId: string,
            uniqueQuestions: Question[],
            answerRows: SessionAnswerRow[]
        ) => {
            const questionIds = uniqueQuestions.map(q => q.id);

            const questionRows: QuestionRow[] = uniqueQuestions.map(q => ({
                id: q.id,
                content: q.content,
                options: JSON.stringify(q.options),
                correct_answer: q.correct_answer,
                explanation: q.explanation,
                concept_id: q.concept_id,
                sub_concept: q.sub_concept || null,
                difficulty: q.difficulty,
                source: q.source,
                year_appeared: q.year_appeared || null,
                created_at: new Date(),
                updated_at: new Date(),
            }));

            const timeRows: QuestionTimeRow[] = uniqueQuestions.map((q, idx) => ({
                id: `time-${idx}`,
                session_id: sessionId,
                question_id: q.id,
                time_spent: 60,
                created_at: new Date(),
                updated_at: new Date(),
            }));

            const uniqueConceptIds = [...new Set(uniqueQuestions.map(q => q.concept_id))];
            const conceptRows: ConceptRow[] = uniqueConceptIds.map((id, idx) => ({
                id,
                name: `Concept ${idx}`,
                category: `Category ${idx}`,
                description: `Description ${idx}`,
                created_at: new Date(),
            }));

            // Reset and setup all mocks for this iteration
            mockPool.query.mockReset();
            mockPool.query
                .mockResolvedValueOnce({
                    rows: [{
                        id: sessionId,
                        user_id: userId,
                        test_id: testId,
                        start_time: new Date(),
                        end_time: new Date(),
                        status: 'completed' as const,
                        total_time_spent: 3600,
                        created_at: new Date(),
                    } as TestSessionRow],
                    rowCount: 1,
                } as any)
                .mockResolvedValueOnce({
                    rows: [{
                        id: testId,
                        question_ids: JSON.stringify(questionIds),
                        total_questions: uniqueQuestions.length,
                        duration: 10800,
                        created_at: new Date(),
                    }],
                    rowCount: 1,
                } as any)
                .mockResolvedValueOnce({
                    rows: questionRows,
                    rowCount: questionRows.length,
                } as any)
                .mockResolvedValueOnce({
                    rows: answerRows,
                    rowCount: answerRows.length,
                } as any)
                .mockResolvedValueOnce({
                    rows: timeRows,
                    rowCount: timeRows.length,
                } as any)
                .mockResolvedValueOnce({
                    rows: conceptRows,
                    rowCount: conceptRows.length,
                } as any)
                .mockResolvedValueOnce({
                    rows: conceptRows,
                    rowCount: conceptRows.length,
                } as any)
                .mockResolvedValueOnce({
                    rows: [{ id: 'result-id' }],
                    rowCount: 1,
                } as any);
        };

        it('should calculate score correctly for any combination of correct/incorrect/unanswered questions', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 5, maxLength: 30 }),
                    fc.uuid(),
                    fc.uuid(),
                    fc.uuid(),
                    async (questions, sessionId, userId, testId) => {
                        // Ensure unique question IDs
                        const uniqueQuestions = questions.map((q, idx) => ({
                            ...q,
                            id: `question-${idx}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                            concept_id: `concept-${idx % 3}`, // Use a few concepts
                        }));

                        // Generate random answers (correct, incorrect, or unanswered)
                        const userAnswersData: Array<{ question_id: string; selected_answer?: string }> = [];
                        let expectedCorrect = 0;
                        let expectedIncorrect = 0;
                        let expectedUnanswered = 0;

                        for (const q of uniqueQuestions) {
                            const rand = Math.random();
                            if (rand < 0.33) {
                                // Correct answer
                                userAnswersData.push({
                                    question_id: q.id,
                                    selected_answer: q.correct_answer,
                                });
                                expectedCorrect++;
                            } else if (rand < 0.66) {
                                // Incorrect answer (pick a wrong option)
                                const wrongOption = q.options.find(opt => opt.id !== q.correct_answer);
                                if (wrongOption) {
                                    userAnswersData.push({
                                        question_id: q.id,
                                        selected_answer: wrongOption.id,
                                    });
                                    expectedIncorrect++;
                                } else {
                                    // If no wrong option, leave unanswered
                                    expectedUnanswered++;
                                }
                            } else {
                                // Unanswered
                                expectedUnanswered++;
                            }
                        }

                        const answerRows: SessionAnswerRow[] = userAnswersData
                            .filter(a => a.selected_answer !== undefined)
                            .map((a, idx) => ({
                                id: `answer-${idx}`,
                                session_id: sessionId,
                                question_id: a.question_id,
                                selected_answer: a.selected_answer!,
                                marked_for_review: false,
                                answered_at: new Date(),
                            }));

                        setupMocks(sessionId, userId, testId, uniqueQuestions, answerRows);

                        const result = await service.calculateScore(sessionId);

                        // Property: Score should equal the number of correct answers
                        expect(result.score).toBe(expectedCorrect);
                        expect(result.correct_answers).toBe(expectedCorrect);
                        expect(result.incorrect_answers).toBe(expectedIncorrect);
                        expect(result.unanswered).toBe(expectedUnanswered);
                        expect(result.total_questions).toBe(uniqueQuestions.length);

                        // Verify percentage calculation
                        const expectedPercentage = uniqueQuestions.length > 0
                            ? (expectedCorrect / uniqueQuestions.length) * 100
                            : 0;
                        expect(result.percentage).toBeCloseTo(expectedPercentage, 2);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 27: Results completeness
    // **Validates: Requirements 7.2**
    // For any test result, each question should display the user's response, the correct answer, and an explanation.
    describe('Property 27: Results completeness', () => {
        let service: ResultsService;
        let mockPool: any;

        beforeEach(() => {
            // Create a mock pool
            mockPool = {
                query: jest.fn(),
                connect: jest.fn(),
                end: jest.fn(),
                on: jest.fn(),
            };

            // Create service instance and inject mock pool
            service = new ResultsService();
            (service as any).pool = mockPool;
        });

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for valid questions with guaranteed explanations
        const validQuestionArb: fc.Arbitrary<Question> = fc
            .tuple(
                fc.uuid(), // id
                fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0), // content
                fc.array(validOptionArb, { minLength: 2, maxLength: 6 }), // options
                fc.constantFrom<Difficulty>('easy', 'medium', 'hard'), // difficulty
                fc.uuid(), // concept_id
                fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0), // source
                fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length > 0), // explanation (non-empty)
                fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }), // sub_concept
                fc.option(fc.integer({ min: 1990, max: new Date().getFullYear() }), { nil: undefined }) // year_appeared
            )
            .chain(([id, content, options, difficulty, concept_id, source, explanation, sub_concept, year_appeared]) => {
                return fc.constantFrom(...options.map(opt => opt.id)).map(correct_answer => ({
                    id,
                    content,
                    options,
                    correct_answer,
                    explanation,
                    concept_id,
                    sub_concept,
                    difficulty,
                    source,
                    year_appeared,
                    created_at: new Date(),
                    updated_at: new Date(),
                }));
            });

        it('should include user response, correct answer, and explanation for every question in detailed analysis', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 3, maxLength: 20 }),
                    fc.uuid(),
                    fc.uuid(),
                    fc.uuid(),
                    async (questions, sessionId, userId, testId) => {
                        // Ensure unique question IDs
                        const uniqueQuestions = questions.map((q, idx) => ({
                            ...q,
                            id: `question-${idx}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                            concept_id: `concept-${idx % 3}`,
                        }));

                        // Generate random answers for each question
                        const answerRows: SessionAnswerRow[] = uniqueQuestions.map((q, idx) => {
                            const rand = Math.random();
                            let selectedAnswer: string;

                            if (rand < 0.5) {
                                // Correct answer
                                selectedAnswer = q.correct_answer;
                            } else {
                                // Incorrect answer (pick a wrong option)
                                const wrongOption = q.options.find(opt => opt.id !== q.correct_answer);
                                selectedAnswer = wrongOption ? wrongOption.id : q.correct_answer;
                            }

                            return {
                                id: `answer-${idx}`,
                                session_id: sessionId,
                                question_id: q.id,
                                selected_answer: selectedAnswer,
                                marked_for_review: Math.random() < 0.3,
                                answered_at: new Date(),
                            };
                        });

                        const questionIds = uniqueQuestions.map(q => q.id);

                        const questionRows: QuestionRow[] = uniqueQuestions.map(q => ({
                            id: q.id,
                            content: q.content,
                            options: JSON.stringify(q.options),
                            correct_answer: q.correct_answer,
                            explanation: q.explanation,
                            concept_id: q.concept_id,
                            sub_concept: q.sub_concept || null,
                            difficulty: q.difficulty,
                            source: q.source,
                            year_appeared: q.year_appeared || null,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }));

                        const timeRows: QuestionTimeRow[] = uniqueQuestions.map((q, idx) => ({
                            id: `time-${idx}`,
                            session_id: sessionId,
                            question_id: q.id,
                            time_spent: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
                            created_at: new Date(),
                            updated_at: new Date(),
                        }));

                        // Setup mocks for getDetailedAnalysis
                        mockPool.query.mockReset();

                        // Mock for getResultBySessionId
                        mockPool.query
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: 'result-id',
                                    session_id: sessionId,
                                    user_id: userId,
                                    score: 10,
                                    total_questions: uniqueQuestions.length,
                                    correct_answers: 10,
                                    incorrect_answers: 5,
                                    unanswered: 0,
                                    percentage: 66.67,
                                    concept_performance: JSON.stringify([]),
                                    feedback: JSON.stringify({
                                        overall_message: 'Good job',
                                        strengths: [],
                                        weaknesses: [],
                                        recommendations: [],
                                    }),
                                    created_at: new Date(),
                                }],
                                rowCount: 1,
                            } as any)
                            // Mock for session query
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: sessionId,
                                    user_id: userId,
                                    test_id: testId,
                                    start_time: new Date(),
                                    end_time: new Date(),
                                    status: 'completed' as const,
                                    total_time_spent: 3600,
                                    created_at: new Date(),
                                } as TestSessionRow],
                                rowCount: 1,
                            } as any)
                            // Mock for test query
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: testId,
                                    question_ids: JSON.stringify(questionIds),
                                    total_questions: uniqueQuestions.length,
                                    duration: 10800,
                                    created_at: new Date(),
                                }],
                                rowCount: 1,
                            } as any)
                            // Mock for questions query
                            .mockResolvedValueOnce({
                                rows: questionRows,
                                rowCount: questionRows.length,
                            } as any)
                            // Mock for answers query
                            .mockResolvedValueOnce({
                                rows: answerRows,
                                rowCount: answerRows.length,
                            } as any)
                            // Mock for times query
                            .mockResolvedValueOnce({
                                rows: timeRows,
                                rowCount: timeRows.length,
                            } as any);

                        const detailedAnalysis = await service.getDetailedAnalysis(sessionId);

                        // Property: Every question should have user response, correct answer, and explanation
                        expect(detailedAnalysis.questions).toHaveLength(uniqueQuestions.length);

                        for (let i = 0; i < uniqueQuestions.length; i++) {
                            const questionBreakdown = detailedAnalysis.questions[i];
                            const originalQuestion = uniqueQuestions[i];
                            const userAnswer = answerRows[i];

                            // Each question should have the user's response (or null if unanswered)
                            expect(questionBreakdown.user_answer).toBe(userAnswer.selected_answer);

                            // Each question should have the correct answer
                            expect(questionBreakdown.correct_answer).toBe(originalQuestion.correct_answer);
                            expect(questionBreakdown.correct_answer).toBeDefined();
                            expect(questionBreakdown.correct_answer).not.toBe('');

                            // Each question should have an explanation
                            expect(questionBreakdown.explanation).toBe(originalQuestion.explanation);
                            expect(questionBreakdown.explanation).toBeDefined();
                            expect(questionBreakdown.explanation.length).toBeGreaterThan(0);

                            // Additional completeness checks
                            expect(questionBreakdown.question_id).toBe(originalQuestion.id);
                            expect(questionBreakdown.content).toBe(originalQuestion.content);
                            expect(questionBreakdown.options).toBeDefined();
                            expect(questionBreakdown.time_spent).toBeDefined();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 28: Concept-wise accuracy calculation
    // **Validates: Requirements 7.3**
    // For any concept in the test results, the accuracy percentage should equal
    // (correct answers for that concept / total questions for that concept) × 100.
    describe('Property 28: Concept-wise accuracy calculation', () => {
        let service: ResultsService;
        let mockPool: any;

        beforeEach(() => {
            // Create a mock pool
            mockPool = {
                query: jest.fn(),
                connect: jest.fn(),
                end: jest.fn(),
                on: jest.fn(),
            };

            // Create service instance and inject mock pool
            service = new ResultsService();
            (service as any).pool = mockPool;
        });

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for valid questions
        const validQuestionArb: fc.Arbitrary<Question> = fc
            .tuple(
                fc.uuid(), // id
                fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0), // content
                fc.array(validOptionArb, { minLength: 2, maxLength: 6 }), // options
                fc.constantFrom<Difficulty>('easy', 'medium', 'hard'), // difficulty
                fc.uuid(), // concept_id
                fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0), // source
                fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length > 0), // explanation
                fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }), // sub_concept
                fc.option(fc.integer({ min: 1990, max: new Date().getFullYear() }), { nil: undefined }) // year_appeared
            )
            .chain(([id, content, options, difficulty, concept_id, source, explanation, sub_concept, year_appeared]) => {
                return fc.constantFrom(...options.map(opt => opt.id)).map(correct_answer => ({
                    id,
                    content,
                    options,
                    correct_answer,
                    explanation,
                    concept_id,
                    sub_concept,
                    difficulty,
                    source,
                    year_appeared,
                    created_at: new Date(),
                    updated_at: new Date(),
                }));
            });

        it('should calculate concept-wise accuracy correctly for any distribution of questions and answers', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 5, maxLength: 30 }),
                    fc.uuid(),
                    fc.uuid(),
                    fc.uuid(),
                    async (questions, sessionId, userId, testId) => {
                        // Assign questions to a limited set of concepts (2-5 concepts)
                        const numConcepts = Math.min(5, Math.max(2, Math.floor(questions.length / 3)));
                        const conceptIds = Array.from({ length: numConcepts }, (_, i) => `concept-${i}`);

                        const uniqueQuestions = questions.map((q, idx) => ({
                            ...q,
                            id: `question-${idx}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                            concept_id: conceptIds[idx % conceptIds.length], // Distribute across concepts
                        }));

                        // Track expected accuracy per concept
                        const conceptStats = new Map<string, { total: number; correct: number }>();

                        // Initialize concept stats
                        for (const conceptId of conceptIds) {
                            conceptStats.set(conceptId, { total: 0, correct: 0 });
                        }

                        // Generate random answers and track stats
                        const answerRows: SessionAnswerRow[] = [];

                        for (const q of uniqueQuestions) {
                            const stats = conceptStats.get(q.concept_id)!;
                            stats.total++;

                            const rand = Math.random();
                            if (rand < 0.7) {
                                // Answer the question (70% chance)
                                const isCorrect = Math.random() < 0.6; // 60% correct rate
                                const selectedAnswer = isCorrect
                                    ? q.correct_answer
                                    : (q.options.find(opt => opt.id !== q.correct_answer)?.id || q.correct_answer);

                                answerRows.push({
                                    id: `answer-${answerRows.length}`,
                                    session_id: sessionId,
                                    question_id: q.id,
                                    selected_answer: selectedAnswer,
                                    marked_for_review: false,
                                    answered_at: new Date(),
                                });

                                if (isCorrect) {
                                    stats.correct++;
                                }
                            }
                            // 30% chance of leaving unanswered (no increment to correct)
                        }

                        const questionIds = uniqueQuestions.map(q => q.id);

                        const questionRows: QuestionRow[] = uniqueQuestions.map(q => ({
                            id: q.id,
                            content: q.content,
                            options: JSON.stringify(q.options),
                            correct_answer: q.correct_answer,
                            explanation: q.explanation,
                            concept_id: q.concept_id,
                            sub_concept: q.sub_concept || null,
                            difficulty: q.difficulty,
                            source: q.source,
                            year_appeared: q.year_appeared || null,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }));

                        const timeRows: QuestionTimeRow[] = uniqueQuestions.map((q, idx) => ({
                            id: `time-${idx}`,
                            session_id: sessionId,
                            question_id: q.id,
                            time_spent: 60,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }));

                        const conceptRows: ConceptRow[] = conceptIds.map((id, idx) => ({
                            id,
                            name: `Concept ${idx}`,
                            category: `Category ${idx}`,
                            description: `Description ${idx}`,
                            created_at: new Date(),
                        }));

                        // Setup mocks
                        mockPool.query.mockReset();
                        mockPool.query
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: sessionId,
                                    user_id: userId,
                                    test_id: testId,
                                    start_time: new Date(),
                                    end_time: new Date(),
                                    status: 'completed' as const,
                                    total_time_spent: 3600,
                                    created_at: new Date(),
                                } as TestSessionRow],
                                rowCount: 1,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: testId,
                                    question_ids: JSON.stringify(questionIds),
                                    total_questions: uniqueQuestions.length,
                                    duration: 10800,
                                    created_at: new Date(),
                                }],
                                rowCount: 1,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: questionRows,
                                rowCount: questionRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: answerRows,
                                rowCount: answerRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: timeRows,
                                rowCount: timeRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: conceptRows,
                                rowCount: conceptRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: conceptRows,
                                rowCount: conceptRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: [{ id: 'result-id' }],
                                rowCount: 1,
                            } as any);

                        const result = await service.calculateScore(sessionId);

                        // Property: For each concept, accuracy should equal (correct / total) * 100
                        expect(result.concept_performance).toBeDefined();
                        expect(result.concept_performance.length).toBeGreaterThan(0);

                        for (const conceptPerf of result.concept_performance) {
                            const expectedStats = conceptStats.get(conceptPerf.concept_id);

                            // Verify the concept exists in our test data
                            expect(expectedStats).toBeDefined();

                            if (expectedStats) {
                                // Verify total questions count
                                expect(conceptPerf.total_questions).toBe(expectedStats.total);

                                // Verify correct answers count
                                expect(conceptPerf.correct_answers).toBe(expectedStats.correct);

                                // Verify accuracy calculation: (correct / total)
                                const expectedAccuracy = expectedStats.total > 0
                                    ? expectedStats.correct / expectedStats.total
                                    : 0;

                                expect(conceptPerf.accuracy).toBeCloseTo(expectedAccuracy, 10);

                                // Verify accuracy is in valid range [0, 1]
                                expect(conceptPerf.accuracy).toBeGreaterThanOrEqual(0);
                                expect(conceptPerf.accuracy).toBeLessThanOrEqual(1);
                            }
                        }

                        // Verify all concepts are represented
                        const returnedConceptIds = new Set(result.concept_performance.map(cp => cp.concept_id));
                        for (const conceptId of conceptIds) {
                            expect(returnedConceptIds.has(conceptId)).toBe(true);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 29: Weak concept identification
    // **Validates: Requirements 7.4**
    // For any concept in the test results with accuracy below 60%, the system should classify it
    // as a weak concept and include it in the feedback section.
    describe('Property 29: Weak concept identification', () => {
        let service: ResultsService;
        let mockPool: any;

        beforeEach(() => {
            // Create a mock pool
            mockPool = {
                query: jest.fn(),
                connect: jest.fn(),
                end: jest.fn(),
                on: jest.fn(),
            };

            // Create service instance and inject mock pool
            service = new ResultsService();
            (service as any).pool = mockPool;
        });

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for valid questions
        const validQuestionArb: fc.Arbitrary<Question> = fc
            .tuple(
                fc.uuid(), // id
                fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0), // content
                fc.array(validOptionArb, { minLength: 2, maxLength: 6 }), // options
                fc.constantFrom<Difficulty>('easy', 'medium', 'hard'), // difficulty
                fc.uuid(), // concept_id
                fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0), // source
                fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length > 0), // explanation
                fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }), // sub_concept
                fc.option(fc.integer({ min: 1990, max: new Date().getFullYear() }), { nil: undefined }) // year_appeared
            )
            .chain(([id, content, options, difficulty, concept_id, source, explanation, sub_concept, year_appeared]) => {
                return fc.constantFrom(...options.map(opt => opt.id)).map(correct_answer => ({
                    id,
                    content,
                    options,
                    correct_answer,
                    explanation,
                    concept_id,
                    sub_concept,
                    difficulty,
                    source,
                    year_appeared,
                    created_at: new Date(),
                    updated_at: new Date(),
                }));
            });

        it('should classify all concepts with accuracy below 60% as weak concepts in feedback', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 10, maxLength: 40 }),
                    fc.uuid(),
                    fc.uuid(),
                    fc.uuid(),
                    async (questions, sessionId, userId, testId) => {
                        // Create 3-6 concepts with controlled accuracy levels
                        const numConcepts = Math.min(6, Math.max(3, Math.floor(questions.length / 5)));
                        const conceptIds = Array.from({ length: numConcepts }, (_, i) => `concept-${i}`);

                        // Assign questions to concepts
                        const uniqueQuestions = questions.map((q, idx) => ({
                            ...q,
                            id: `question-${idx}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                            concept_id: conceptIds[idx % conceptIds.length],
                        }));

                        // Track expected accuracy per concept and control it
                        const conceptStats = new Map<string, { total: number; correct: number; accuracy: number }>();

                        // Initialize concept stats
                        for (const conceptId of conceptIds) {
                            conceptStats.set(conceptId, { total: 0, correct: 0, accuracy: 0 });
                        }

                        // Count questions per concept first
                        for (const q of uniqueQuestions) {
                            const stats = conceptStats.get(q.concept_id)!;
                            stats.total++;
                        }

                        // Assign target accuracy for each concept (mix of weak and strong)
                        const targetAccuracies = new Map<string, number>();
                        conceptIds.forEach((conceptId, idx) => {
                            // Create a mix: some below 60%, some above
                            if (idx % 3 === 0) {
                                // Weak concept: 20-59%
                                targetAccuracies.set(conceptId, 0.2 + Math.random() * 0.39);
                            } else if (idx % 3 === 1) {
                                // Borderline/strong: 60-80%
                                targetAccuracies.set(conceptId, 0.6 + Math.random() * 0.2);
                            } else {
                                // Strong: 80-100%
                                targetAccuracies.set(conceptId, 0.8 + Math.random() * 0.2);
                            }
                        });

                        // Generate answers to achieve target accuracies
                        const answerRows: SessionAnswerRow[] = [];
                        const conceptQuestions = new Map<string, Question[]>();

                        // Group questions by concept
                        for (const q of uniqueQuestions) {
                            if (!conceptQuestions.has(q.concept_id)) {
                                conceptQuestions.set(q.concept_id, []);
                            }
                            conceptQuestions.get(q.concept_id)!.push(q);
                        }

                        // Generate answers for each concept to match target accuracy
                        for (const [conceptId, conceptQs] of conceptQuestions.entries()) {
                            const targetAccuracy = targetAccuracies.get(conceptId)!;
                            const targetCorrect = Math.round(conceptQs.length * targetAccuracy);

                            conceptQs.forEach((q, idx) => {
                                const shouldBeCorrect = idx < targetCorrect;
                                const selectedAnswer = shouldBeCorrect
                                    ? q.correct_answer
                                    : (q.options.find(opt => opt.id !== q.correct_answer)?.id || q.correct_answer);

                                answerRows.push({
                                    id: `answer-${answerRows.length}`,
                                    session_id: sessionId,
                                    question_id: q.id,
                                    selected_answer: selectedAnswer,
                                    marked_for_review: false,
                                    answered_at: new Date(),
                                });

                                const stats = conceptStats.get(conceptId)!;
                                if (shouldBeCorrect) {
                                    stats.correct++;
                                }
                            });

                            // Calculate actual accuracy
                            const stats = conceptStats.get(conceptId)!;
                            stats.accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
                        }

                        const questionIds = uniqueQuestions.map(q => q.id);

                        const questionRows: QuestionRow[] = uniqueQuestions.map(q => ({
                            id: q.id,
                            content: q.content,
                            options: JSON.stringify(q.options),
                            correct_answer: q.correct_answer,
                            explanation: q.explanation,
                            concept_id: q.concept_id,
                            sub_concept: q.sub_concept || null,
                            difficulty: q.difficulty,
                            source: q.source,
                            year_appeared: q.year_appeared || null,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }));

                        const timeRows: QuestionTimeRow[] = uniqueQuestions.map((q, idx) => ({
                            id: `time-${idx}`,
                            session_id: sessionId,
                            question_id: q.id,
                            time_spent: 60,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }));

                        const conceptRows: ConceptRow[] = conceptIds.map((id, idx) => ({
                            id,
                            name: `Concept ${idx}`,
                            category: `Category ${idx}`,
                            description: `Description ${idx}`,
                            created_at: new Date(),
                        }));

                        // Setup mocks
                        mockPool.query.mockReset();
                        mockPool.query
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: sessionId,
                                    user_id: userId,
                                    test_id: testId,
                                    start_time: new Date(),
                                    end_time: new Date(),
                                    status: 'completed' as const,
                                    total_time_spent: 3600,
                                    created_at: new Date(),
                                } as TestSessionRow],
                                rowCount: 1,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: testId,
                                    question_ids: JSON.stringify(questionIds),
                                    total_questions: uniqueQuestions.length,
                                    duration: 10800,
                                    created_at: new Date(),
                                }],
                                rowCount: 1,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: questionRows,
                                rowCount: questionRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: answerRows,
                                rowCount: answerRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: timeRows,
                                rowCount: timeRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: conceptRows,
                                rowCount: conceptRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: conceptRows,
                                rowCount: conceptRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: [{ id: 'result-id' }],
                                rowCount: 1,
                            } as any);

                        const result = await service.calculateScore(sessionId);

                        // Property: All concepts with accuracy < 60% should be in weaknesses
                        const WEAK_THRESHOLD = 0.6;

                        // Identify expected weak concepts
                        const expectedWeakConcepts = new Set<string>();
                        for (const [conceptId, stats] of conceptStats.entries()) {
                            if (stats.accuracy < WEAK_THRESHOLD) {
                                const conceptName = conceptRows.find(c => c.id === conceptId)?.name;
                                if (conceptName) {
                                    expectedWeakConcepts.add(conceptName);
                                }
                            }
                        }

                        // Verify feedback contains weaknesses
                        expect(result.feedback).toBeDefined();
                        expect(result.feedback.weaknesses).toBeDefined();

                        // All weak concepts should be in the weaknesses array
                        const actualWeakConceptNames = new Set(
                            result.feedback.weaknesses.map(w => w.concept_name)
                        );

                        for (const expectedWeakConcept of expectedWeakConcepts) {
                            expect(actualWeakConceptNames.has(expectedWeakConcept)).toBe(true);
                        }

                        // All concepts in weaknesses should have accuracy < 60%
                        for (const weakness of result.feedback.weaknesses) {
                            expect(weakness.accuracy).toBeLessThan(WEAK_THRESHOLD);

                            // Verify the weakness has required fields
                            expect(weakness.concept_name).toBeDefined();
                            expect(weakness.concept_name.length).toBeGreaterThan(0);
                            expect(weakness.accuracy).toBeGreaterThanOrEqual(0);
                            expect(weakness.accuracy).toBeLessThanOrEqual(1);
                            expect(weakness.questions_attempted).toBeGreaterThan(0);
                        }

                        // Verify no concept with accuracy >= 60% is in weaknesses
                        for (const [conceptId, stats] of conceptStats.entries()) {
                            if (stats.accuracy >= WEAK_THRESHOLD) {
                                const conceptName = conceptRows.find(c => c.id === conceptId)?.name;
                                if (conceptName) {
                                    expect(actualWeakConceptNames.has(conceptName)).toBe(false);
                                }
                            }
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 30: Recommendation generation for weak concepts
    // **Validates: Requirements 7.5**
    // For any concept identified as weak, the feedback should include specific textbook chapter
    // recommendations for that concept.
    describe('Property 30: Recommendation generation for weak concepts', () => {
        let service: ResultsService;
        let mockPool: any;

        beforeEach(() => {
            // Create a mock pool
            mockPool = {
                query: jest.fn(),
                connect: jest.fn(),
                end: jest.fn(),
                on: jest.fn(),
            };

            // Create service instance and inject mock pool
            service = new ResultsService();
            (service as any).pool = mockPool;
        });

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for valid questions
        const validQuestionArb: fc.Arbitrary<Question> = fc
            .tuple(
                fc.uuid(), // id
                fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0), // content
                fc.array(validOptionArb, { minLength: 2, maxLength: 6 }), // options
                fc.constantFrom<Difficulty>('easy', 'medium', 'hard'), // difficulty
                fc.uuid(), // concept_id
                fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0), // source
                fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length > 0), // explanation
                fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }), // sub_concept
                fc.option(fc.integer({ min: 1990, max: new Date().getFullYear() }), { nil: undefined }) // year_appeared
            )
            .chain(([id, content, options, difficulty, concept_id, source, explanation, sub_concept, year_appeared]) => {
                return fc.constantFrom(...options.map(opt => opt.id)).map(correct_answer => ({
                    id,
                    content,
                    options,
                    correct_answer,
                    explanation,
                    concept_id,
                    sub_concept,
                    difficulty,
                    source,
                    year_appeared,
                    created_at: new Date(),
                    updated_at: new Date(),
                }));
            });

        it('should generate textbook recommendations for all weak concepts (accuracy < 60%)', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 10, maxLength: 40 }),
                    fc.uuid(),
                    fc.uuid(),
                    fc.uuid(),
                    async (questions, sessionId, userId, testId) => {
                        // Create 3-6 concepts with controlled accuracy levels
                        const numConcepts = Math.min(6, Math.max(3, Math.floor(questions.length / 5)));
                        const conceptIds = Array.from({ length: numConcepts }, (_, i) => `concept-${i}`);

                        // Assign questions to concepts
                        const uniqueQuestions = questions.map((q, idx) => ({
                            ...q,
                            id: `question-${idx}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                            concept_id: conceptIds[idx % conceptIds.length],
                        }));

                        // Track expected accuracy per concept and control it
                        const conceptStats = new Map<string, { total: number; correct: number; accuracy: number }>();

                        // Initialize concept stats
                        for (const conceptId of conceptIds) {
                            conceptStats.set(conceptId, { total: 0, correct: 0, accuracy: 0 });
                        }

                        // Count questions per concept first
                        for (const q of uniqueQuestions) {
                            const stats = conceptStats.get(q.concept_id)!;
                            stats.total++;
                        }

                        // Assign target accuracy for each concept (mix of weak and strong)
                        const targetAccuracies = new Map<string, number>();
                        conceptIds.forEach((conceptId, idx) => {
                            // Create a mix: some below 60%, some above
                            if (idx % 3 === 0) {
                                // Weak concept: 20-59%
                                targetAccuracies.set(conceptId, 0.2 + Math.random() * 0.39);
                            } else if (idx % 3 === 1) {
                                // Borderline/strong: 60-80%
                                targetAccuracies.set(conceptId, 0.6 + Math.random() * 0.2);
                            } else {
                                // Strong: 80-100%
                                targetAccuracies.set(conceptId, 0.8 + Math.random() * 0.2);
                            }
                        });

                        // Generate answers to achieve target accuracies
                        const answerRows: SessionAnswerRow[] = [];
                        const conceptQuestions = new Map<string, Question[]>();

                        // Group questions by concept
                        for (const q of uniqueQuestions) {
                            if (!conceptQuestions.has(q.concept_id)) {
                                conceptQuestions.set(q.concept_id, []);
                            }
                            conceptQuestions.get(q.concept_id)!.push(q);
                        }

                        // Generate answers for each concept to match target accuracy
                        for (const [conceptId, conceptQs] of conceptQuestions.entries()) {
                            const targetAccuracy = targetAccuracies.get(conceptId)!;
                            const targetCorrect = Math.round(conceptQs.length * targetAccuracy);

                            conceptQs.forEach((q, idx) => {
                                const shouldBeCorrect = idx < targetCorrect;
                                const selectedAnswer = shouldBeCorrect
                                    ? q.correct_answer
                                    : (q.options.find(opt => opt.id !== q.correct_answer)?.id || q.correct_answer);

                                answerRows.push({
                                    id: `answer-${answerRows.length}`,
                                    session_id: sessionId,
                                    question_id: q.id,
                                    selected_answer: selectedAnswer,
                                    marked_for_review: false,
                                    answered_at: new Date(),
                                });

                                const stats = conceptStats.get(conceptId)!;
                                if (shouldBeCorrect) {
                                    stats.correct++;
                                }
                            });

                            // Calculate actual accuracy
                            const stats = conceptStats.get(conceptId)!;
                            stats.accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
                        }

                        const questionIds = uniqueQuestions.map(q => q.id);

                        const questionRows: QuestionRow[] = uniqueQuestions.map(q => ({
                            id: q.id,
                            content: q.content,
                            options: JSON.stringify(q.options),
                            correct_answer: q.correct_answer,
                            explanation: q.explanation,
                            concept_id: q.concept_id,
                            sub_concept: q.sub_concept || null,
                            difficulty: q.difficulty,
                            source: q.source,
                            year_appeared: q.year_appeared || null,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }));

                        const timeRows: QuestionTimeRow[] = uniqueQuestions.map((q, idx) => ({
                            id: `time-${idx}`,
                            session_id: sessionId,
                            question_id: q.id,
                            time_spent: 60,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }));

                        const conceptRows: ConceptRow[] = conceptIds.map((id, idx) => ({
                            id,
                            name: `Concept ${idx}`,
                            category: `Category ${idx}`,
                            description: `Description ${idx}`,
                            created_at: new Date(),
                        }));

                        // Setup mocks
                        mockPool.query.mockReset();
                        mockPool.query
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: sessionId,
                                    user_id: userId,
                                    test_id: testId,
                                    start_time: new Date(),
                                    end_time: new Date(),
                                    status: 'completed' as const,
                                    total_time_spent: 3600,
                                    created_at: new Date(),
                                } as TestSessionRow],
                                rowCount: 1,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: testId,
                                    question_ids: JSON.stringify(questionIds),
                                    total_questions: uniqueQuestions.length,
                                    duration: 10800,
                                    created_at: new Date(),
                                }],
                                rowCount: 1,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: questionRows,
                                rowCount: questionRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: answerRows,
                                rowCount: answerRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: timeRows,
                                rowCount: timeRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: conceptRows,
                                rowCount: conceptRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: conceptRows,
                                rowCount: conceptRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: [{ id: 'result-id' }],
                                rowCount: 1,
                            } as any);

                        const result = await service.calculateScore(sessionId);

                        // Property: For every weak concept, there should be a recommendation with textbook chapters
                        const WEAK_THRESHOLD = 0.6;

                        // Identify expected weak concepts
                        const expectedWeakConcepts = new Set<string>();
                        for (const [conceptId, stats] of conceptStats.entries()) {
                            if (stats.accuracy < WEAK_THRESHOLD) {
                                const conceptName = conceptRows.find(c => c.id === conceptId)?.name;
                                if (conceptName) {
                                    expectedWeakConcepts.add(conceptName);
                                }
                            }
                        }

                        // Verify feedback contains recommendations
                        expect(result.feedback).toBeDefined();
                        expect(result.feedback.recommendations).toBeDefined();

                        // Create a map of recommendations by concept name
                        const recommendationsMap = new Map(
                            result.feedback.recommendations.map(r => [r.concept_name, r])
                        );

                        // Property: Every weak concept should have a recommendation
                        for (const weakConceptName of expectedWeakConcepts) {
                            const recommendation = recommendationsMap.get(weakConceptName);

                            // The weak concept should have a recommendation
                            expect(recommendation).toBeDefined();

                            if (recommendation) {
                                // The recommendation should have textbook chapters
                                expect(recommendation.textbook_chapters).toBeDefined();
                                expect(Array.isArray(recommendation.textbook_chapters)).toBe(true);
                                expect(recommendation.textbook_chapters.length).toBeGreaterThan(0);

                                // Each textbook chapter should be a non-empty string
                                for (const chapter of recommendation.textbook_chapters) {
                                    expect(typeof chapter).toBe('string');
                                    expect(chapter.length).toBeGreaterThan(0);
                                }

                                // The recommendation should have practice topics
                                expect(recommendation.practice_topics).toBeDefined();
                                expect(Array.isArray(recommendation.practice_topics)).toBe(true);
                                expect(recommendation.practice_topics.length).toBeGreaterThan(0);

                                // The recommendation should have a priority
                                expect(recommendation.priority).toBeDefined();
                                expect(['high', 'medium', 'low']).toContain(recommendation.priority);

                                // Verify priority is assigned correctly based on accuracy
                                const conceptId = conceptRows.find(c => c.name === weakConceptName)?.id;
                                if (conceptId) {
                                    const stats = conceptStats.get(conceptId);
                                    if (stats) {
                                        if (stats.accuracy < 0.3) {
                                            expect(recommendation.priority).toBe('high');
                                        } else if (stats.accuracy < 0.5) {
                                            expect(recommendation.priority).toBe('medium');
                                        } else {
                                            expect(recommendation.priority).toBe('low');
                                        }
                                    }
                                }
                            }
                        }

                        // Property: No strong concepts (>= 60% accuracy) should have recommendations
                        for (const recommendation of result.feedback.recommendations) {
                            const conceptId = conceptRows.find(c => c.name === recommendation.concept_name)?.id;
                            if (conceptId) {
                                const stats = conceptStats.get(conceptId);
                                if (stats) {
                                    expect(stats.accuracy).toBeLessThan(WEAK_THRESHOLD);
                                }
                            }
                        }

                        // Property: Recommendations should be sorted by priority (high first)
                        const priorities = result.feedback.recommendations.map(r => r.priority);
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        for (let i = 0; i < priorities.length - 1; i++) {
                            expect(priorityOrder[priorities[i]]).toBeLessThanOrEqual(priorityOrder[priorities[i + 1]]);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 31: Historical performance aggregation
    // **Validates: Requirements 7.6**
    // For any user with multiple completed test sessions, the historical performance view should
    // include data from all completed sessions ordered by date.
    describe('Property 31: Historical performance aggregation', () => {
        let service: ResultsService;
        let mockPool: any;

        beforeEach(() => {
            // Create a mock pool
            mockPool = {
                query: jest.fn(),
                connect: jest.fn(),
                end: jest.fn(),
                on: jest.fn(),
            };

            // Create service instance and inject mock pool
            service = new ResultsService();
            (service as any).pool = mockPool;
        });

        // Generator for valid test results
        const validTestResultArb: fc.Arbitrary<TestResultRow> = fc
            .tuple(
                fc.uuid(), // id
                fc.uuid(), // session_id
                fc.uuid(), // user_id
                fc.integer({ min: 10, max: 100 }), // total_questions
                fc.date({ min: new Date('2020-01-01'), max: new Date() }) // created_at
            )
            .chain(([id, session_id, user_id, total_questions, created_at]) => {
                // Generate correct_answers that doesn't exceed total_questions
                return fc.integer({ min: 0, max: total_questions }).map(correct_answers => {
                    const score = correct_answers;
                    const remaining = total_questions - correct_answers;

                    // Split remaining between incorrect and unanswered
                    const incorrect_answers = Math.floor(Math.random() * (remaining + 1));
                    const unanswered = remaining - incorrect_answers;

                    // Calculate valid percentage
                    const percentage = total_questions > 0 ? (correct_answers / total_questions) * 100 : 0;

                    return {
                        id,
                        session_id,
                        user_id,
                        score,
                        total_questions,
                        correct_answers,
                        incorrect_answers,
                        unanswered,
                        percentage,
                        concept_performance: JSON.stringify([]),
                        feedback: JSON.stringify({
                            overall_message: 'Test feedback',
                            strengths: [],
                            weaknesses: [],
                            recommendations: [],
                        }),
                        created_at,
                    };
                });
            });

        it('should return all completed test sessions for a user ordered by date (descending)', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.uuid(), // userId
                    fc.array(validTestResultArb, { minLength: 1, maxLength: 50 }), // test results
                    fc.integer({ min: 1, max: 5 }), // page
                    fc.integer({ min: 5, max: 20 }), // limit
                    async (userId, testResults, page, limit) => {
                        // Ensure all test results belong to the same user
                        const userTestResults = testResults.map(tr => ({
                            ...tr,
                            user_id: userId,
                            // Ensure dates are unique and spread out
                            created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                        }));

                        // Sort by created_at descending (most recent first) - this is what the service should return
                        const sortedResults = [...userTestResults].sort(
                            (a, b) => b.created_at.getTime() - a.created_at.getTime()
                        );

                        const total = userTestResults.length;
                        const validatedPage = Math.max(1, page);
                        const validatedLimit = Math.min(Math.max(1, limit), 100);
                        const offset = (validatedPage - 1) * validatedLimit;

                        // Get the expected page of results
                        const expectedResults = sortedResults.slice(offset, offset + validatedLimit);

                        // Setup mocks
                        mockPool.query.mockReset();

                        // Mock count query
                        mockPool.query
                            .mockResolvedValueOnce({
                                rows: [{ count: total.toString() }],
                                rowCount: 1,
                            } as any)
                            // Mock results query
                            .mockResolvedValueOnce({
                                rows: expectedResults,
                                rowCount: expectedResults.length,
                            } as any);

                        const result = await service.getHistoricalPerformance(userId, page, limit);

                        // Property: All returned results should be from completed sessions for this user
                        expect(result.results).toBeDefined();
                        expect(Array.isArray(result.results)).toBe(true);

                        for (const testResult of result.results) {
                            expect(testResult.user_id).toBe(userId);
                        }

                        // Property: Results should be ordered by date (descending - most recent first)
                        for (let i = 0; i < result.results.length - 1; i++) {
                            const currentDate = new Date(result.results[i].created_at).getTime();
                            const nextDate = new Date(result.results[i + 1].created_at).getTime();
                            expect(currentDate).toBeGreaterThanOrEqual(nextDate);
                        }

                        // Property: Total count should match the number of test results for the user
                        expect(result.total).toBe(total);

                        // Property: Page number should be validated (minimum 1)
                        expect(result.page).toBeGreaterThanOrEqual(1);
                        expect(result.page).toBe(validatedPage);

                        // Property: Total pages should be calculated correctly
                        const expectedTotalPages = Math.ceil(total / validatedLimit);
                        expect(result.totalPages).toBe(expectedTotalPages);

                        // Property: Number of results should not exceed the limit
                        expect(result.results.length).toBeLessThanOrEqual(validatedLimit);

                        // Property: If there are results, they should match the expected page
                        if (offset < total) {
                            expect(result.results.length).toBe(Math.min(validatedLimit, total - offset));
                        } else {
                            // If offset is beyond total, should return empty array
                            expect(result.results.length).toBe(0);
                        }

                        // Property: Each result should have all required fields
                        for (const testResult of result.results) {
                            expect(testResult.id).toBeDefined();
                            expect(testResult.session_id).toBeDefined();
                            expect(testResult.user_id).toBe(userId);
                            expect(testResult.score).toBeGreaterThanOrEqual(0);
                            expect(testResult.total_questions).toBeGreaterThan(0);
                            expect(testResult.correct_answers).toBeGreaterThanOrEqual(0);
                            expect(testResult.incorrect_answers).toBeGreaterThanOrEqual(0);
                            expect(testResult.unanswered).toBeGreaterThanOrEqual(0);
                            expect(testResult.percentage).toBeGreaterThanOrEqual(0);
                            expect(testResult.percentage).toBeLessThanOrEqual(100);
                            expect(testResult.concept_performance).toBeDefined();
                            expect(testResult.feedback).toBeDefined();
                            expect(testResult.created_at).toBeDefined();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should handle pagination correctly with various page and limit values', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.uuid(), // userId
                    fc.integer({ min: 15, max: 100 }), // total number of results
                    fc.integer({ min: 1, max: 10 }), // page
                    fc.integer({ min: 5, max: 25 }), // limit
                    async (userId, totalResults, page, limit) => {
                        // Generate test results
                        const testResults: TestResultRow[] = Array.from({ length: totalResults }, (_, i) => ({
                            id: `result-${i}`,
                            session_id: `session-${i}`,
                            user_id: userId,
                            score: Math.floor(Math.random() * 100),
                            total_questions: 50,
                            correct_answers: Math.floor(Math.random() * 50),
                            incorrect_answers: Math.floor(Math.random() * 50),
                            unanswered: Math.floor(Math.random() * 10),
                            percentage: Math.random() * 100,
                            concept_performance: JSON.stringify([]),
                            feedback: JSON.stringify({
                                overall_message: 'Test feedback',
                                strengths: [],
                                weaknesses: [],
                                recommendations: [],
                            }),
                            created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Each day older
                        }));

                        const validatedPage = Math.max(1, page);
                        const validatedLimit = Math.min(Math.max(1, limit), 100);
                        const offset = (validatedPage - 1) * validatedLimit;

                        // Get expected results for this page
                        const expectedResults = testResults.slice(offset, offset + validatedLimit);

                        // Setup mocks
                        mockPool.query.mockReset();

                        // Mock count query
                        mockPool.query
                            .mockResolvedValueOnce({
                                rows: [{ count: totalResults.toString() }],
                                rowCount: 1,
                            } as any)
                            // Mock results query
                            .mockResolvedValueOnce({
                                rows: expectedResults,
                                rowCount: expectedResults.length,
                            } as any);

                        const result = await service.getHistoricalPerformance(userId, page, limit);

                        // Property: Pagination should work correctly
                        const expectedTotalPages = Math.ceil(totalResults / validatedLimit);
                        expect(result.totalPages).toBe(expectedTotalPages);
                        expect(result.page).toBe(validatedPage);
                        expect(result.total).toBe(totalResults);

                        // Property: Results count should match expected for the page
                        if (offset < totalResults) {
                            const expectedCount = Math.min(validatedLimit, totalResults - offset);
                            expect(result.results.length).toBe(expectedCount);
                        } else {
                            expect(result.results.length).toBe(0);
                        }

                        // Property: Limit should be capped at 100
                        if (limit > 100) {
                            expect(result.results.length).toBeLessThanOrEqual(100);
                        }

                        // Property: Page should be at least 1
                        if (page < 1) {
                            expect(result.page).toBe(1);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should return empty results for users with no test history', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.uuid(), // userId with no results
                    fc.integer({ min: 1, max: 5 }), // page
                    fc.integer({ min: 5, max: 20 }), // limit
                    async (userId, page, limit) => {
                        // Setup mocks for user with no results
                        mockPool.query.mockReset();

                        // Mock count query - 0 results
                        mockPool.query
                            .mockResolvedValueOnce({
                                rows: [{ count: '0' }],
                                rowCount: 1,
                            } as any)
                            // Mock results query - empty array
                            .mockResolvedValueOnce({
                                rows: [],
                                rowCount: 0,
                            } as any);

                        const result = await service.getHistoricalPerformance(userId, page, limit);

                        // Property: Should return empty results array
                        expect(result.results).toBeDefined();
                        expect(Array.isArray(result.results)).toBe(true);
                        expect(result.results.length).toBe(0);

                        // Property: Total should be 0
                        expect(result.total).toBe(0);

                        // Property: Total pages should be 0
                        expect(result.totalPages).toBe(0);

                        // Property: Page should still be validated
                        expect(result.page).toBeGreaterThanOrEqual(1);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 22: Time display in results
    // **Validates: Requirements 5.5**
    // For any test result viewed by a user, each question should display the time spent on that question alongside the answer information.
    describe('Property 22: Time display in results', () => {
        let service: ResultsService;
        let mockPool: any;

        beforeEach(() => {
            // Create a mock pool
            mockPool = {
                query: jest.fn(),
                connect: jest.fn(),
                end: jest.fn(),
                on: jest.fn(),
            };

            // Create service instance and inject mock pool
            service = new ResultsService();
            (service as any).pool = mockPool;
        });

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for valid questions
        const validQuestionArb: fc.Arbitrary<Question> = fc
            .tuple(
                fc.uuid(), // id
                fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0), // content
                fc.array(validOptionArb, { minLength: 2, maxLength: 6 }), // options
                fc.constantFrom<Difficulty>('easy', 'medium', 'hard'), // difficulty
                fc.uuid(), // concept_id
                fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0), // source
                fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length > 0), // explanation
                fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }), // sub_concept
                fc.option(fc.integer({ min: 1990, max: new Date().getFullYear() }), { nil: undefined }) // year_appeared
            )
            .chain(([id, content, options, difficulty, concept_id, source, explanation, sub_concept, year_appeared]) => {
                return fc.constantFrom(...options.map(opt => opt.id)).map(correct_answer => ({
                    id,
                    content,
                    options,
                    correct_answer,
                    explanation,
                    concept_id,
                    sub_concept,
                    difficulty,
                    source,
                    year_appeared,
                    created_at: new Date(),
                    updated_at: new Date(),
                }));
            });

        it('should display time spent for every question in detailed analysis results', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 3, maxLength: 20 }),
                    fc.uuid(),
                    fc.uuid(),
                    fc.uuid(),
                    async (questions, sessionId, userId, testId) => {
                        // Ensure unique question IDs
                        const uniqueQuestions = questions.map((q, idx) => ({
                            ...q,
                            id: `question-${idx}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                            concept_id: `concept-${idx % 3}`,
                        }));

                        // Generate random time spent for each question (0 to 600 seconds)
                        const questionTimesMap = new Map<string, number>();
                        const timeRows: QuestionTimeRow[] = uniqueQuestions.map((q, idx) => {
                            const timeSpent = Math.floor(Math.random() * 600); // 0-600 seconds
                            questionTimesMap.set(q.id, timeSpent);
                            return {
                                id: `time-${idx}`,
                                session_id: sessionId,
                                question_id: q.id,
                                time_spent: timeSpent,
                                created_at: new Date(),
                                updated_at: new Date(),
                            };
                        });

                        // Generate random answers for each question
                        const answerRows: SessionAnswerRow[] = uniqueQuestions.map((q, idx) => {
                            const rand = Math.random();
                            let selectedAnswer: string;

                            if (rand < 0.5) {
                                // Correct answer
                                selectedAnswer = q.correct_answer;
                            } else {
                                // Incorrect answer (pick a wrong option)
                                const wrongOption = q.options.find(opt => opt.id !== q.correct_answer);
                                selectedAnswer = wrongOption ? wrongOption.id : q.correct_answer;
                            }

                            return {
                                id: `answer-${idx}`,
                                session_id: sessionId,
                                question_id: q.id,
                                selected_answer: selectedAnswer,
                                marked_for_review: Math.random() < 0.3,
                                answered_at: new Date(),
                            };
                        });

                        const questionIds = uniqueQuestions.map(q => q.id);

                        const questionRows: QuestionRow[] = uniqueQuestions.map(q => ({
                            id: q.id,
                            content: q.content,
                            options: JSON.stringify(q.options),
                            correct_answer: q.correct_answer,
                            explanation: q.explanation,
                            concept_id: q.concept_id,
                            sub_concept: q.sub_concept || null,
                            difficulty: q.difficulty,
                            source: q.source,
                            year_appeared: q.year_appeared || null,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }));

                        // Setup mocks for getDetailedAnalysis
                        mockPool.query.mockReset();

                        // Mock for getResultBySessionId
                        mockPool.query
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: 'result-id',
                                    session_id: sessionId,
                                    user_id: userId,
                                    score: 10,
                                    total_questions: uniqueQuestions.length,
                                    correct_answers: 10,
                                    incorrect_answers: 5,
                                    unanswered: 0,
                                    percentage: 66.67,
                                    concept_performance: JSON.stringify([]),
                                    feedback: JSON.stringify({
                                        overall_message: 'Good job',
                                        strengths: [],
                                        weaknesses: [],
                                        recommendations: [],
                                    }),
                                    created_at: new Date(),
                                }],
                                rowCount: 1,
                            } as any)
                            // Mock for session query
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: sessionId,
                                    user_id: userId,
                                    test_id: testId,
                                    start_time: new Date(),
                                    end_time: new Date(),
                                    status: 'completed' as const,
                                    total_time_spent: 3600,
                                    created_at: new Date(),
                                } as TestSessionRow],
                                rowCount: 1,
                            } as any)
                            // Mock for test query
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: testId,
                                    question_ids: JSON.stringify(questionIds),
                                    total_questions: uniqueQuestions.length,
                                    duration: 10800,
                                    created_at: new Date(),
                                }],
                                rowCount: 1,
                            } as any)
                            // Mock for questions query
                            .mockResolvedValueOnce({
                                rows: questionRows,
                                rowCount: questionRows.length,
                            } as any)
                            // Mock for answers query
                            .mockResolvedValueOnce({
                                rows: answerRows,
                                rowCount: answerRows.length,
                            } as any)
                            // Mock for times query
                            .mockResolvedValueOnce({
                                rows: timeRows,
                                rowCount: timeRows.length,
                            } as any);

                        const detailedAnalysis = await service.getDetailedAnalysis(sessionId);

                        // Property: Every question should have time_spent displayed alongside answer information
                        expect(detailedAnalysis.questions).toHaveLength(uniqueQuestions.length);

                        for (let i = 0; i < uniqueQuestions.length; i++) {
                            const questionBreakdown = detailedAnalysis.questions[i];
                            const originalQuestion = uniqueQuestions[i];
                            const expectedTimeSpent = questionTimesMap.get(originalQuestion.id);

                            // Each question should have time_spent defined
                            expect(questionBreakdown.time_spent).toBeDefined();
                            expect(typeof questionBreakdown.time_spent).toBe('number');

                            // The time_spent should match the recorded time for that question
                            expect(questionBreakdown.time_spent).toBe(expectedTimeSpent);

                            // Time should be non-negative
                            expect(questionBreakdown.time_spent).toBeGreaterThanOrEqual(0);

                            // Verify that time_spent is displayed alongside answer information
                            // (i.e., in the same object as user_answer, correct_answer, etc.)
                            expect(questionBreakdown).toHaveProperty('user_answer');
                            expect(questionBreakdown).toHaveProperty('correct_answer');
                            expect(questionBreakdown).toHaveProperty('time_spent');
                            expect(questionBreakdown).toHaveProperty('explanation');
                            expect(questionBreakdown).toHaveProperty('is_correct');
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should handle questions with zero time spent correctly', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 3, maxLength: 10 }),
                    fc.uuid(),
                    fc.uuid(),
                    fc.uuid(),
                    async (questions, sessionId, userId, testId) => {
                        // Ensure unique question IDs
                        const uniqueQuestions = questions.map((q, idx) => ({
                            ...q,
                            id: `question-${idx}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                            concept_id: `concept-${idx % 3}`,
                        }));

                        // Some questions have zero time (e.g., never viewed or skipped immediately)
                        const timeRows: QuestionTimeRow[] = uniqueQuestions.map((q, idx) => {
                            const timeSpent = idx % 2 === 0 ? 0 : Math.floor(Math.random() * 300) + 30;
                            return {
                                id: `time-${idx}`,
                                session_id: sessionId,
                                question_id: q.id,
                                time_spent: timeSpent,
                                created_at: new Date(),
                                updated_at: new Date(),
                            };
                        });

                        const answerRows: SessionAnswerRow[] = uniqueQuestions.map((q, idx) => ({
                            id: `answer-${idx}`,
                            session_id: sessionId,
                            question_id: q.id,
                            selected_answer: q.correct_answer,
                            marked_for_review: false,
                            answered_at: new Date(),
                        }));

                        const questionIds = uniqueQuestions.map(q => q.id);

                        const questionRows: QuestionRow[] = uniqueQuestions.map(q => ({
                            id: q.id,
                            content: q.content,
                            options: JSON.stringify(q.options),
                            correct_answer: q.correct_answer,
                            explanation: q.explanation,
                            concept_id: q.concept_id,
                            sub_concept: q.sub_concept || null,
                            difficulty: q.difficulty,
                            source: q.source,
                            year_appeared: q.year_appeared || null,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }));

                        // Setup mocks
                        mockPool.query.mockReset();

                        mockPool.query
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: 'result-id',
                                    session_id: sessionId,
                                    user_id: userId,
                                    score: 10,
                                    total_questions: uniqueQuestions.length,
                                    correct_answers: 10,
                                    incorrect_answers: 0,
                                    unanswered: 0,
                                    percentage: 100,
                                    concept_performance: JSON.stringify([]),
                                    feedback: JSON.stringify({
                                        overall_message: 'Perfect!',
                                        strengths: [],
                                        weaknesses: [],
                                        recommendations: [],
                                    }),
                                    created_at: new Date(),
                                }],
                                rowCount: 1,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: sessionId,
                                    user_id: userId,
                                    test_id: testId,
                                    start_time: new Date(),
                                    end_time: new Date(),
                                    status: 'completed' as const,
                                    total_time_spent: 3600,
                                    created_at: new Date(),
                                } as TestSessionRow],
                                rowCount: 1,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: testId,
                                    question_ids: JSON.stringify(questionIds),
                                    total_questions: uniqueQuestions.length,
                                    duration: 10800,
                                    created_at: new Date(),
                                }],
                                rowCount: 1,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: questionRows,
                                rowCount: questionRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: answerRows,
                                rowCount: answerRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: timeRows,
                                rowCount: timeRows.length,
                            } as any);

                        const detailedAnalysis = await service.getDetailedAnalysis(sessionId);

                        // Property: Questions with zero time should still display time_spent as 0
                        for (let i = 0; i < uniqueQuestions.length; i++) {
                            const questionBreakdown = detailedAnalysis.questions[i];
                            const expectedTimeSpent = timeRows[i].time_spent;

                            expect(questionBreakdown.time_spent).toBe(expectedTimeSpent);

                            // Zero time is valid and should be displayed
                            if (i % 2 === 0) {
                                expect(questionBreakdown.time_spent).toBe(0);
                            }
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should handle missing time data gracefully by displaying 0', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 3, maxLength: 10 }),
                    fc.uuid(),
                    fc.uuid(),
                    fc.uuid(),
                    async (questions, sessionId, userId, testId) => {
                        // Ensure unique question IDs
                        const uniqueQuestions = questions.map((q, idx) => ({
                            ...q,
                            id: `question-${idx}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                            concept_id: `concept-${idx % 3}`,
                        }));

                        // Only some questions have time data (simulating missing data)
                        const timeRows: QuestionTimeRow[] = uniqueQuestions
                            .filter((_, idx) => idx % 2 === 0) // Only even indices have time data
                            .map((q, idx) => ({
                                id: `time-${idx}`,
                                session_id: sessionId,
                                question_id: q.id,
                                time_spent: Math.floor(Math.random() * 300) + 30,
                                created_at: new Date(),
                                updated_at: new Date(),
                            }));

                        const answerRows: SessionAnswerRow[] = uniqueQuestions.map((q, idx) => ({
                            id: `answer-${idx}`,
                            session_id: sessionId,
                            question_id: q.id,
                            selected_answer: q.correct_answer,
                            marked_for_review: false,
                            answered_at: new Date(),
                        }));

                        const questionIds = uniqueQuestions.map(q => q.id);

                        const questionRows: QuestionRow[] = uniqueQuestions.map(q => ({
                            id: q.id,
                            content: q.content,
                            options: JSON.stringify(q.options),
                            correct_answer: q.correct_answer,
                            explanation: q.explanation,
                            concept_id: q.concept_id,
                            sub_concept: q.sub_concept || null,
                            difficulty: q.difficulty,
                            source: q.source,
                            year_appeared: q.year_appeared || null,
                            created_at: new Date(),
                            updated_at: new Date(),
                        }));

                        // Setup mocks
                        mockPool.query.mockReset();

                        mockPool.query
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: 'result-id',
                                    session_id: sessionId,
                                    user_id: userId,
                                    score: 10,
                                    total_questions: uniqueQuestions.length,
                                    correct_answers: 10,
                                    incorrect_answers: 0,
                                    unanswered: 0,
                                    percentage: 100,
                                    concept_performance: JSON.stringify([]),
                                    feedback: JSON.stringify({
                                        overall_message: 'Perfect!',
                                        strengths: [],
                                        weaknesses: [],
                                        recommendations: [],
                                    }),
                                    created_at: new Date(),
                                }],
                                rowCount: 1,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: sessionId,
                                    user_id: userId,
                                    test_id: testId,
                                    start_time: new Date(),
                                    end_time: new Date(),
                                    status: 'completed' as const,
                                    total_time_spent: 3600,
                                    created_at: new Date(),
                                } as TestSessionRow],
                                rowCount: 1,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: [{
                                    id: testId,
                                    question_ids: JSON.stringify(questionIds),
                                    total_questions: uniqueQuestions.length,
                                    duration: 10800,
                                    created_at: new Date(),
                                }],
                                rowCount: 1,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: questionRows,
                                rowCount: questionRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: answerRows,
                                rowCount: answerRows.length,
                            } as any)
                            .mockResolvedValueOnce({
                                rows: timeRows,
                                rowCount: timeRows.length,
                            } as any);

                        const detailedAnalysis = await service.getDetailedAnalysis(sessionId);

                        // Property: Questions without time data should display 0 as time_spent
                        for (let i = 0; i < uniqueQuestions.length; i++) {
                            const questionBreakdown = detailedAnalysis.questions[i];

                            // time_spent should always be defined
                            expect(questionBreakdown.time_spent).toBeDefined();
                            expect(typeof questionBreakdown.time_spent).toBe('number');

                            // Questions without time data should show 0
                            if (i % 2 !== 0) {
                                // Odd indices don't have time data
                                expect(questionBreakdown.time_spent).toBe(0);
                            }
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
