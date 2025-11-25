import { Pool } from 'pg';
import pool from '../config/database';
import { Question, QuestionRow } from '../types/models';
import { QuestionInput, validateQuestion, ValidationError, validateBulkImport } from '../utils/validation';

/**
 * Result of bulk import operation
 */
export interface BulkImportResult {
    total: number;
    successful: number;
    failed: number;
    errors: Array<{ index: number; question: Partial<QuestionInput>; error: string }>;
}

/**
 * Service for managing questions
 */
export class QuestionService {
    private pool: Pool;

    constructor() {
        this.pool = pool;
    }

    /**
     * Create a new question
     */
    async createQuestion(data: QuestionInput): Promise<Question> {
        validateQuestion(data);

        // Verify concept exists
        const conceptExists = await this.verifyConceptExists(data.concept_id);
        if (!conceptExists) {
            throw new ValidationError('Concept does not exist');
        }

        const result = await this.pool.query<QuestionRow>(
            `INSERT INTO questions 
             (content, options, correct_answer, explanation, concept_id, sub_concept, difficulty, source, year_appeared)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                data.content.trim(),
                JSON.stringify(data.options),
                data.correct_answer.trim(),
                data.explanation.trim(),
                data.concept_id,
                data.sub_concept?.trim() || null,
                data.difficulty,
                data.source.trim(),
                data.year_appeared || null,
            ]
        );

        return this.mapRowToQuestion(result.rows[0]);
    }

    /**
     * Get all questions with optional filters
     */
    async getQuestions(filters?: {
        concept_id?: string;
        difficulty?: string;
        year_appeared?: number;
        limit?: number;
        offset?: number;
    }): Promise<Question[]> {
        let query = 'SELECT * FROM questions WHERE 1=1';
        const values: any[] = [];
        let paramCount = 1;

        if (filters?.concept_id) {
            query += ` AND concept_id = $${paramCount++}`;
            values.push(filters.concept_id);
        }

        if (filters?.difficulty) {
            query += ` AND difficulty = $${paramCount++}`;
            values.push(filters.difficulty);
        }

        if (filters?.year_appeared) {
            query += ` AND year_appeared = $${paramCount++}`;
            values.push(filters.year_appeared);
        }

        query += ' ORDER BY created_at DESC';

        if (filters?.limit) {
            query += ` LIMIT $${paramCount++}`;
            values.push(filters.limit);
        }

        if (filters?.offset) {
            query += ` OFFSET $${paramCount++}`;
            values.push(filters.offset);
        }

        const result = await this.pool.query<QuestionRow>(query, values);
        return result.rows.map(row => this.mapRowToQuestion(row));
    }

    /**
     * Get question by ID
     */
    async getQuestionById(id: string): Promise<Question | null> {
        const result = await this.pool.query<QuestionRow>(
            'SELECT * FROM questions WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToQuestion(result.rows[0]);
    }

    /**
     * Update question
     */
    async updateQuestion(id: string, data: Partial<QuestionInput>): Promise<Question | null> {
        // Validate provided fields
        if (Object.keys(data).length > 0) {
            // Create a full object for validation by merging with existing data
            const existing = await this.getQuestionById(id);
            if (!existing) {
                return null;
            }

            const merged = { ...existing, ...data };
            validateQuestion(merged as QuestionInput);
        }

        // Verify concept exists if being updated
        if (data.concept_id) {
            const conceptExists = await this.verifyConceptExists(data.concept_id);
            if (!conceptExists) {
                throw new ValidationError('Concept does not exist');
            }
        }

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.content !== undefined) {
            updates.push(`content = $${paramCount++}`);
            values.push(data.content.trim());
        }

        if (data.options !== undefined) {
            updates.push(`options = $${paramCount++}`);
            values.push(JSON.stringify(data.options));
        }

        if (data.correct_answer !== undefined) {
            updates.push(`correct_answer = $${paramCount++}`);
            values.push(data.correct_answer.trim());
        }

        if (data.explanation !== undefined) {
            updates.push(`explanation = $${paramCount++}`);
            values.push(data.explanation.trim());
        }

        if (data.concept_id !== undefined) {
            updates.push(`concept_id = $${paramCount++}`);
            values.push(data.concept_id);
        }

        if (data.sub_concept !== undefined) {
            updates.push(`sub_concept = $${paramCount++}`);
            values.push(data.sub_concept?.trim() || null);
        }

        if (data.difficulty !== undefined) {
            updates.push(`difficulty = $${paramCount++}`);
            values.push(data.difficulty);
        }

        if (data.source !== undefined) {
            updates.push(`source = $${paramCount++}`);
            values.push(data.source.trim());
        }

        if (data.year_appeared !== undefined) {
            updates.push(`year_appeared = $${paramCount++}`);
            values.push(data.year_appeared || null);
        }

        if (updates.length === 0) {
            return this.getQuestionById(id);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await this.pool.query<QuestionRow>(
            `UPDATE questions SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToQuestion(result.rows[0]);
    }

    /**
     * Delete question
     */
    async deleteQuestion(id: string): Promise<boolean> {
        const result = await this.pool.query(
            'DELETE FROM questions WHERE id = $1',
            [id]
        );

        return result.rowCount !== null && result.rowCount > 0;
    }

    /**
     * Bulk import questions
     */
    async bulkImportQuestions(data: any): Promise<BulkImportResult> {
        const validated = validateBulkImport(data);
        const result: BulkImportResult = {
            total: validated.questions.length,
            successful: 0,
            failed: 0,
            errors: [],
        };

        for (let i = 0; i < validated.questions.length; i++) {
            const question = validated.questions[i];
            try {
                await this.createQuestion(question);
                result.successful++;
            } catch (error: any) {
                result.failed++;
                result.errors.push({
                    index: i,
                    question,
                    error: error.message || 'Unknown error',
                });
            }
        }

        return result;
    }

    /**
     * Get question count by concept
     */
    async getQuestionCountByConcept(conceptId: string): Promise<number> {
        const result = await this.pool.query(
            'SELECT COUNT(*) as count FROM questions WHERE concept_id = $1',
            [conceptId]
        );

        return parseInt(result.rows[0].count, 10);
    }

    /**
     * Get paginated questions with total count
     */
    async getPaginatedQuestions(
        page: number = 1,
        limit: number = 20,
        filters?: {
            concept_id?: string;
            difficulty?: string;
            year_appeared?: number;
        }
    ): Promise<{ questions: Question[]; total: number; page: number; totalPages: number }> {
        // Validate pagination parameters
        const validatedPage = Math.max(1, page);
        const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
        const offset = (validatedPage - 1) * validatedLimit;

        // Build WHERE clause
        let whereClause = 'WHERE 1=1';
        const countValues: any[] = [];
        const queryValues: any[] = [];
        let paramCount = 1;

        if (filters?.concept_id) {
            whereClause += ` AND concept_id = $${paramCount}`;
            countValues.push(filters.concept_id);
            queryValues.push(filters.concept_id);
            paramCount++;
        }

        if (filters?.difficulty) {
            whereClause += ` AND difficulty = $${paramCount}`;
            countValues.push(filters.difficulty);
            queryValues.push(filters.difficulty);
            paramCount++;
        }

        if (filters?.year_appeared) {
            whereClause += ` AND year_appeared = $${paramCount}`;
            countValues.push(filters.year_appeared);
            queryValues.push(filters.year_appeared);
            paramCount++;
        }

        // Get total count
        const countResult = await this.pool.query<{ count: string }>(
            `SELECT COUNT(*) as count FROM questions ${whereClause}`,
            countValues
        );
        const total = parseInt(countResult.rows[0].count, 10);

        // Get paginated results
        queryValues.push(validatedLimit, offset);
        const result = await this.pool.query<QuestionRow>(
            `SELECT * FROM questions ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`,
            queryValues
        );

        const questions = result.rows.map(row => this.mapRowToQuestion(row));
        const totalPages = Math.ceil(total / validatedLimit);

        return {
            questions,
            total,
            page: validatedPage,
            totalPages,
        };
    }

    /**
     * Verify concept exists
     */
    private async verifyConceptExists(conceptId: string): Promise<boolean> {
        const result = await this.pool.query(
            'SELECT id FROM concepts WHERE id = $1',
            [conceptId]
        );

        return result.rows.length > 0;
    }

    /**
     * Map database row to Question model
     */
    private mapRowToQuestion(row: QuestionRow): Question {
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
    }
}
