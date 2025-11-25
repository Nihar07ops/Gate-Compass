import { Difficulty, QuestionOption } from '../types/models';

/**
 * Validation error class
 */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * Validate question data
 */
export interface QuestionInput {
    content: string;
    options: QuestionOption[];
    correct_answer: string;
    explanation: string;
    concept_id: string;
    sub_concept?: string;
    difficulty: Difficulty;
    source: string;
    year_appeared?: number;
}

export function validateQuestion(data: Partial<QuestionInput>): void {
    const errors: string[] = [];

    // Required fields
    if (!data.content || data.content.trim() === '') {
        errors.push('Content is required');
    }

    if (!data.concept_id || data.concept_id.trim() === '') {
        errors.push('Concept is required');
    }

    if (!data.difficulty) {
        errors.push('Difficulty is required');
    } else if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
        errors.push('Difficulty must be easy, medium, or hard');
    }

    if (!data.source || data.source.trim() === '') {
        errors.push('Source is required');
    }

    if (!data.options || !Array.isArray(data.options) || data.options.length < 2) {
        errors.push('At least 2 options are required');
    }

    if (!data.correct_answer || data.correct_answer.trim() === '') {
        errors.push('Correct answer is required');
    }

    if (!data.explanation || data.explanation.trim() === '') {
        errors.push('Explanation is required');
    }

    // Validate options structure
    if (data.options && Array.isArray(data.options)) {
        data.options.forEach((option, index) => {
            if (!option.id || option.id.trim() === '') {
                errors.push(`Option ${index + 1} must have an id`);
            }
            if (!option.text || option.text.trim() === '') {
                errors.push(`Option ${index + 1} must have text`);
            }
        });

        // Validate correct answer is one of the option ids
        if (data.correct_answer) {
            const optionIds = data.options.map(opt => opt.id);
            if (!optionIds.includes(data.correct_answer)) {
                errors.push('Correct answer must match one of the option ids');
            }
        }
    }

    // Validate year if provided
    if (data.year_appeared !== undefined && data.year_appeared !== null) {
        const currentYear = new Date().getFullYear();
        if (data.year_appeared < 1990 || data.year_appeared > currentYear) {
            errors.push(`Year appeared must be between 1990 and ${currentYear}`);
        }
    }

    if (errors.length > 0) {
        throw new ValidationError(errors.join('; '));
    }
}

/**
 * Validate concept data
 */
export interface ConceptInput {
    name: string;
    category: string;
    description?: string;
}

export function validateConcept(data: Partial<ConceptInput>): void {
    const errors: string[] = [];

    if (!data.name || data.name.trim() === '') {
        errors.push('Name is required');
    }

    if (!data.category || data.category.trim() === '') {
        errors.push('Category is required');
    }

    if (errors.length > 0) {
        throw new ValidationError(errors.join('; '));
    }
}

/**
 * Validate bulk import data
 */
export interface BulkQuestionInput {
    questions: QuestionInput[];
}

export function validateBulkImport(data: any): BulkQuestionInput {
    if (!data.questions || !Array.isArray(data.questions)) {
        throw new ValidationError('Questions array is required');
    }

    if (data.questions.length === 0) {
        throw new ValidationError('At least one question is required');
    }

    return data as BulkQuestionInput;
}
