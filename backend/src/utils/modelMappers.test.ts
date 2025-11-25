import {
    mapQuestionRowToModel,
    mapTestRowToModel,
    mapTestResultRowToModel,
    mapConceptTrendRowToModel,
} from './modelMappers';
import {
    QuestionRow,
    TestRow,
    TestResultRow,
    ConceptTrendRow,
} from '../types/models';

describe('Model Mappers', () => {
    describe('mapQuestionRowToModel', () => {
        it('should map question row to model correctly', () => {
            const row: QuestionRow = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                content: 'What is the time complexity of binary search?',
                options: JSON.stringify([
                    { id: 'a', text: 'O(n)' },
                    { id: 'b', text: 'O(log n)' },
                    { id: 'c', text: 'O(n^2)' },
                    { id: 'd', text: 'O(1)' },
                ]),
                correct_answer: 'b',
                explanation: 'Binary search divides the search space in half each time.',
                concept_id: '456e4567-e89b-12d3-a456-426614174000',
                sub_concept: 'Search Algorithms',
                difficulty: 'medium',
                source: 'Cormen - Introduction to Algorithms',
                year_appeared: 2020,
                created_at: new Date('2023-01-01'),
                updated_at: new Date('2023-01-01'),
            };

            const result = mapQuestionRowToModel(row);

            expect(result.id).toBe(row.id);
            expect(result.content).toBe(row.content);
            expect(result.options).toEqual([
                { id: 'a', text: 'O(n)' },
                { id: 'b', text: 'O(log n)' },
                { id: 'c', text: 'O(n^2)' },
                { id: 'd', text: 'O(1)' },
            ]);
            expect(result.correct_answer).toBe('b');
            expect(result.sub_concept).toBe('Search Algorithms');
            expect(result.year_appeared).toBe(2020);
        });

        it('should handle null sub_concept and year_appeared', () => {
            const row: QuestionRow = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                content: 'Test question',
                options: JSON.stringify([{ id: 'a', text: 'Answer' }]),
                correct_answer: 'a',
                explanation: 'Test explanation',
                concept_id: '456e4567-e89b-12d3-a456-426614174000',
                sub_concept: null,
                difficulty: 'easy',
                source: 'Test source',
                year_appeared: null,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const result = mapQuestionRowToModel(row);

            expect(result.sub_concept).toBeUndefined();
            expect(result.year_appeared).toBeUndefined();
        });
    });

    describe('mapTestRowToModel', () => {
        it('should map test row to model correctly', () => {
            const row: TestRow = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                question_ids: JSON.stringify(['q1', 'q2', 'q3']),
                total_questions: 3,
                duration: 10800,
                created_at: new Date('2023-01-01'),
            };

            const result = mapTestRowToModel(row);

            expect(result.id).toBe(row.id);
            expect(result.question_ids).toEqual(['q1', 'q2', 'q3']);
            expect(result.total_questions).toBe(3);
            expect(result.duration).toBe(10800);
        });
    });

    describe('mapTestResultRowToModel', () => {
        it('should map test result row to model correctly', () => {
            const row: TestResultRow = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                session_id: '456e4567-e89b-12d3-a456-426614174000',
                user_id: '789e4567-e89b-12d3-a456-426614174000',
                score: 80,
                total_questions: 100,
                correct_answers: 80,
                incorrect_answers: 15,
                unanswered: 5,
                percentage: 80.0,
                concept_performance: JSON.stringify([
                    {
                        concept_id: 'c1',
                        concept_name: 'Algorithms',
                        total_questions: 50,
                        correct_answers: 40,
                        accuracy: 80,
                        average_time_per_question: 120,
                    },
                ]),
                feedback: JSON.stringify({
                    overall_message: 'Good performance',
                    strengths: ['Algorithms'],
                    weaknesses: [],
                    recommendations: [],
                }),
                created_at: new Date('2023-01-01'),
            };

            const result = mapTestResultRowToModel(row);

            expect(result.id).toBe(row.id);
            expect(result.score).toBe(80);
            expect(result.concept_performance).toHaveLength(1);
            expect(result.concept_performance[0].concept_name).toBe('Algorithms');
            expect(result.feedback.overall_message).toBe('Good performance');
        });
    });

    describe('mapConceptTrendRowToModel', () => {
        it('should map concept trend row to model correctly', () => {
            const row: ConceptTrendRow = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                concept_id: '456e4567-e89b-12d3-a456-426614174000',
                frequency: 0.15,
                importance: 0.85,
                yearly_distribution: JSON.stringify({ 2020: 5, 2021: 7, 2022: 8 }),
                last_updated: new Date('2023-01-01'),
            };

            const result = mapConceptTrendRowToModel(row);

            expect(result.id).toBe(row.id);
            expect(result.concept_id).toBe(row.concept_id);
            expect(result.frequency).toBe(0.15);
            expect(result.importance).toBe(0.85);
            expect(result.yearly_distribution).toEqual({ 2020: 5, 2021: 7, 2022: 8 });
        });
    });
});
