import { Pool } from 'pg';
import pool from '../config/database';
import { Concept, ConceptRow } from '../types/models';
import { ConceptInput, validateConcept, ValidationError } from '../utils/validation';

/**
 * Service for managing concepts
 */
export class ConceptService {
    private pool: Pool;

    constructor() {
        this.pool = pool;
    }

    /**
     * Create a new concept
     */
    async createConcept(data: ConceptInput): Promise<Concept> {
        validateConcept(data);

        try {
            const result = await this.pool.query<ConceptRow>(
                `INSERT INTO concepts (name, category, description)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [data.name.trim(), data.category.trim(), data.description?.trim() || '']
            );

            return this.mapRowToConcept(result.rows[0]);
        } catch (error: any) {
            if (error.code === '23505') { // Unique violation
                throw new ValidationError('A concept with this name already exists');
            }
            throw error;
        }
    }

    /**
     * Get all concepts
     */
    async getAllConcepts(): Promise<Concept[]> {
        const result = await this.pool.query<ConceptRow>(
            'SELECT * FROM concepts ORDER BY category, name'
        );

        return result.rows.map(row => this.mapRowToConcept(row));
    }

    /**
     * Get concept by ID
     */
    async getConceptById(id: string): Promise<Concept | null> {
        const result = await this.pool.query<ConceptRow>(
            'SELECT * FROM concepts WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToConcept(result.rows[0]);
    }

    /**
     * Update concept
     */
    async updateConcept(id: string, data: Partial<ConceptInput>): Promise<Concept | null> {
        // Validate only provided fields
        if (data.name !== undefined || data.category !== undefined) {
            validateConcept({
                name: data.name || 'placeholder',
                category: data.category || 'placeholder',
            });
        }

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (data.name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(data.name.trim());
        }

        if (data.category !== undefined) {
            updates.push(`category = $${paramCount++}`);
            values.push(data.category.trim());
        }

        if (data.description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(data.description.trim());
        }

        if (updates.length === 0) {
            // No updates provided, just return existing concept
            return this.getConceptById(id);
        }

        values.push(id);

        try {
            const result = await this.pool.query<ConceptRow>(
                `UPDATE concepts SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return null;
            }

            return this.mapRowToConcept(result.rows[0]);
        } catch (error: any) {
            if (error.code === '23505') { // Unique violation
                throw new ValidationError('A concept with this name already exists');
            }
            throw error;
        }
    }

    /**
     * Delete concept
     */
    async deleteConcept(id: string): Promise<boolean> {
        try {
            const result = await this.pool.query(
                'DELETE FROM concepts WHERE id = $1',
                [id]
            );

            return result.rowCount !== null && result.rowCount > 0;
        } catch (error: any) {
            if (error.code === '23503') { // Foreign key violation
                throw new ValidationError('Cannot delete concept that has associated questions');
            }
            throw error;
        }
    }

    /**
     * Get concepts by category
     */
    async getConceptsByCategory(category: string): Promise<Concept[]> {
        const result = await this.pool.query<ConceptRow>(
            'SELECT * FROM concepts WHERE category = $1 ORDER BY name',
            [category]
        );

        return result.rows.map(row => this.mapRowToConcept(row));
    }

    /**
     * Map database row to Concept model
     */
    private mapRowToConcept(row: ConceptRow): Concept {
        return {
            id: row.id,
            name: row.name,
            category: row.category,
            description: row.description,
            created_at: row.created_at,
        };
    }
}
