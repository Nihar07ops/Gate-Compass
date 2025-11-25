import { Pool } from 'pg';
import pool from '../config/database';
import redisClient from '../config/redis';
import { ConceptTrend, ConceptTrendRow } from '../types/models';

const CACHE_KEY_PREFIX = 'trends:';
const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

export interface ConceptRanking {
    concept_id: string;
    concept_name: string;
    rank: number;
    frequency: number;
    importance: number;
    yearly_distribution: Record<number, number>;
}

export interface TrendData {
    rankings: ConceptRanking[];
    last_updated: Date;
    total_questions: number;
}

/**
 * Service for analyzing question trends and concept importance
 */
export class TrendAnalysisService {
    private pool: Pool;

    constructor() {
        this.pool = pool;
    }

    /**
     * Analyze trends for all concepts based on question data
     * This is the main method that calculates frequency and importance
     */
    async analyzeTrends(): Promise<ConceptTrend[]> {
        // Get total question count
        const totalResult = await this.pool.query<{ count: string }>(
            'SELECT COUNT(*) as count FROM questions'
        );
        const totalQuestions = parseInt(totalResult.rows[0].count, 10);

        if (totalQuestions === 0) {
            return [];
        }

        // Get all concepts
        const conceptsResult = await this.pool.query<{ id: string; name: string }>(
            'SELECT id, name FROM concepts'
        );
        const concepts = conceptsResult.rows;

        const trends: ConceptTrend[] = [];

        for (const concept of concepts) {
            // Calculate frequency: count of questions for this concept / total questions
            const countResult = await this.pool.query<{ count: string }>(
                'SELECT COUNT(*) as count FROM questions WHERE concept_id = $1',
                [concept.id]
            );
            const conceptQuestionCount = parseInt(countResult.rows[0].count, 10);
            const frequency = conceptQuestionCount / totalQuestions;

            // Get yearly distribution
            const yearlyResult = await this.pool.query<{ year: number; count: string }>(
                `SELECT year_appeared as year, COUNT(*) as count 
                 FROM questions 
                 WHERE concept_id = $1 AND year_appeared IS NOT NULL
                 GROUP BY year_appeared
                 ORDER BY year_appeared`,
                [concept.id]
            );

            const yearlyDistribution: Record<number, number> = {};
            for (const row of yearlyResult.rows) {
                yearlyDistribution[row.year] = parseInt(row.count, 10);
            }

            // Calculate importance score
            // Importance is based on frequency and recency of questions
            const importance = this.calculateImportance(frequency, yearlyDistribution);

            // Check if trend already exists
            const existingResult = await this.pool.query<ConceptTrendRow>(
                'SELECT * FROM concept_trends WHERE concept_id = $1',
                [concept.id]
            );

            let trend: ConceptTrendRow;

            if (existingResult.rows.length > 0) {
                // Update existing trend
                const updateResult = await this.pool.query<ConceptTrendRow>(
                    `UPDATE concept_trends 
                     SET frequency = $1, importance = $2, yearly_distribution = $3, last_updated = CURRENT_TIMESTAMP
                     WHERE concept_id = $4
                     RETURNING *`,
                    [frequency, importance, JSON.stringify(yearlyDistribution), concept.id]
                );
                trend = updateResult.rows[0];
            } else {
                // Insert new trend
                const insertResult = await this.pool.query<ConceptTrendRow>(
                    `INSERT INTO concept_trends (concept_id, frequency, importance, yearly_distribution)
                     VALUES ($1, $2, $3, $4)
                     RETURNING *`,
                    [concept.id, frequency, importance, JSON.stringify(yearlyDistribution)]
                );
                trend = insertResult.rows[0];
            }

            trends.push(this.mapRowToConceptTrend(trend));
        }

        // Invalidate cache after updating trends
        await this.invalidateCache();

        return trends;
    }

