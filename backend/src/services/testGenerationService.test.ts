import { TestGenerationService, DifficultyDistribution } from './testGenerationService';
import { Question } from '../types/models';

describe('TestGenerationService', () => {
    let service: TestGenerationService;

    beforeEach(() => {
        service = new TestGenerationService();
    });

    describe('balanceQuestionDifficulty', () => {
        it('should return the correct total number of questions', () => {
            const questions: Question[] = [
                ...createMockQuestions('easy', 20),
                ...createMockQuestions('medium', 20),
                ...createMockQuestions('hard', 20),
            ];

            const distribution: DifficultyDistribution = {
                easy: 0.3,
                medium: 0.5,
                hard: 0.2,
            };

            const balanced = service.balanceQuestionDifficulty(questions, distribution);
            expect(balanced.length).toBe(60);
        });

        it('should include questions from all difficulty levels', () => {
            const questions: Question[] = [
                ...createMockQuestions('easy', 20),
                ...createMockQuestions('medium', 20),
                ...createMockQuestions('hard', 20),
            ];

            const distribution: DifficultyDistribution = {
                easy: 0.3,
                medium: 0.5,
                hard: 0.2,
            };

            const balanced = service.balanceQuestionDifficulty(questions, distribution);

            const counts = {
                easy: balanced.filter(q => q.difficulty === 'easy').length,
                medium: balanced.filter(q => q.difficulty === 'medium').length,
                hard: balanced.filter(q => q.difficulty === 'hard').length,
            };

            // Should have questions from all difficulties
            expect(counts.easy).toBeGreaterThan(0);
            expect(counts.medium).toBeGreaterThan(0);
            expect(counts.hard).toBeGreaterThan(0);
        });
    });

    describe('validateDifficultyDistribution', () => {
        it('should accept valid distribution', () => {
            const distribution: DifficultyDistribution = {
                easy: 0.3,
                medium: 0.5,
                hard: 0.2,
            };

            expect(() => {
                service['validateDifficultyDistribution'](distribution);
            }).not.toThrow();
        });

        it('should reject distribution that does not sum to 1.0', () => {
            const distribution: DifficultyDistribution = {
                easy: 0.3,
                medium: 0.3,
                hard: 0.3,
            };

            expect(() => {
                service['validateDifficultyDistribution'](distribution);
            }).toThrow('Difficulty distribution must sum to 1.0');
        });

        it('should reject negative values', () => {
            const distribution: DifficultyDistribution = {
                easy: -0.1,
                medium: 0.6,
                hard: 0.5,
            };

            expect(() => {
                service['validateDifficultyDistribution'](distribution);
            }).toThrow('Difficulty distribution values must be non-negative');
        });
    });

    describe('ensureValidSources', () => {
        it('should pass when all questions have valid sources', () => {
            const questions: Question[] = createMockQuestions('easy', 5);

            expect(() => {
                service['ensureValidSources'](questions);
            }).not.toThrow();
        });

        it('should throw when questions have empty sources', () => {
            const questions: Question[] = [
                ...createMockQuestions('easy', 3),
                createMockQuestion('easy', ''), // Empty source
            ];

            expect(() => {
                service['ensureValidSources'](questions);
            }).toThrow('questions without valid textbook sources');
        });
    });
});

// Helper functions
function createMockQuestions(difficulty: 'easy' | 'medium' | 'hard', count: number): Question[] {
    return Array.from({ length: count }, (_, i) => createMockQuestion(difficulty, `Source ${i}`));
}

function createMockQuestion(difficulty: 'easy' | 'medium' | 'hard', source: string): Question {
    return {
        id: Math.random().toString(36).substring(7),
        content: 'Sample question',
        options: [
            { id: 'a', text: 'Option A' },
            { id: 'b', text: 'Option B' },
            { id: 'c', text: 'Option C' },
            { id: 'd', text: 'Option D' },
        ],
        correct_answer: 'a',
        explanation: 'Sample explanation',
        concept_id: 'concept-1',
        difficulty,
        source,
        created_at: new Date(),
        updated_at: new Date(),
    };
}
