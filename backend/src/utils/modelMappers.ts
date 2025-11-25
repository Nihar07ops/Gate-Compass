// Utility functions to map between database rows and application models

import {
    Question,
    QuestionRow,
    Test,
    TestRow,
    TestResult,
    TestResultRow,
    ConceptTrend,
    ConceptTrendRow,
} from '../types/models';

/**
 * Map a question database row to a Question model
 */
export const mapQuestionRowToModel = (row: QuestionRow): Question => {
    return {
        id: row.id,
        content: row.content,
        options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
        correct_answer: row.correct_answer,
        explanation: row.explanation,
        concept_id: row.concept_id,
        sub_concept: row.sub_concept || undefined,
        difficulty: row.difficulty,
        source: row.source,
        year_appeared: row.year_appeared || undefined,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
};

/**
 * Map a test database row to a Test model
 */
export const mapTestRowToModel = (row: TestRow): Test => {
    return {
        id: row.id,
        question_ids: typeof row.question_ids === 'string' ? JSON.parse(row.question_ids) : row.question_ids,
        total_questions: row.total_questions,
        duration: row.duration,
        created_at: row.created_at,
    };
};

/**
 * Map a test result database row to a TestResult model
 */
export const mapTestResultRowToModel = (row: TestResultRow): TestResult => {
    return {
        id: row.id,
        session_id: row.session_id,
        user_id: row.user_id,
        score: row.score,
        total_questions: row.total_questions,
        correct_answers: row.correct_answers,
        incorrect_answers: row.incorrect_answers,
        unanswered: row.unanswered,
        percentage: row.percentage,
        concept_performance: typeof row.concept_performance === 'string'
            ? JSON.parse(row.concept_performance)
            : row.concept_performance,
        feedback: typeof row.feedback === 'string'
            ? JSON.parse(row.feedback)
            : row.feedback,
        created_at: row.created_at,
    };
};

/**
 * Map a concept trend database row to a ConceptTrend model
 */
export const mapConceptTrendRowToModel = (row: ConceptTrendRow): ConceptTrend => {
    return {
        id: row.id,
        concept_id: row.concept_id,
        frequency: row.frequency,
        importance: row.importance,
        yearly_distribution: typeof row.yearly_distribution === 'string'
            ? JSON.parse(row.yearly_distribution)
            : row.yearly_distribution,
        last_updated: row.last_updated,
    };
};
