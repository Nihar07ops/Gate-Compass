import * as fc from 'fast-check';
import { TestGenerationService } from './testGenerationService';
import { Question, QuestionOption, Difficulty } from '../types/models';

// Feature: gate-compass, Property 10: Test generation from question bank
// **Validates: Requirements 3.1**
// For any generated mock test, all questions in the test should exist in the question bank
// and have valid concept associations.

describe('Test Generation Service - Property-Based Tests', () => {
    describe('Property 10: Test generation from question bank', () => {
        let service: TestGenerationService;

        beforeEach(() => {
            service = new TestGenerationService();
        });

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for valid questions with all required fields
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

        // Helper to ensure unique IDs in question arrays (fixes UUID generator collision issue)
        const ensureUniqueIds = (questions: Question[]): Question[] => {
            return questions.map((q, idx) => ({
                ...q,
                id: `question-${Date.now()}-${Math.random().toString(36).substring(7)}-${idx}`,
            }));
        };

        it('should generate tests where all questions exist in the question bank', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 10, maxLength: 100 }), // Question bank
                    fc.integer({ min: 5, max: 20 }), // Number of questions to select
                    async (questionBank, questionCount) => {
                        // Skip if we don't have enough questions
                        if (questionBank.length < questionCount) {
                            return;
                        }

                        // Ensure unique IDs
                        const uniqueBank = ensureUniqueIds(questionBank);

                        // Mock the database query to return our question bank
                        const getQuestionsByConceptSpy = jest.spyOn(service as any, 'getQuestionsByConcept');
                        getQuestionsByConceptSpy.mockImplementation(async (...args: any[]) => {
                            const count = args[1] as number;
                            // Return random questions from the bank
                            const shuffled = [...uniqueBank].sort(() => Math.random() - 0.5);
                            return shuffled.slice(0, Math.min(count, uniqueBank.length));
                        });

                        // Mock trend service to return concept rankings
                        const trendService = (service as any).trendService;
                        const getRankingSpy = jest.spyOn(trendService, 'getConceptRanking');

                        // Get unique concept IDs from question bank
                        const conceptIds = [...new Set(uniqueBank.map(q => q.concept_id))];
                        const rankings = conceptIds.map((concept_id, index) => ({
                            concept_id,
                            importance: 1.0 / (index + 1), // Decreasing importance
                        }));

                        getRankingSpy.mockResolvedValue(rankings);

                        try {
                            // Generate test
                            const selectedQuestions = await service.selectQuestionsByTrend(questionCount);

                            // Property: All selected questions should exist in the question bank
                            const questionBankIds = new Set(uniqueBank.map(q => q.id));
                            selectedQuestions.forEach(question => {
                                expect(questionBankIds.has(question.id)).toBe(true);
                            });

                            // Property: Should have the requested number of questions
                            expect(selectedQuestions.length).toBe(questionCount);

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should generate tests where all questions have valid concept associations', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 10, maxLength: 100 }),
                    fc.integer({ min: 5, max: 20 }),
                    async (questionBank, questionCount) => {
                        if (questionBank.length < questionCount) {
                            return;
                        }

                        const uniqueBank = ensureUniqueIds(questionBank);

                        // Mock database operations
                        const getQuestionsByConceptSpy = jest.spyOn(service as any, 'getQuestionsByConcept');
                        getQuestionsByConceptSpy.mockImplementation(async (...args: any[]) => {
                            const count = args[1] as number;
                            const shuffled = [...uniqueBank].sort(() => Math.random() - 0.5);
                            return shuffled.slice(0, Math.min(count, uniqueBank.length));
                        });

                        const trendService = (service as any).trendService;
                        const getRankingSpy = jest.spyOn(trendService, 'getConceptRanking');

                        const conceptIds = [...new Set(uniqueBank.map(q => q.concept_id))];
                        const rankings = conceptIds.map((concept_id, index) => ({
                            concept_id,
                            importance: 1.0 / (index + 1),
                        }));

                        getRankingSpy.mockResolvedValue(rankings);

                        try {
                            const selectedQuestions = await service.selectQuestionsByTrend(questionCount);

                            // Property: All questions must have a valid concept_id
                            selectedQuestions.forEach(question => {
                                expect(question.concept_id).toBeDefined();
                                expect(typeof question.concept_id).toBe('string');
                                expect(question.concept_id.trim().length).toBeGreaterThan(0);
                            });

                            // Property: All concept_ids should exist in the question bank
                            const validConceptIds = new Set(uniqueBank.map(q => q.concept_id));
                            selectedQuestions.forEach(question => {
                                expect(validConceptIds.has(question.concept_id)).toBe(true);
                            });

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should generate tests where all questions have valid textbook sources', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 10, maxLength: 100 }),
                    fc.integer({ min: 5, max: 20 }),
                    async (questionBank, questionCount) => {
                        if (questionBank.length < questionCount) {
                            return;
                        }

                        const uniqueBank = ensureUniqueIds(questionBank);

                        // Mock database operations
                        const getQuestionsByConceptSpy = jest.spyOn(service as any, 'getQuestionsByConcept');
                        getQuestionsByConceptSpy.mockImplementation(async (...args: any[]) => {
                            const count = args[1] as number;
                            const shuffled = [...uniqueBank].sort(() => Math.random() - 0.5);
                            return shuffled.slice(0, Math.min(count, uniqueBank.length));
                        });

                        const trendService = (service as any).trendService;
                        const getRankingSpy = jest.spyOn(trendService, 'getConceptRanking');

                        const conceptIds = [...new Set(uniqueBank.map(q => q.concept_id))];
                        const rankings = conceptIds.map((concept_id, index) => ({
                            concept_id,
                            importance: 1.0 / (index + 1),
                        }));

                        getRankingSpy.mockResolvedValue(rankings);

                        try {
                            const selectedQuestions = await service.selectQuestionsByTrend(questionCount);

                            // Property: All questions must have a valid source (textbook reference)
                            selectedQuestions.forEach(question => {
                                expect(question.source).toBeDefined();
                                expect(typeof question.source).toBe('string');
                                expect(question.source.trim().length).toBeGreaterThan(0);
                            });

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should reject test generation when questions lack valid sources', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 10, maxLength: 50 }),
                    fc.integer({ min: 5, max: 20 }),
                    fc.integer({ min: 0, max: 49 }), // Index of question to corrupt
                    async (questionBank, questionCount, corruptIndex) => {
                        if (questionBank.length < questionCount || corruptIndex >= questionBank.length) {
                            return;
                        }

                        // Create a corrupted question bank with one question missing source
                        const corruptedBank = ensureUniqueIds(questionBank).map((q, idx) => {
                            if (idx === corruptIndex) {
                                return { ...q, source: '' }; // Empty source
                            }
                            return q;
                        });

                        // Mock database operations
                        const getQuestionsByConceptSpy = jest.spyOn(service as any, 'getQuestionsByConcept');
                        getQuestionsByConceptSpy.mockImplementation(async (...args: any[]) => {
                            const count = args[1] as number;
                            // Ensure the corrupted question is included
                            const result = [corruptedBank[corruptIndex]];
                            const remaining = corruptedBank.filter((_, idx) => idx !== corruptIndex);
                            const shuffled = remaining.sort(() => Math.random() - 0.5);
                            result.push(...shuffled.slice(0, count - 1));
                            return result.slice(0, count);
                        });

                        const trendService = (service as any).trendService;
                        const getRankingSpy = jest.spyOn(trendService, 'getConceptRanking');

                        const conceptIds = [...new Set(corruptedBank.map(q => q.concept_id))];
                        const rankings = conceptIds.map((concept_id, index) => ({
                            concept_id,
                            importance: 1.0 / (index + 1),
                        }));

                        getRankingSpy.mockResolvedValue(rankings);

                        try {
                            // Property: Should throw error when questions lack valid sources
                            await expect(
                                service.selectQuestionsByTrend(questionCount).then(questions => {
                                    // This will trigger the source validation
                                    service['ensureValidSources'](questions);
                                })
                            ).rejects.toThrow('without valid textbook sources');

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should generate tests with questions that have all required fields', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 10, maxLength: 100 }),
                    fc.integer({ min: 5, max: 20 }),
                    async (questionBank, questionCount) => {
                        if (questionBank.length < questionCount) {
                            return;
                        }

                        const uniqueBank = ensureUniqueIds(questionBank);

                        // Mock database operations
                        const getQuestionsByConceptSpy = jest.spyOn(service as any, 'getQuestionsByConcept');
                        getQuestionsByConceptSpy.mockImplementation(async (...args: any[]) => {
                            const count = args[1] as number;
                            const shuffled = [...uniqueBank].sort(() => Math.random() - 0.5);
                            return shuffled.slice(0, Math.min(count, uniqueBank.length));
                        });

                        const trendService = (service as any).trendService;
                        const getRankingSpy = jest.spyOn(trendService, 'getConceptRanking');

                        const conceptIds = [...new Set(uniqueBank.map(q => q.concept_id))];
                        const rankings = conceptIds.map((concept_id, index) => ({
                            concept_id,
                            importance: 1.0 / (index + 1),
                        }));

                        getRankingSpy.mockResolvedValue(rankings);

                        try {
                            const selectedQuestions = await service.selectQuestionsByTrend(questionCount);

                            // Property: All questions must have required fields
                            selectedQuestions.forEach(question => {
                                // Required fields
                                expect(question.id).toBeDefined();
                                expect(question.content).toBeDefined();
                                expect(question.options).toBeDefined();
                                expect(Array.isArray(question.options)).toBe(true);
                                expect(question.options.length).toBeGreaterThanOrEqual(2);
                                expect(question.correct_answer).toBeDefined();
                                expect(question.explanation).toBeDefined();
                                expect(question.concept_id).toBeDefined();
                                expect(question.difficulty).toBeDefined();
                                expect(['easy', 'medium', 'hard']).toContain(question.difficulty);
                                expect(question.source).toBeDefined();

                                // Correct answer must be one of the option IDs
                                const optionIds = question.options.map(opt => opt.id);
                                expect(optionIds).toContain(question.correct_answer);
                            });

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        // Note: We don't test for duplicate prevention because the database enforces unique primary keys.
        // The actual implementation queries the database with ORDER BY RANDOM() which naturally
        // prevents duplicates due to the unique ID constraint. Testing this would require
        // simulating invalid database state, which isn't a meaningful test.
    });

    // Feature: gate-compass, Property 11: High-importance concept prioritization
    // **Validates: Requirements 3.2**
    // For any generated mock test, questions from concepts in the top 30% of importance rankings
    // should appear more frequently than questions from concepts in the bottom 30%.
    describe('Property 11: High-importance concept prioritization', () => {
        let service: TestGenerationService;

        beforeEach(() => {
            service = new TestGenerationService();
        });

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for questions with specific concept IDs
        const questionWithConceptArb = (conceptId: string): fc.Arbitrary<Question> => {
            return fc
                .tuple(
                    fc.uuid(), // id
                    fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0), // content
                    fc.array(validOptionArb, { minLength: 2, maxLength: 6 }), // options
                    fc.constantFrom<Difficulty>('easy', 'medium', 'hard'), // difficulty
                    fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0), // source
                    fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length > 0), // explanation
                    fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }), // sub_concept
                    fc.option(fc.integer({ min: 1990, max: new Date().getFullYear() }), { nil: undefined }) // year_appeared
                )
                .chain(([id, content, options, difficulty, source, explanation, sub_concept, year_appeared]) => {
                    return fc.constantFrom(...options.map(opt => opt.id)).map(correct_answer => ({
                        id,
                        content,
                        options,
                        correct_answer,
                        explanation,
                        concept_id: conceptId,
                        sub_concept,
                        difficulty,
                        source,
                        year_appeared,
                        created_at: new Date(),
                        updated_at: new Date(),
                    }));
                });
        };

        it('should prioritize high-importance concepts over low-importance concepts', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 10, max: 20 }), // Number of concepts
                    fc.integer({ min: 30, max: 100 }), // Number of questions to generate
                    fc.integer({ min: 15, max: 30 }), // Questions per concept in bank
                    async (numConcepts, questionCount, questionsPerConcept) => {
                        // Skip if we don't have enough total questions
                        const totalAvailable = numConcepts * questionsPerConcept;
                        if (totalAvailable < questionCount) {
                            return;
                        }
                        // Generate concept IDs
                        const conceptIds = Array.from({ length: numConcepts }, (_, i) => `concept-${i}`);

                        // Create importance rankings (decreasing importance)
                        const rankings = conceptIds.map((concept_id, index) => ({
                            concept_id,
                            importance: 1.0 / (index + 1), // Decreasing importance: 1.0, 0.5, 0.33, 0.25, ...
                        }));

                        // Identify top 30% and bottom 30% concepts
                        const top30PercentCount = Math.ceil(numConcepts * 0.3);
                        const bottom30PercentCount = Math.ceil(numConcepts * 0.3);

                        const topConcepts = new Set(conceptIds.slice(0, top30PercentCount));
                        const bottomConcepts = new Set(conceptIds.slice(-bottom30PercentCount));

                        // Generate question bank with questions for each concept
                        const questionBank: Question[] = [];
                        for (const conceptId of conceptIds) {
                            const conceptQuestions = await fc.sample(
                                questionWithConceptArb(conceptId),
                                questionsPerConcept
                            );
                            questionBank.push(...conceptQuestions);
                        }

                        // Ensure unique IDs
                        const uniqueBank = questionBank.map((q, idx) => ({
                            ...q,
                            id: `question-${Date.now()}-${Math.random().toString(36).substring(7)}-${idx}`,
                        }));

                        // Mock database operations
                        const getQuestionsByConceptSpy = jest.spyOn(service as any, 'getQuestionsByConcept');
                        getQuestionsByConceptSpy.mockImplementation(async (...args: any[]) => {
                            const conceptId = args[0] as string;
                            const count = args[1] as number;
                            const conceptQuestions = uniqueBank.filter(q => q.concept_id === conceptId);
                            const shuffled = [...conceptQuestions].sort(() => Math.random() - 0.5);
                            return shuffled.slice(0, Math.min(count, conceptQuestions.length));
                        });

                        const trendService = (service as any).trendService;
                        const getRankingSpy = jest.spyOn(trendService, 'getConceptRanking');
                        getRankingSpy.mockResolvedValue(rankings);

                        try {
                            // Generate test
                            const selectedQuestions = await service.selectQuestionsByTrend(questionCount);

                            // Count questions from top 30% and bottom 30% concepts
                            let topConceptCount = 0;
                            let bottomConceptCount = 0;

                            selectedQuestions.forEach(question => {
                                if (topConcepts.has(question.concept_id)) {
                                    topConceptCount++;
                                }
                                if (bottomConcepts.has(question.concept_id)) {
                                    bottomConceptCount++;
                                }
                            });

                            // Property: Questions from top 30% concepts should appear more frequently
                            // than questions from bottom 30% concepts
                            // "More frequently" means at least 10% more to account for rounding effects
                            const minimumDifference = Math.max(1, Math.floor(bottomConceptCount * 0.1));
                            expect(topConceptCount).toBeGreaterThanOrEqual(bottomConceptCount + minimumDifference);

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should distribute questions proportionally to concept importance', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 5, max: 10 }), // Number of concepts
                    fc.integer({ min: 30, max: 60 }), // Number of questions to generate
                    fc.integer({ min: 15, max: 30 }), // Questions per concept in bank
                    async (numConcepts, questionCount, questionsPerConcept) => {
                        // Skip if we don't have enough total questions
                        const totalAvailable = numConcepts * questionsPerConcept;
                        if (totalAvailable < questionCount) {
                            return;
                        }
                        // Generate concept IDs
                        const conceptIds = Array.from({ length: numConcepts }, (_, i) => `concept-${i}`);

                        // Create importance rankings with clear differences
                        const rankings = conceptIds.map((concept_id, index) => ({
                            concept_id,
                            importance: Math.max(0.1, 1.0 - (index * 0.15)), // Decreasing: 1.0, 0.85, 0.7, 0.55, ...
                        }));

                        // Generate question bank
                        const questionBank: Question[] = [];
                        for (const conceptId of conceptIds) {
                            const conceptQuestions = await fc.sample(
                                questionWithConceptArb(conceptId),
                                questionsPerConcept
                            );
                            questionBank.push(...conceptQuestions);
                        }

                        // Ensure unique IDs
                        const uniqueBank = questionBank.map((q, idx) => ({
                            ...q,
                            id: `question-${Date.now()}-${Math.random().toString(36).substring(7)}-${idx}`,
                        }));

                        // Mock database operations
                        const getQuestionsByConceptSpy = jest.spyOn(service as any, 'getQuestionsByConcept');
                        getQuestionsByConceptSpy.mockImplementation(async (...args: any[]) => {
                            const conceptId = args[0] as string;
                            const count = args[1] as number;
                            const conceptQuestions = uniqueBank.filter(q => q.concept_id === conceptId);
                            const shuffled = [...conceptQuestions].sort(() => Math.random() - 0.5);
                            return shuffled.slice(0, Math.min(count, conceptQuestions.length));
                        });

                        const trendService = (service as any).trendService;
                        const getRankingSpy = jest.spyOn(trendService, 'getConceptRanking');
                        getRankingSpy.mockResolvedValue(rankings);

                        try {
                            // Generate test
                            const selectedQuestions = await service.selectQuestionsByTrend(questionCount);

                            // Count questions per concept
                            const questionCounts: Record<string, number> = {};
                            selectedQuestions.forEach(question => {
                                questionCounts[question.concept_id] = (questionCounts[question.concept_id] || 0) + 1;
                            });

                            // Property: Concepts should be distributed proportionally to importance
                            // We verify this by checking that the total questions for high-importance concepts
                            // (top 30%) is significantly more than low-importance concepts (bottom 30%)
                            const top30PercentCount = Math.ceil(rankings.length * 0.3);
                            const bottom30PercentCount = Math.ceil(rankings.length * 0.3);

                            const topConcepts = new Set(rankings.slice(0, top30PercentCount).map(r => r.concept_id));
                            const bottomConcepts = new Set(rankings.slice(-bottom30PercentCount).map(r => r.concept_id));

                            let topTotal = 0;
                            let bottomTotal = 0;

                            selectedQuestions.forEach(question => {
                                if (topConcepts.has(question.concept_id)) {
                                    topTotal++;
                                }
                                if (bottomConcepts.has(question.concept_id)) {
                                    bottomTotal++;
                                }
                            });

                            // Top 30% should have at least 10% more questions than bottom 30%
                            const minimumDifference = Math.max(1, Math.floor(bottomTotal * 0.1));
                            expect(topTotal).toBeGreaterThanOrEqual(bottomTotal + minimumDifference);

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 12: Textbook source validity
    // **Validates: Requirements 3.3**
    // For any question in a generated mock test, the question should have a non-empty source field
    // referencing a standard textbook.
    describe('Property 12: Textbook source validity', () => {
        let service: TestGenerationService;

        beforeEach(() => {
            service = new TestGenerationService();
        });

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for valid questions with textbook sources
        const validQuestionArb: fc.Arbitrary<Question> = fc
            .tuple(
                fc.uuid(), // id
                fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0), // content
                fc.array(validOptionArb, { minLength: 2, maxLength: 6 }), // options
                fc.constantFrom<Difficulty>('easy', 'medium', 'hard'), // difficulty
                fc.uuid(), // concept_id
                fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0), // source (textbook reference)
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

        // Generator for questions with invalid (empty or whitespace) sources
        const invalidSourceQuestionArb: fc.Arbitrary<Question> = fc
            .tuple(
                fc.uuid(), // id
                fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0), // content
                fc.array(validOptionArb, { minLength: 2, maxLength: 6 }), // options
                fc.constantFrom<Difficulty>('easy', 'medium', 'hard'), // difficulty
                fc.uuid(), // concept_id
                fc.constantFrom('', '   ', '\t', '\n'), // invalid source (empty or whitespace)
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

        // Helper to ensure unique IDs
        const ensureUniqueIds = (questions: Question[]): Question[] => {
            return questions.map((q, idx) => ({
                ...q,
                id: `question-${Date.now()}-${Math.random().toString(36).substring(7)}-${idx}`,
            }));
        };

        it('should ensure all questions in generated test have non-empty textbook sources', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 10, maxLength: 100 }),
                    fc.integer({ min: 5, max: 20 }),
                    async (questionBank, questionCount) => {
                        if (questionBank.length < questionCount) {
                            return;
                        }

                        const uniqueBank = ensureUniqueIds(questionBank);

                        // Mock database operations
                        const getQuestionsByConceptSpy = jest.spyOn(service as any, 'getQuestionsByConcept');
                        getQuestionsByConceptSpy.mockImplementation(async (...args: any[]) => {
                            const count = args[1] as number;
                            const shuffled = [...uniqueBank].sort(() => Math.random() - 0.5);
                            return shuffled.slice(0, Math.min(count, uniqueBank.length));
                        });

                        const trendService = (service as any).trendService;
                        const getRankingSpy = jest.spyOn(trendService, 'getConceptRanking');

                        const conceptIds = [...new Set(uniqueBank.map(q => q.concept_id))];
                        const rankings = conceptIds.map((concept_id, index) => ({
                            concept_id,
                            importance: 1.0 / (index + 1),
                        }));

                        getRankingSpy.mockResolvedValue(rankings);

                        try {
                            const selectedQuestions = await service.selectQuestionsByTrend(questionCount);

                            // Property: All questions must have a non-empty source field
                            selectedQuestions.forEach(question => {
                                expect(question.source).toBeDefined();
                                expect(typeof question.source).toBe('string');
                                expect(question.source.trim().length).toBeGreaterThan(0);
                            });

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should reject test generation when questions have invalid sources', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionArb, { minLength: 10, maxLength: 50 }),
                    fc.array(invalidSourceQuestionArb, { minLength: 1, maxLength: 5 }),
                    fc.integer({ min: 5, max: 20 }),
                    async (validQuestions, invalidQuestions, questionCount) => {
                        // Combine valid and invalid questions
                        const mixedBank = [...validQuestions, ...invalidQuestions];

                        if (mixedBank.length < questionCount) {
                            return;
                        }

                        const uniqueBank = ensureUniqueIds(mixedBank);

                        // Mock database operations to ensure at least one invalid question is selected
                        const getQuestionsByConceptSpy = jest.spyOn(service as any, 'getQuestionsByConcept');
                        getQuestionsByConceptSpy.mockImplementation(async (...args: any[]) => {
                            const count = args[1] as number;
                            // Ensure at least one invalid question is included
                            const invalidOnes = uniqueBank.filter(q => !q.source || q.source.trim() === '');
                            if (invalidOnes.length === 0) return [];

                            const result = [invalidOnes[0]];
                            const remaining = uniqueBank.filter(q => q.id !== invalidOnes[0].id);
                            const shuffled = remaining.sort(() => Math.random() - 0.5);
                            result.push(...shuffled.slice(0, count - 1));
                            return result.slice(0, count);
                        });

                        const trendService = (service as any).trendService;
                        const getRankingSpy = jest.spyOn(trendService, 'getConceptRanking');

                        const conceptIds = [...new Set(uniqueBank.map(q => q.concept_id))];
                        const rankings = conceptIds.map((concept_id, index) => ({
                            concept_id,
                            importance: 1.0 / (index + 1),
                        }));

                        getRankingSpy.mockResolvedValue(rankings);

                        try {
                            // Property: Should throw error when questions lack valid sources
                            await expect(
                                service.generateMockTest('test-user-id', { questionCount })
                            ).rejects.toThrow('without valid textbook sources');

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should accept questions with various valid textbook source formats', async () => {
            // Generator for questions with various valid source formats
            const variousSourceFormatsArb = fc
                .tuple(
                    fc.uuid(), // id
                    fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0), // content
                    fc.array(validOptionArb, { minLength: 2, maxLength: 6 }), // options
                    fc.constantFrom<Difficulty>('easy', 'medium', 'hard'), // difficulty
                    fc.uuid(), // concept_id
                    fc.constantFrom(
                        'Cormen - Introduction to Algorithms, Chapter 15',
                        'Tanenbaum - Computer Networks, 5th Edition, Page 234',
                        'Silberschatz - Operating System Concepts, Section 6.3',
                        'GATE 2020 Question Paper',
                        'Navathe - Database Systems, Chapter 10.2'
                    ), // various valid source formats
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

            await fc.assert(
                fc.asyncProperty(
                    fc.array(variousSourceFormatsArb, { minLength: 10, maxLength: 50 }),
                    fc.integer({ min: 5, max: 15 }),
                    async (questionBank, questionCount) => {
                        if (questionBank.length < questionCount) {
                            return;
                        }

                        const uniqueBank = ensureUniqueIds(questionBank);

                        // Mock database operations
                        const getQuestionsByConceptSpy = jest.spyOn(service as any, 'getQuestionsByConcept');
                        getQuestionsByConceptSpy.mockImplementation(async (...args: any[]) => {
                            const count = args[1] as number;
                            const shuffled = [...uniqueBank].sort(() => Math.random() - 0.5);
                            return shuffled.slice(0, Math.min(count, uniqueBank.length));
                        });

                        const trendService = (service as any).trendService;
                        const getRankingSpy = jest.spyOn(trendService, 'getConceptRanking');

                        const conceptIds = [...new Set(uniqueBank.map(q => q.concept_id))];
                        const rankings = conceptIds.map((concept_id, index) => ({
                            concept_id,
                            importance: 1.0 / (index + 1),
                        }));

                        getRankingSpy.mockResolvedValue(rankings);

                        try {
                            // Select questions and validate sources
                            const selectedQuestions = await service.selectQuestionsByTrend(questionCount);

                            // Property: All questions should have valid sources in various formats
                            selectedQuestions.forEach(question => {
                                expect(question.source).toBeDefined();
                                expect(typeof question.source).toBe('string');
                                expect(question.source.trim().length).toBeGreaterThan(0);
                            });

                            // Property: ensureValidSources should not throw for valid sources
                            expect(() => {
                                service['ensureValidSources'](selectedQuestions);
                            }).not.toThrow();

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 13: Difficulty distribution conformance
    // **Validates: Requirements 3.4**
    // For any mock test generated with a specified difficulty distribution (e.g., 30% easy, 50% medium, 20% hard),
    // the actual distribution of questions should match the specification within a 10% tolerance.
    describe('Property 13: Difficulty distribution conformance', () => {
        // Increase timeout for these tests as they involve more complex operations
        jest.setTimeout(30000);

        let service: TestGenerationService;

        beforeEach(() => {
            service = new TestGenerationService();
        });

        // Helper function to setup mocks for difficulty distribution tests
        const setupMocks = (uniqueBank: Question[]) => {
            const getQuestionsByConceptSpy = jest.spyOn(service as any, 'getQuestionsByConcept');
            getQuestionsByConceptSpy.mockImplementation(async (...args: any[]) => {
                const count = args[1] as number;
                const shuffled = [...uniqueBank].sort(() => Math.random() - 0.5);
                return shuffled.slice(0, Math.min(count, uniqueBank.length));
            });

            const getQuestionsByConceptAndDifficultySpy = jest.spyOn(service as any, 'getQuestionsByConceptAndDifficulty');
            getQuestionsByConceptAndDifficultySpy.mockImplementation(async (...args: any[]) => {
                const conceptId = args[0] as string;
                const difficulty = args[1] as Difficulty;
                const count = args[2] as number;
                const excludeIds = args[3] as Set<string>;

                const filtered = uniqueBank.filter(q =>
                    q.concept_id === conceptId &&
                    q.difficulty === difficulty &&
                    !excludeIds.has(q.id)
                );
                const shuffled = [...filtered].sort(() => Math.random() - 0.5);
                return shuffled.slice(0, Math.min(count, filtered.length));
            });

            const trendService = (service as any).trendService;
            const getRankingSpy = jest.spyOn(trendService, 'getConceptRanking');

            const conceptIds = [...new Set(uniqueBank.map(q => q.concept_id))];
            const rankings = conceptIds.map((concept_id, index) => ({
                concept_id,
                importance: 1.0 / (index + 1),
            }));

            getRankingSpy.mockResolvedValue(rankings);

            return { getQuestionsByConceptSpy, getQuestionsByConceptAndDifficultySpy, getRankingSpy };
        };

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for questions with specific difficulty
        const questionWithDifficultyArb = (difficulty: Difficulty): fc.Arbitrary<Question> => {
            return fc
                .tuple(
                    fc.uuid(), // id
                    fc.string({ minLength: 10, maxLength: 500 }).filter(s => s.trim().length > 0), // content
                    fc.array(validOptionArb, { minLength: 2, maxLength: 6 }), // options
                    fc.uuid(), // concept_id
                    fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0), // source
                    fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length > 0), // explanation
                    fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }), // sub_concept
                    fc.option(fc.integer({ min: 1990, max: new Date().getFullYear() }), { nil: undefined }) // year_appeared
                )
                .chain(([id, content, options, concept_id, source, explanation, sub_concept, year_appeared]) => {
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
        };

        // Generator for difficulty distribution (must sum to 1.0)
        const difficultyDistributionArb: fc.Arbitrary<{ easy: number; medium: number; hard: number }> = fc
            .tuple(
                fc.integer({ min: 10, max: 50 }), // easy percentage (10-50%)
                fc.integer({ min: 30, max: 60 }), // medium percentage (30-60%)
                fc.integer({ min: 10, max: 40 })  // hard percentage (10-40%)
            )
            .map(([easy, medium, hard]) => {
                // Normalize to sum to 100
                const total = easy + medium + hard;
                return {
                    easy: easy / total,
                    medium: medium / total,
                    hard: hard / total,
                };
            });

        // Helper to ensure unique IDs
        const ensureUniqueIds = (questions: Question[]): Question[] => {
            return questions.map((q, idx) => ({
                ...q,
                id: `question-${Date.now()}-${Math.random().toString(36).substring(7)}-${idx}`,
            }));
        };

        it('should generate tests with difficulty distribution matching specification within 10% tolerance', async () => {
            await fc.assert(
                fc.asyncProperty(
                    difficultyDistributionArb,
                    fc.integer({ min: 30, max: 100 }), // Total questions to generate
                    async (distribution, totalQuestions) => {
                        // Calculate how many questions we need of each difficulty to meet the distribution
                        const targetCounts = {
                            easy: Math.ceil(totalQuestions * distribution.easy * 1.5), // 1.5x buffer
                            medium: Math.ceil(totalQuestions * distribution.medium * 1.5),
                            hard: Math.ceil(totalQuestions * distribution.hard * 1.5),
                        };

                        // Generate question bank with enough questions of each difficulty to meet any distribution
                        const easyQuestions = await fc.sample(
                            questionWithDifficultyArb('easy'),
                            targetCounts.easy
                        );
                        const mediumQuestions = await fc.sample(
                            questionWithDifficultyArb('medium'),
                            targetCounts.medium
                        );
                        const hardQuestions = await fc.sample(
                            questionWithDifficultyArb('hard'),
                            targetCounts.hard
                        );

                        const questionBank = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
                        const uniqueBank = ensureUniqueIds(questionBank);

                        // Setup mocks
                        const { getQuestionsByConceptSpy, getQuestionsByConceptAndDifficultySpy, getRankingSpy } = setupMocks(uniqueBank);

                        try {
                            // Generate test with specified difficulty distribution
                            const test = await service.generateMockTest('test-user-id', {
                                questionCount: totalQuestions,
                                difficultyDistribution: distribution,
                            });

                            // Get the questions from the test
                            const testQuestions = await Promise.all(
                                test.question_ids.map(async (id) => {
                                    return uniqueBank.find(q => q.id === id)!;
                                })
                            );

                            // Count actual difficulty distribution
                            const actualCounts = {
                                easy: testQuestions.filter(q => q.difficulty === 'easy').length,
                                medium: testQuestions.filter(q => q.difficulty === 'medium').length,
                                hard: testQuestions.filter(q => q.difficulty === 'hard').length,
                            };

                            const actualDistribution = {
                                easy: actualCounts.easy / totalQuestions,
                                medium: actualCounts.medium / totalQuestions,
                                hard: actualCounts.hard / totalQuestions,
                            };

                            // Property: Actual distribution should match specification within 10% tolerance
                            const tolerance = 0.1;
                            expect(Math.abs(actualDistribution.easy - distribution.easy)).toBeLessThanOrEqual(tolerance);
                            expect(Math.abs(actualDistribution.medium - distribution.medium)).toBeLessThanOrEqual(tolerance);
                            expect(Math.abs(actualDistribution.hard - distribution.hard)).toBeLessThanOrEqual(tolerance);

                            // Additional check: Total should still be 100%
                            const totalDistribution = actualDistribution.easy + actualDistribution.medium + actualDistribution.hard;
                            expect(Math.abs(totalDistribution - 1.0)).toBeLessThan(0.01);

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getQuestionsByConceptAndDifficultySpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should handle edge case where question bank has insufficient questions of a specific difficulty', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 30, max: 60 }), // Total questions to generate
                    async (totalQuestions) => {
                        // Create a question bank with imbalanced difficulties
                        // Many easy and medium, but very few hard questions
                        const easyQuestions = await fc.sample(
                            questionWithDifficultyArb('easy'),
                            30
                        );
                        const mediumQuestions = await fc.sample(
                            questionWithDifficultyArb('medium'),
                            30
                        );
                        const hardQuestions = await fc.sample(
                            questionWithDifficultyArb('hard'),
                            5 // Very few hard questions
                        );

                        const questionBank = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
                        const uniqueBank = ensureUniqueIds(questionBank);

                        // Skip if we don't have enough total questions
                        if (uniqueBank.length < totalQuestions) {
                            return;
                        }

                        // Request a distribution that requires more hard questions than available
                        const distribution = {
                            easy: 0.3,
                            medium: 0.5,
                            hard: 0.2, // Would need 20% hard, but we only have ~7.7% in bank
                        };

                        // Setup mocks
                        const { getQuestionsByConceptSpy, getQuestionsByConceptAndDifficultySpy, getRankingSpy } = setupMocks(uniqueBank);

                        try {
                            // Generate test - should still succeed by using available questions
                            const test = await service.generateMockTest('test-user-id', {
                                questionCount: totalQuestions,
                                difficultyDistribution: distribution,
                            });

                            // Get the questions from the test
                            const testQuestions = await Promise.all(
                                test.question_ids.map(async (id) => {
                                    return uniqueBank.find(q => q.id === id)!;
                                })
                            );

                            // Property: Should still generate the requested number of questions
                            expect(testQuestions.length).toBe(totalQuestions);

                            // Property: Should use all available hard questions
                            const hardCount = testQuestions.filter(q => q.difficulty === 'hard').length;
                            expect(hardCount).toBeLessThanOrEqual(hardQuestions.length);

                            // Property: Should fill remaining slots with other difficulties
                            const totalCount = testQuestions.filter(q =>
                                q.difficulty === 'easy' || q.difficulty === 'medium' || q.difficulty === 'hard'
                            ).length;
                            expect(totalCount).toBe(totalQuestions);

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getQuestionsByConceptAndDifficultySpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should maintain difficulty distribution when using default distribution', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 30, max: 100 }), // Total questions to generate
                    async (totalQuestions) => {
                        // Default distribution is 30% easy, 50% medium, 20% hard
                        const defaultDistribution = { easy: 0.3, medium: 0.5, hard: 0.2 };

                        // Calculate how many questions we need of each difficulty with buffer
                        const targetCounts = {
                            easy: Math.ceil(totalQuestions * defaultDistribution.easy * 1.5),
                            medium: Math.ceil(totalQuestions * defaultDistribution.medium * 1.5),
                            hard: Math.ceil(totalQuestions * defaultDistribution.hard * 1.5),
                        };

                        // Generate balanced question bank with enough questions
                        const easyQuestions = await fc.sample(
                            questionWithDifficultyArb('easy'),
                            targetCounts.easy
                        );
                        const mediumQuestions = await fc.sample(
                            questionWithDifficultyArb('medium'),
                            targetCounts.medium
                        );
                        const hardQuestions = await fc.sample(
                            questionWithDifficultyArb('hard'),
                            targetCounts.hard
                        );

                        const questionBank = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
                        const uniqueBank = ensureUniqueIds(questionBank);

                        // Setup mocks
                        const { getQuestionsByConceptSpy, getQuestionsByConceptAndDifficultySpy, getRankingSpy } = setupMocks(uniqueBank);

                        try {
                            // Generate test without specifying distribution (should use default: 30% easy, 50% medium, 20% hard)
                            const test = await service.generateMockTest('test-user-id', {
                                questionCount: totalQuestions,
                            });

                            // Get the questions from the test
                            const testQuestions = await Promise.all(
                                test.question_ids.map(async (id) => {
                                    return uniqueBank.find(q => q.id === id)!;
                                })
                            );

                            // Count actual difficulty distribution
                            const actualCounts = {
                                easy: testQuestions.filter(q => q.difficulty === 'easy').length,
                                medium: testQuestions.filter(q => q.difficulty === 'medium').length,
                                hard: testQuestions.filter(q => q.difficulty === 'hard').length,
                            };

                            const actualDistribution = {
                                easy: actualCounts.easy / totalQuestions,
                                medium: actualCounts.medium / totalQuestions,
                                hard: actualCounts.hard / totalQuestions,
                            };

                            // Property: Should match default distribution (30% easy, 50% medium, 20% hard) within 10% tolerance
                            const tolerance = 0.1;

                            expect(Math.abs(actualDistribution.easy - defaultDistribution.easy)).toBeLessThanOrEqual(tolerance);
                            expect(Math.abs(actualDistribution.medium - defaultDistribution.medium)).toBeLessThanOrEqual(tolerance);
                            expect(Math.abs(actualDistribution.hard - defaultDistribution.hard)).toBeLessThanOrEqual(tolerance);

                        } finally {
                            getQuestionsByConceptSpy.mockRestore();
                            getQuestionsByConceptAndDifficultySpy.mockRestore();
                            getRankingSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 14: Test session ID uniqueness
    // **Validates: Requirements 3.5**
    // For any two test sessions created by the system, they should have different session IDs.
    describe('Property 14: Test session ID uniqueness', () => {
        let service: TestGenerationService;

        beforeEach(() => {
            service = new TestGenerationService();
        });

        it('should generate unique session IDs for multiple test sessions', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(fc.uuid(), { minLength: 2, maxLength: 10 }), // User IDs
                    fc.array(fc.uuid(), { minLength: 2, maxLength: 10 }), // Test IDs
                    fc.integer({ min: 5, max: 50 }), // Number of sessions to create
                    async (userIds, testIds, sessionCount) => {
                        // Skip if we don't have enough IDs
                        if (userIds.length === 0 || testIds.length === 0) {
                            return;
                        }

                        // Mock database operations
                        const verifyTestExistsSpy = jest.spyOn(service as any, 'verifyTestExists');
                        verifyTestExistsSpy.mockResolvedValue(true); // All tests exist

                        const poolQuerySpy = jest.spyOn((service as any).pool, 'query');
                        poolQuerySpy.mockResolvedValue({ rows: [], rowCount: 0 });

                        try {
                            // Create multiple test sessions
                            const sessionIds: string[] = [];

                            for (let i = 0; i < sessionCount; i++) {
                                // Randomly select user and test IDs
                                const userId = userIds[i % userIds.length];
                                const testId = testIds[i % testIds.length];

                                const sessionId = await service.createTestSession(userId, testId);
                                sessionIds.push(sessionId);
                            }

                            // Property: All session IDs should be unique
                            const uniqueSessionIds = new Set(sessionIds);
                            expect(uniqueSessionIds.size).toBe(sessionIds.length);

                            // Property: All session IDs should be valid UUIDs (non-empty strings)
                            sessionIds.forEach(sessionId => {
                                expect(sessionId).toBeDefined();
                                expect(typeof sessionId).toBe('string');
                                expect(sessionId.length).toBeGreaterThan(0);
                                // UUID v4 format check (basic)
                                expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                            });

                        } finally {
                            verifyTestExistsSpy.mockRestore();
                            poolQuerySpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should generate unique session IDs even when creating sessions for the same user and test', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.uuid(), // Single user ID
                    fc.uuid(), // Single test ID
                    fc.integer({ min: 10, max: 100 }), // Number of sessions to create
                    async (userId, testId, sessionCount) => {
                        // Mock database operations
                        const verifyTestExistsSpy = jest.spyOn(service as any, 'verifyTestExists');
                        verifyTestExistsSpy.mockResolvedValue(true);

                        const poolQuerySpy = jest.spyOn((service as any).pool, 'query');
                        poolQuerySpy.mockResolvedValue({ rows: [], rowCount: 0 });

                        try {
                            // Create multiple sessions for the same user and test
                            const sessionIds: string[] = [];

                            for (let i = 0; i < sessionCount; i++) {
                                const sessionId = await service.createTestSession(userId, testId);
                                sessionIds.push(sessionId);
                            }

                            // Property: All session IDs should be unique, even for the same user/test combination
                            const uniqueSessionIds = new Set(sessionIds);
                            expect(uniqueSessionIds.size).toBe(sessionIds.length);

                            // Property: No two session IDs should be the same
                            for (let i = 0; i < sessionIds.length; i++) {
                                for (let j = i + 1; j < sessionIds.length; j++) {
                                    expect(sessionIds[i]).not.toBe(sessionIds[j]);
                                }
                            }

                        } finally {
                            verifyTestExistsSpy.mockRestore();
                            poolQuerySpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should generate unique session IDs across concurrent session creation', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(fc.tuple(fc.uuid(), fc.uuid()), { minLength: 5, maxLength: 20 }), // Array of (userId, testId) pairs
                    async (userTestPairs) => {
                        // Mock database operations
                        const verifyTestExistsSpy = jest.spyOn(service as any, 'verifyTestExists');
                        verifyTestExistsSpy.mockResolvedValue(true);

                        const poolQuerySpy = jest.spyOn((service as any).pool, 'query');
                        poolQuerySpy.mockResolvedValue({ rows: [], rowCount: 0 });

                        try {
                            // Create sessions concurrently (simulating multiple users starting tests at the same time)
                            const sessionPromises = userTestPairs.map(([userId, testId]) =>
                                service.createTestSession(userId, testId)
                            );

                            const sessionIds = await Promise.all(sessionPromises);

                            // Property: All session IDs should be unique, even when created concurrently
                            const uniqueSessionIds = new Set(sessionIds);
                            expect(uniqueSessionIds.size).toBe(sessionIds.length);

                            // Property: Each session ID should be a valid UUID
                            sessionIds.forEach(sessionId => {
                                expect(sessionId).toBeDefined();
                                expect(typeof sessionId).toBe('string');
                                expect(sessionId.length).toBeGreaterThan(0);
                                expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                            });

                        } finally {
                            verifyTestExistsSpy.mockRestore();
                            poolQuerySpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should maintain session ID uniqueness over time', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 20, max: 100 }), // Number of sessions to create
                    async (sessionCount) => {
                        // Mock database operations
                        const verifyTestExistsSpy = jest.spyOn(service as any, 'verifyTestExists');
                        verifyTestExistsSpy.mockResolvedValue(true);

                        const poolQuerySpy = jest.spyOn((service as any).pool, 'query');
                        poolQuerySpy.mockResolvedValue({ rows: [], rowCount: 0 });

                        try {
                            // Create sessions over "time" (sequentially with small delays)
                            const sessionIds: string[] = [];
                            const userId = 'test-user-id';
                            const testId = 'test-test-id';

                            for (let i = 0; i < sessionCount; i++) {
                                const sessionId = await service.createTestSession(userId, testId);
                                sessionIds.push(sessionId);

                                // Small delay to simulate time passing (not necessary for UUID v4, but tests the property)
                                if (i % 10 === 0) {
                                    await new Promise(resolve => setTimeout(resolve, 1));
                                }
                            }

                            // Property: All session IDs should remain unique over time
                            const uniqueSessionIds = new Set(sessionIds);
                            expect(uniqueSessionIds.size).toBe(sessionIds.length);

                            // Property: Session IDs should not follow a predictable pattern
                            // (This is a weak test, but checks that consecutive IDs are different)
                            for (let i = 0; i < sessionIds.length - 1; i++) {
                                expect(sessionIds[i]).not.toBe(sessionIds[i + 1]);
                            }

                        } finally {
                            verifyTestExistsSpy.mockRestore();
                            poolQuerySpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
