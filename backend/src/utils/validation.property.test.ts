import * as fc from 'fast-check';
import { validateQuestion, ValidationError, QuestionInput } from './validation';
import { Difficulty, QuestionOption } from '../types/models';

// Feature: gate-compass, Property 32: Question validation
// **Validates: Requirements 8.1**
// For any question submitted by an administrator, if it lacks required metadata
// (concept, difficulty, or source), the system should reject the submission with a validation error.

describe('Question Validation - Property-Based Tests', () => {
    describe('Property 32: Question validation', () => {
        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        }) as fc.Arbitrary<QuestionOption>;

        // Generator for valid complete questions
        const validQuestionArb: fc.Arbitrary<QuestionInput> = fc
            .tuple(
                fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0),
                fc.array(validOptionArb, { minLength: 2, maxLength: 6 }),
                fc.constantFrom<Difficulty>('easy', 'medium', 'hard'),
                fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
                fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0)
            )
            .chain(([content, options, difficulty, concept_id, source, explanation]) => {
                // Ensure correct_answer is one of the option ids
                return fc.constantFrom(...options.map(opt => opt.id)).map(correct_answer => ({
                    content,
                    options,
                    difficulty,
                    concept_id,
                    source,
                    explanation,
                    correct_answer,
                }));
            });

        it('should reject questions missing concept_id', () => {
            fc.assert(
                fc.property(
                    validQuestionArb,
                    (validQuestion) => {
                        // Create a question without concept_id
                        const invalidQuestion: Partial<QuestionInput> = {
                            content: validQuestion.content,
                            options: validQuestion.options,
                            correct_answer: validQuestion.correct_answer,
                            explanation: validQuestion.explanation,
                            difficulty: validQuestion.difficulty,
                            source: validQuestion.source,
                            concept_id: '', // Empty concept_id
                        };

                        // Should throw ValidationError
                        expect(() => validateQuestion(invalidQuestion)).toThrow(ValidationError);
                        expect(() => validateQuestion(invalidQuestion)).toThrow(/Concept is required/);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should reject questions missing difficulty', () => {
            fc.assert(
                fc.property(
                    validQuestionArb,
                    (validQuestion) => {
                        // Create a question without difficulty
                        const invalidQuestion: Partial<QuestionInput> = {
                            content: validQuestion.content,
                            options: validQuestion.options,
                            correct_answer: validQuestion.correct_answer,
                            explanation: validQuestion.explanation,
                            concept_id: validQuestion.concept_id,
                            source: validQuestion.source,
                            // difficulty is missing
                        };

                        // Should throw ValidationError
                        expect(() => validateQuestion(invalidQuestion)).toThrow(ValidationError);
                        expect(() => validateQuestion(invalidQuestion)).toThrow(/Difficulty is required/);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should reject questions missing source', () => {
            fc.assert(
                fc.property(
                    validQuestionArb,
                    (validQuestion) => {
                        // Create a question without source
                        const invalidQuestion: Partial<QuestionInput> = {
                            content: validQuestion.content,
                            options: validQuestion.options,
                            correct_answer: validQuestion.correct_answer,
                            explanation: validQuestion.explanation,
                            concept_id: validQuestion.concept_id,
                            difficulty: validQuestion.difficulty,
                            source: '', // Empty source
                        };

                        // Should throw ValidationError
                        expect(() => validateQuestion(invalidQuestion)).toThrow(ValidationError);
                        expect(() => validateQuestion(invalidQuestion)).toThrow(/Source is required/);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should reject questions missing any combination of required metadata', () => {
            fc.assert(
                fc.property(
                    validQuestionArb,
                    fc.array(fc.constantFrom('concept_id', 'difficulty', 'source'), { minLength: 1, maxLength: 3 }),
                    (validQuestion, fieldsToRemove) => {
                        // Create a question with some required fields missing
                        const invalidQuestion: Partial<QuestionInput> = {
                            content: validQuestion.content,
                            options: validQuestion.options,
                            correct_answer: validQuestion.correct_answer,
                            explanation: validQuestion.explanation,
                            concept_id: validQuestion.concept_id,
                            difficulty: validQuestion.difficulty,
                            source: validQuestion.source,
                        };

                        // Remove the specified fields
                        fieldsToRemove.forEach(field => {
                            if (field === 'concept_id' || field === 'source') {
                                (invalidQuestion as any)[field] = '';
                            } else if (field === 'difficulty') {
                                delete (invalidQuestion as any)[field];
                            }
                        });

                        // Should throw ValidationError
                        expect(() => validateQuestion(invalidQuestion)).toThrow(ValidationError);

                        // Verify the error message mentions at least one of the missing fields
                        try {
                            validateQuestion(invalidQuestion);
                            fail('Expected ValidationError to be thrown');
                        } catch (error: any) {
                            const errorMessage = error.message;
                            const hasExpectedError = fieldsToRemove.some(field => {
                                if (field === 'concept_id') return errorMessage.includes('Concept is required');
                                if (field === 'difficulty') return errorMessage.includes('Difficulty is required');
                                if (field === 'source') return errorMessage.includes('Source is required');
                                return false;
                            });
                            expect(hasExpectedError).toBe(true);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should accept questions with all required metadata', () => {
            fc.assert(
                fc.property(
                    validQuestionArb,
                    (validQuestion) => {
                        // Create a complete valid question
                        const completeQuestion: QuestionInput = {
                            content: validQuestion.content,
                            options: validQuestion.options,
                            correct_answer: validQuestion.correct_answer,
                            explanation: validQuestion.explanation,
                            concept_id: validQuestion.concept_id,
                            difficulty: validQuestion.difficulty,
                            source: validQuestion.source,
                        };

                        // Should not throw any error
                        expect(() => validateQuestion(completeQuestion)).not.toThrow();
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should reject questions with invalid difficulty values', () => {
            fc.assert(
                fc.property(
                    validQuestionArb,
                    fc.string({ minLength: 1 }).filter(s => !['easy', 'medium', 'hard'].includes(s) && s.trim().length > 0),
                    (validQuestion, invalidDifficulty) => {
                        // Create a question with invalid difficulty
                        const invalidQuestion: Partial<QuestionInput> = {
                            content: validQuestion.content,
                            options: validQuestion.options,
                            correct_answer: validQuestion.correct_answer,
                            explanation: validQuestion.explanation,
                            concept_id: validQuestion.concept_id,
                            difficulty: invalidDifficulty as Difficulty,
                            source: validQuestion.source,
                        };

                        // Should throw ValidationError
                        expect(() => validateQuestion(invalidQuestion)).toThrow(ValidationError);
                        expect(() => validateQuestion(invalidQuestion)).toThrow(/Difficulty must be easy, medium, or hard/);
                    }
                ),
                { numRuns: 100 }
            );
        });

        it('should reject questions with whitespace-only required fields', () => {
            fc.assert(
                fc.property(
                    validQuestionArb,
                    fc.constantFrom('concept_id', 'source', 'content', 'explanation'),
                    (validQuestion, fieldToMakeWhitespace) => {
                        // Create a question with a whitespace-only field
                        const invalidQuestion: Partial<QuestionInput> = {
                            content: validQuestion.content,
                            options: validQuestion.options,
                            correct_answer: validQuestion.correct_answer,
                            explanation: validQuestion.explanation,
                            concept_id: validQuestion.concept_id,
                            difficulty: validQuestion.difficulty,
                            source: validQuestion.source,
                        };

                        // Set the field to whitespace only
                        (invalidQuestion as any)[fieldToMakeWhitespace] = '   ';

                        // Should throw ValidationError
                        expect(() => validateQuestion(invalidQuestion)).toThrow(ValidationError);

                        // Verify the error message mentions the field
                        try {
                            validateQuestion(invalidQuestion);
                            fail('Expected ValidationError to be thrown');
                        } catch (error: any) {
                            const errorMessage = error.message;
                            expect(errorMessage.length).toBeGreaterThan(0);
                        }
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
