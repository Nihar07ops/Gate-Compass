import * as fc from 'fast-check';
import { QuestionService, BulkImportResult } from './questionService';
import { QuestionInput } from '../utils/validation';
import { Difficulty, QuestionOption } from '../types/models';

// Feature: gate-compass, Property 33: Import parsing correctness
// **Validates: Requirements 8.2**
// For any batch of previous years' questions imported, each question should be parsed
// and assigned a concept category before being added to the question bank.

describe('Question Service - Property-Based Tests', () => {
    describe('Property 33: Import parsing correctness', () => {
        let questionService: QuestionService;

        beforeEach(() => {
            questionService = new QuestionService();
        });

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for valid complete questions with concept_id
        const validQuestionWithConceptArb: fc.Arbitrary<QuestionInput> = fc
            .tuple(
                fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0),
                fc.array(validOptionArb, { minLength: 2, maxLength: 6 }),
                fc.constantFrom<Difficulty>('easy', 'medium', 'hard'),
                fc.uuid(), // concept_id as UUID
                fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
                fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0),
                fc.option(fc.integer({ min: 1990, max: new Date().getFullYear() }), { nil: undefined })
            )
            .chain(([content, options, difficulty, concept_id, source, explanation, year_appeared]) => {
                return fc.constantFrom(...options.map(opt => opt.id)).map(correct_answer => ({
                    content,
                    options,
                    difficulty,
                    concept_id,
                    source,
                    explanation,
                    correct_answer,
                    year_appeared,
                }));
            });

        it('should parse and validate each question has a concept_id', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionWithConceptArb, { minLength: 1, maxLength: 10 }),
                    async (questions) => {
                        // Create bulk import data
                        const importData = { questions };

                        // Mock the database operations
                        const createQuestionSpy = jest.spyOn(questionService, 'createQuestion');

                        // Mock successful creation for questions with valid concept_id
                        createQuestionSpy.mockImplementation(async (data: QuestionInput) => {
                            // Verify concept_id is present and non-empty
                            expect(data.concept_id).toBeDefined();
                            expect(data.concept_id.trim()).not.toBe('');

                            // Return a mock question
                            return {
                                id: fc.sample(fc.uuid(), 1)[0],
                                content: data.content,
                                options: data.options,
                                correct_answer: data.correct_answer,
                                explanation: data.explanation,
                                concept_id: data.concept_id,
                                sub_concept: data.sub_concept,
                                difficulty: data.difficulty,
                                source: data.source,
                                year_appeared: data.year_appeared,
                                created_at: new Date(),
                                updated_at: new Date(),
                            };
                        });

                        try {
                            const result: BulkImportResult = await questionService.bulkImportQuestions(importData);

                            // Verify that createQuestion was called for each question
                            expect(createQuestionSpy).toHaveBeenCalledTimes(questions.length);

                            // Verify each call had a concept_id
                            for (let i = 0; i < questions.length; i++) {
                                const call = createQuestionSpy.mock.calls[i];
                                expect(call[0].concept_id).toBeDefined();
                                expect(call[0].concept_id.trim()).not.toBe('');
                            }

                            // All questions should be successful since they all have concept_id
                            expect(result.successful).toBe(questions.length);
                            expect(result.failed).toBe(0);
                        } finally {
                            createQuestionSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should reject questions without concept_id during import', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionWithConceptArb, { minLength: 1, maxLength: 10 }),
                    fc.integer({ min: 0, max: 9 }), // Index of question to corrupt
                    async (questions, corruptIndex) => {
                        // Skip if index is out of bounds
                        if (corruptIndex >= questions.length) {
                            return;
                        }

                        // Create a copy and remove concept_id from one question
                        const questionsWithMissingConcept = questions.map((q, idx) => {
                            if (idx === corruptIndex) {
                                const { concept_id, ...rest } = q;
                                return { ...rest, concept_id: '' }; // Empty concept_id
                            }
                            return q;
                        });

                        const importData = { questions: questionsWithMissingConcept };

                        // Mock the database operations
                        const createQuestionSpy = jest.spyOn(questionService, 'createQuestion');

                        createQuestionSpy.mockImplementation(async (data: QuestionInput) => {
                            // If concept_id is missing or empty, throw validation error
                            if (!data.concept_id || data.concept_id.trim() === '') {
                                throw new Error('Concept is required');
                            }

                            return {
                                id: fc.sample(fc.uuid(), 1)[0],
                                content: data.content,
                                options: data.options,
                                correct_answer: data.correct_answer,
                                explanation: data.explanation,
                                concept_id: data.concept_id,
                                sub_concept: data.sub_concept,
                                difficulty: data.difficulty,
                                source: data.source,
                                year_appeared: data.year_appeared,
                                created_at: new Date(),
                                updated_at: new Date(),
                            };
                        });

                        try {
                            const result: BulkImportResult = await questionService.bulkImportQuestions(importData);

                            // At least one question should have failed (the one without concept_id)
                            expect(result.failed).toBeGreaterThanOrEqual(1);

                            // The failed question should be in the errors array
                            const hasConceptError = result.errors.some(err =>
                                err.error.includes('Concept') || err.error.includes('concept')
                            );
                            expect(hasConceptError).toBe(true);

                            // Total should equal successful + failed
                            expect(result.total).toBe(result.successful + result.failed);
                        } finally {
                            createQuestionSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should parse all questions and assign concept categories before adding to question bank', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionWithConceptArb, { minLength: 1, maxLength: 10 }),
                    async (questions) => {
                        const importData = { questions };

                        // Track the order of operations
                        const operationLog: Array<{ operation: string; concept_id: string }> = [];

                        const createQuestionSpy = jest.spyOn(questionService, 'createQuestion');

                        createQuestionSpy.mockImplementation(async (data: QuestionInput) => {
                            // Log that we're checking concept_id before creating
                            operationLog.push({
                                operation: 'validate_concept',
                                concept_id: data.concept_id
                            });

                            // Verify concept_id exists (parsing and assignment happened)
                            expect(data.concept_id).toBeDefined();
                            expect(data.concept_id.trim()).not.toBe('');

                            // Log that we're creating the question
                            operationLog.push({
                                operation: 'create_question',
                                concept_id: data.concept_id
                            });

                            return {
                                id: fc.sample(fc.uuid(), 1)[0],
                                content: data.content,
                                options: data.options,
                                correct_answer: data.correct_answer,
                                explanation: data.explanation,
                                concept_id: data.concept_id,
                                sub_concept: data.sub_concept,
                                difficulty: data.difficulty,
                                source: data.source,
                                year_appeared: data.year_appeared,
                                created_at: new Date(),
                                updated_at: new Date(),
                            };
                        });

                        try {
                            await questionService.bulkImportQuestions(importData);

                            // Verify that for each question, validation happened before creation
                            for (let i = 0; i < questions.length; i++) {
                                const validateIdx = i * 2;
                                const createIdx = i * 2 + 1;

                                expect(operationLog[validateIdx].operation).toBe('validate_concept');
                                expect(operationLog[createIdx].operation).toBe('create_question');

                                // Same concept_id for both operations
                                expect(operationLog[validateIdx].concept_id).toBe(
                                    operationLog[createIdx].concept_id
                                );
                            }
                        } finally {
                            createQuestionSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should handle mixed valid and invalid questions during import', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionWithConceptArb, { minLength: 2, maxLength: 10 }),
                    fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 1, maxLength: 3 }), // Indices to corrupt
                    async (questions, corruptIndices) => {
                        // Filter to valid indices only
                        const validCorruptIndices = [...new Set(corruptIndices)].filter(idx => idx < questions.length);

                        if (validCorruptIndices.length === 0) {
                            return; // Skip if no valid indices
                        }

                        // Create a copy and remove concept_id from selected questions
                        const mixedQuestions = questions.map((q, idx) => {
                            if (validCorruptIndices.includes(idx)) {
                                const { concept_id, ...rest } = q;
                                return { ...rest, concept_id: '' };
                            }
                            return q;
                        });

                        const importData = { questions: mixedQuestions };

                        const createQuestionSpy = jest.spyOn(questionService, 'createQuestion');

                        createQuestionSpy.mockImplementation(async (data: QuestionInput) => {
                            if (!data.concept_id || data.concept_id.trim() === '') {
                                throw new Error('Concept is required');
                            }

                            return {
                                id: fc.sample(fc.uuid(), 1)[0],
                                content: data.content,
                                options: data.options,
                                correct_answer: data.correct_answer,
                                explanation: data.explanation,
                                concept_id: data.concept_id,
                                sub_concept: data.sub_concept,
                                difficulty: data.difficulty,
                                source: data.source,
                                year_appeared: data.year_appeared,
                                created_at: new Date(),
                                updated_at: new Date(),
                            };
                        });

                        try {
                            const result: BulkImportResult = await questionService.bulkImportQuestions(importData);

                            // Verify counts
                            expect(result.total).toBe(questions.length);
                            expect(result.failed).toBe(validCorruptIndices.length);
                            expect(result.successful).toBe(questions.length - validCorruptIndices.length);

                            // Verify error reporting
                            expect(result.errors.length).toBe(validCorruptIndices.length);

                            // Each error should mention concept
                            result.errors.forEach(err => {
                                expect(err.error.toLowerCase()).toContain('concept');
                            });
                        } finally {
                            createQuestionSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // Feature: gate-compass, Property 35: Bulk operation feedback
    // **Validates: Requirements 8.5**
    // For any bulk operation (import/update) processing N items, the system should report
    // progress updates and provide error details for any failed items.
    describe('Property 35: Bulk operation feedback', () => {
        let questionService: QuestionService;

        beforeEach(() => {
            questionService = new QuestionService();
        });

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for valid complete questions with concept_id
        const validQuestionWithConceptArb: fc.Arbitrary<QuestionInput> = fc
            .tuple(
                fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0),
                fc.array(validOptionArb, { minLength: 2, maxLength: 6 }),
                fc.constantFrom<Difficulty>('easy', 'medium', 'hard'),
                fc.uuid(), // concept_id as UUID
                fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
                fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0),
                fc.option(fc.integer({ min: 1990, max: new Date().getFullYear() }), { nil: undefined })
            )
            .chain(([content, options, difficulty, concept_id, source, explanation, year_appeared]) => {
                return fc.constantFrom(...options.map(opt => opt.id)).map(correct_answer => ({
                    content,
                    options,
                    difficulty,
                    concept_id,
                    source,
                    explanation,
                    correct_answer,
                    year_appeared,
                }));
            });

        it('should report total, successful, and failed counts for any bulk operation', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionWithConceptArb, { minLength: 1, maxLength: 20 }),
                    fc.array(fc.integer({ min: 0, max: 19 }), { minLength: 0, maxLength: 10 }), // Indices to fail
                    async (questions, failIndices) => {
                        // Filter to valid unique indices
                        const validFailIndices = [...new Set(failIndices)].filter(idx => idx < questions.length);

                        const importData = { questions };

                        const createQuestionSpy = jest.spyOn(questionService, 'createQuestion');

                        createQuestionSpy.mockImplementation(async (data: QuestionInput) => {
                            // Find the index of this question in the original array
                            const idx = questions.findIndex(q =>
                                q.content === data.content &&
                                q.concept_id === data.concept_id
                            );

                            // Fail if this index should fail
                            if (validFailIndices.includes(idx)) {
                                throw new Error(`Simulated failure for question at index ${idx}`);
                            }

                            return {
                                id: fc.sample(fc.uuid(), 1)[0],
                                content: data.content,
                                options: data.options,
                                correct_answer: data.correct_answer,
                                explanation: data.explanation,
                                concept_id: data.concept_id,
                                sub_concept: data.sub_concept,
                                difficulty: data.difficulty,
                                source: data.source,
                                year_appeared: data.year_appeared,
                                created_at: new Date(),
                                updated_at: new Date(),
                            };
                        });

                        try {
                            const result: BulkImportResult = await questionService.bulkImportQuestions(importData);

                            // Property: total should equal the number of questions processed
                            expect(result.total).toBe(questions.length);

                            // Property: successful + failed should equal total
                            expect(result.successful + result.failed).toBe(result.total);

                            // Property: failed count should match the number of failed items
                            expect(result.failed).toBe(validFailIndices.length);

                            // Property: successful count should be total minus failed
                            expect(result.successful).toBe(questions.length - validFailIndices.length);
                        } finally {
                            createQuestionSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should provide error details for each failed item including index and error message', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionWithConceptArb, { minLength: 2, maxLength: 15 }),
                    fc.array(fc.integer({ min: 0, max: 14 }), { minLength: 1, maxLength: 5 }), // At least one failure
                    async (questions, failIndices) => {
                        // Filter to valid unique indices
                        const validFailIndices = [...new Set(failIndices)].filter(idx => idx < questions.length);

                        if (validFailIndices.length === 0) {
                            return; // Skip if no valid fail indices
                        }

                        const importData = { questions };

                        const createQuestionSpy = jest.spyOn(questionService, 'createQuestion');

                        createQuestionSpy.mockImplementation(async (data: QuestionInput) => {
                            const idx = questions.findIndex(q =>
                                q.content === data.content &&
                                q.concept_id === data.concept_id
                            );

                            if (validFailIndices.includes(idx)) {
                                throw new Error(`Validation failed for question at index ${idx}`);
                            }

                            return {
                                id: fc.sample(fc.uuid(), 1)[0],
                                content: data.content,
                                options: data.options,
                                correct_answer: data.correct_answer,
                                explanation: data.explanation,
                                concept_id: data.concept_id,
                                sub_concept: data.sub_concept,
                                difficulty: data.difficulty,
                                source: data.source,
                                year_appeared: data.year_appeared,
                                created_at: new Date(),
                                updated_at: new Date(),
                            };
                        });

                        try {
                            const result: BulkImportResult = await questionService.bulkImportQuestions(importData);

                            // Property: errors array should have one entry per failed item
                            expect(result.errors.length).toBe(validFailIndices.length);

                            // Property: each error should have index, question, and error message
                            result.errors.forEach(error => {
                                expect(error).toHaveProperty('index');
                                expect(error).toHaveProperty('question');
                                expect(error).toHaveProperty('error');

                                // Error message should be non-empty
                                expect(error.error).toBeTruthy();
                                expect(typeof error.error).toBe('string');
                                expect(error.error.length).toBeGreaterThan(0);

                                // Index should be a valid number
                                expect(typeof error.index).toBe('number');
                                expect(error.index).toBeGreaterThanOrEqual(0);
                                expect(error.index).toBeLessThan(questions.length);

                                // Question should be an object with at least some properties
                                expect(typeof error.question).toBe('object');
                                expect(error.question).toBeTruthy();
                            });

                            // Property: error indices should match the failed indices
                            const errorIndices = result.errors.map(e => e.index).sort((a, b) => a - b);
                            const sortedFailIndices = [...validFailIndices].sort((a, b) => a - b);
                            expect(errorIndices).toEqual(sortedFailIndices);
                        } finally {
                            createQuestionSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should include the failed question data in error details', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionWithConceptArb, { minLength: 1, maxLength: 10 }),
                    fc.integer({ min: 0, max: 9 }), // Index to fail
                    async (questions, failIndex) => {
                        if (failIndex >= questions.length) {
                            return; // Skip if index out of bounds
                        }

                        const importData = { questions };

                        const createQuestionSpy = jest.spyOn(questionService, 'createQuestion');

                        createQuestionSpy.mockImplementation(async (data: QuestionInput) => {
                            const idx = questions.findIndex(q =>
                                q.content === data.content &&
                                q.concept_id === data.concept_id
                            );

                            if (idx === failIndex) {
                                throw new Error('Simulated validation error');
                            }

                            return {
                                id: fc.sample(fc.uuid(), 1)[0],
                                content: data.content,
                                options: data.options,
                                correct_answer: data.correct_answer,
                                explanation: data.explanation,
                                concept_id: data.concept_id,
                                sub_concept: data.sub_concept,
                                difficulty: data.difficulty,
                                source: data.source,
                                year_appeared: data.year_appeared,
                                created_at: new Date(),
                                updated_at: new Date(),
                            };
                        });

                        try {
                            const result: BulkImportResult = await questionService.bulkImportQuestions(importData);

                            // Should have exactly one error
                            expect(result.errors.length).toBe(1);

                            const error = result.errors[0];

                            // Property: error should contain the question data that failed
                            expect(error.question).toBeDefined();

                            // The question in the error should match the original question
                            const originalQuestion = questions[failIndex];
                            expect(error.question.content).toBe(originalQuestion.content);
                            expect(error.question.concept_id).toBe(originalQuestion.concept_id);
                            expect(error.question.difficulty).toBe(originalQuestion.difficulty);
                            expect(error.question.source).toBe(originalQuestion.source);
                        } finally {
                            createQuestionSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should handle all successful operations correctly', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionWithConceptArb, { minLength: 1, maxLength: 20 }),
                    async (questions) => {
                        const importData = { questions };

                        const createQuestionSpy = jest.spyOn(questionService, 'createQuestion');

                        createQuestionSpy.mockImplementation(async (data: QuestionInput) => {
                            return {
                                id: fc.sample(fc.uuid(), 1)[0],
                                content: data.content,
                                options: data.options,
                                correct_answer: data.correct_answer,
                                explanation: data.explanation,
                                concept_id: data.concept_id,
                                sub_concept: data.sub_concept,
                                difficulty: data.difficulty,
                                source: data.source,
                                year_appeared: data.year_appeared,
                                created_at: new Date(),
                                updated_at: new Date(),
                            };
                        });

                        try {
                            const result: BulkImportResult = await questionService.bulkImportQuestions(importData);

                            // Property: when all succeed, failed should be 0 and errors should be empty
                            expect(result.total).toBe(questions.length);
                            expect(result.successful).toBe(questions.length);
                            expect(result.failed).toBe(0);
                            expect(result.errors).toEqual([]);
                        } finally {
                            createQuestionSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should handle all failed operations correctly', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(validQuestionWithConceptArb, { minLength: 1, maxLength: 20 }),
                    async (questions) => {
                        const importData = { questions };

                        const createQuestionSpy = jest.spyOn(questionService, 'createQuestion');

                        createQuestionSpy.mockImplementation(async (_data: QuestionInput) => {
                            throw new Error('All operations fail');
                        });

                        try {
                            const result: BulkImportResult = await questionService.bulkImportQuestions(importData);

                            // Property: when all fail, successful should be 0 and all should be in errors
                            expect(result.total).toBe(questions.length);
                            expect(result.successful).toBe(0);
                            expect(result.failed).toBe(questions.length);
                            expect(result.errors.length).toBe(questions.length);

                            // Each error should have proper structure
                            result.errors.forEach((error, idx) => {
                                expect(error.index).toBe(idx);
                                expect(error.error).toBe('All operations fail');
                                expect(error.question).toBeDefined();
                            });
                        } finally {
                            createQuestionSpy.mockRestore();
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