    /**
     * Calculate importance score based on frequency and yearly distribution
     * Higher weight for recent years
     */
    private calculateImportance(frequency: number, yearlyDistribution: Record<number, number>): number {
        // Base importance is the frequency
        let importance = frequency;

        // If we have yearly data, adjust importance based on recency
        const years = Object.keys(yearlyDistribution).map(Number).sort((a, b) => b - a);

        if (years.length > 0) {
            const currentYear = new Date().getFullYear();
            let recencyBonus = 0;

            // Give higher weight to recent years
            for (const year of years) {
                const yearsAgo = currentYear - year;
                const count = yearlyDistribution[year];

                // Exponential decay: more recent years get higher weight
                // Weight decreases by 10% per year
                const weight = Math.pow(0.9, yearsAgo);
                recencyBonus += count * weight;
            }

            // Normalize recency bonus and add to importance
            const totalQuestions = Object.values(yearlyDistribution).reduce((sum, count) => sum + count, 0);
            if (totalQuestions > 0) {
                const normalizedRecency = recencyBonus / totalQuestions;
                importance = (frequency * 0.7) + (normalizedRecency * 0.3);
            }
        }

        return importance;
    }

    /**
     * Get concept rankings ordered by frequency
     */
    async getConceptRanking(): Promise<ConceptRanking[]> {
        const result = await this.pool.query<ConceptTrendRow & { concept_name: string }>(
            `SELECT ct.*, c.name as concept_name
             FROM concept_trends ct
             JOIN concepts c ON ct.concept_id = c.id
             ORDER BY ct.frequency DESC, ct.importance DESC`
        );

        return result.rows.map((row, index) => ({
            concept_id: row.concept_id,
            concept_name: row.concept_name,
            rank: index + 1,
            frequency: parseFloat(row.frequency.toString()),
            importance: parseFloat(row.importance.toString()),
            yearly_distribution: typeof row.yearly_distribution === 'string'
                ? JSON.parse(row.yearly_distribution)
                : row.yearly_distribution,
        }));
    }

    /**
     * Update trends with new question data
     * This is called when new questions are added
     */
    async updateTrendsWithNewData(): Promise<void> {
        await this.analyzeTrends();
    }

    /**
     * Get cached trends or fetch from database
     */
    async getCachedTrends(): Promise<TrendData | null> {
        try {
            // Try to get from cache
            const cached = await redisClient.get(`${CACHE_KEY_PREFIX}data`);

            if (cached) {
                return JSON.parse(cached);
            }

            // If not in cache, fetch from database and cache it
            const rankings = await this.getConceptRanking();

            if (rankings.length === 0) {
                return null;
            }

            const totalResult = await this.pool.query<{ count: string }>(
                'SELECT COUNT(*) as count FROM questions'
            );
            const totalQuestions = parseInt(totalResult.rows[0].count, 10);

            const trendData: TrendData = {
                rankings,
                last_updated: new Date(),
                total_questions: totalQuestions,
            };

            // Cache the data
            await redisClient.setEx(
                `${CACHE_KEY_PREFIX}data`,
                CACHE_TTL,
                JSON.stringify(trendData)
            );

            return trendData;
        } catch (error) {
            console.error('Error getting cached trends:', error);
            // If Redis fails, fall back to database
            const rankings = await this.getConceptRanking();

            if (rankings.length === 0) {
                return null;
            }

            const totalResult = await this.pool.query<{ count: string }>(
                'SELECT COUNT(*) as count FROM questions'
            );
            const totalQuestions = parseInt(totalResult.rows[0].count, 10);

            return {
                rankings,
                last_updated: new Date(),
                total_questions: totalQuestions,
            };
        }
    }

    /**
     * Invalidate trend cache
     */
    async invalidateCache(): Promise<void> {
        try {
            await redisClient.del(`${CACHE_KEY_PREFIX}data`);
        } catch (error) {
            console.error('Error invalidating cache:', error);
        }
    }

    /**
     * Map database row to ConceptTrend model
     */
    private mapRowToConceptTrend(row: ConceptTrendRow): ConceptTrend {
        return {
            id: row.id,
            concept_id: row.concept_id,
            frequency: parseFloat(row.frequency.toString()),
            importance: parseFloat(row.importance.toString()),
            yearly_distribution: typeof row.yearly_distribution === 'string'
                ? JSON.parse(row.yearly_distribution)
                : row.yearly_distribution,
            last_updated: row.last_updated,
        };
    }
}
