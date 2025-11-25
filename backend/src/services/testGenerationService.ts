import { Pool } from 'pg';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { Test, TestRow, Question, QuestionRow, Difficulty } from '../types/models';
import { TrendAnalysisService } from './trendAnalysisService';

export interface TestConfig {
    questionCount?: number;
    focusConcepts?: string[];
    difficultyDistribution?: DifficultyDistribution;
}

export interface DifficultyDistribution {
    easy: number;
    medium: number;
    hard: number;
}

const DEFAULT_QUESTION_COUNT = 65; // Standard GATE exam has 65 questions
const DEFAULT_DURATION = 10800; // 3 hours in seconds
const DEFAULT_DIFFICULTY_DISTRIBUTION: DifficultyDistribution = {
    easy: 0.3,
    medium: 0.5,
    hard: 0.2,
};

/**
 * Service for generating mock tests based on trend analysis
 */
export class TestGenerationService {
    private pool: Pool;
    private trendService: TrendAnalysisService;

    constructor() {
        this.pool = pool;
        this.trendService = new TrendAnalysisService();
    }

    /**
     * Generate a mock test for a user
     * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
     */
    async generateMockTest(_userId: string, config: TestConfig = {}): Promise<Test> {
        const questionCount = config.questionCount || DEFAULT_QUESTION_COUNT;
        const difficultyDistribution = config.difficultyDistribution || DEFAULT_DIFFICULTY_DISTRIBUTION;

        // Validate difficulty distribution
        this.validateDifficultyDistribution(difficultyDistribution);

        // Select questions based on trend analysis, difficulty distribution, and configuration
        const questions = await this.selectQuestionsByTrend(
            questionCount,
            config.focusConcepts,
            difficultyDistribution
        );

        // Ensure all questions have valid textbook sources
        this.ensureValidSources(questions);

        // Create test record in database
        const test = await this.createTest(questions);

        return test;
    }

    /**
     * Select questions based on trend analysis
     * Prioritizes high-importance concepts
     * Requirements: 3.1, 3.2
     */
    async selectQuestionsByTrend(count: number, focusConcepts?: string[], difficultyDistribution?: DifficultyDistribution): Promise<Question[]> {
        // Get concept rankings from trend analysis
        const rankings = await this.trendService.getConceptRanking();

        if (rankings.length === 0) {
            throw new Error('No trend data available. Please ensure questions have been added to the system.');
        }

        // Filter by focus concepts if specified
        const relevantRankings = focusConcepts && focusConcepts.length > 0
            ? rankings.filter(r => focusConcepts.includes(r.concept_id))
            : rankings;

        if (relevantRankings.length === 0) {
            throw new Error('No questions available for the specified concepts.');
        }

        // If difficulty distribution is specified, select questions with that distribution in mind
        if (difficultyDistribution) {
            return this.selectQuestionsWithDifficultyDistribution(
                relevantRankings,
                count,
                difficultyDistribution
            );
        }

        // Calculate how many questions to select from each concept
        // Higher importance concepts get more questions
        const conceptQuestionCounts = this.distributeQuestionsByConcept(relevantRankings, count);

        // Select questions for each concept, handling cases where a concept has fewer questions than requested
        const selectedQuestions: Question[] = [];
        const shortfall: Array<{ conceptId: string; requested: number; available: number }> = [];

        for (const [conceptId, requestedCount] of Object.entries(conceptQuestionCounts)) {
            const conceptQuestions = await this.getQuestionsByConcept(conceptId, requestedCount);
            selectedQuestions.push(...conceptQuestions);

            // Track shortfall if we didn't get enough questions
            if (conceptQuestions.length < requestedCount) {
                shortfall.push({
                    conceptId,
                    requested: requestedCount,
                    available: conceptQuestions.length
                });
            }
        }

        // If we have a shortfall, try to fill it from other concepts
        if (selectedQuestions.length < count) {
            const deficit = count - selectedQuestions.length;
            const usedConceptIds = new Set(Object.keys(conceptQuestionCounts));

            // Try to get additional questions from concepts that weren't fully utilized
            // or from concepts not in the original distribution
            const additionalQuestions = await this.fillShortfall(
                deficit,
                relevantRankings,
                usedConceptIds,
                selectedQuestions
            );

            selectedQuestions.push(...additionalQuestions);
        }

        // If we still don't have enough questions, throw an error
        if (selectedQuestions.length < count) {
            throw new Error(
                `Insufficient questions in question bank. Requested: ${count}, Available: ${selectedQuestions.length}`
            );
        }

        // Shuffle questions to randomize order
        return this.shuffleArray(selectedQuestions).slice(0, count);
    }

    /**
     * Select questions with both trend importance and difficulty distribution in mind
     * This ensures we can meet the difficulty distribution requirements
     */
    private async selectQuestionsWithDifficultyDistribution(
        rankings: Array<{ concept_id: string; importance: number }>,
        totalCount: number,
        distribution: DifficultyDistribution
    ): Promise<Question[]> {
        // Calculate target counts for each difficulty
        const targetCounts = {
            easy: Math.round(totalCount * distribution.easy),
            medium: Math.round(totalCount * distribution.medium),
            hard: Math.round(totalCount * distribution.hard),
        };

        // Adjust to ensure total matches (due to rounding)
        const totalTarget = targetCounts.easy + targetCounts.medium + targetCounts.hard;
        if (totalTarget !== totalCount) {
            const diff = totalCount - totalTarget;
            targetCounts.medium += diff; // Add/subtract difference to medium
        }

        const selectedQuestions: Question[] = [];
        const usedQuestionIds = new Set<string>();

        // Strategy: For each difficulty level, collect ALL available questions of that difficulty
        // from all concepts, then select the exact number needed while prioritizing high-importance concepts
        for (const [difficulty, targetCount] of Object.entries(targetCounts) as [Difficulty, number][]) {
            if (targetCount === 0) continue;

            // Collect all available questions of this difficulty from all concepts
            const availableQuestions: Array<{ question: Question; importance: number }> = [];

            for (const ranking of rankings) {
                const questions = await this.getQuestionsByConceptAndDifficulty(
                    ranking.concept_id,
                    difficulty,
                    100, // Get a large number to have options
                    usedQuestionIds
                );

                // Tag each question with its concept's importance
                questions.forEach(q => {
                    availableQuestions.push({
                        question: q,
                        importance: ranking.importance
                    });
                });
            }

            // Sort by importance (highest first) to prioritize high-importance concepts
            availableQuestions.sort((a, b) => b.importance - a.importance);

            // Select exactly the target count of questions
            const questionsToAdd = availableQuestions
                .slice(0, targetCount)
                .map(item => item.question);

            selectedQuestions.push(...questionsToAdd);
            questionsToAdd.forEach(q => usedQuestionIds.add(q.id));
        }

        // If we don't have enough questions to meet the distribution, fill the gap
        // with any available questions, prioritizing by concept importance
        if (selectedQuestions.length < totalCount) {
            const sortedRankings = [...rankings].sort((a, b) => b.importance - a.importance);

            for (const ranking of sortedRankings) {
                if (selectedQuestions.length >= totalCount) break;

                const remaining = totalCount - selectedQuestions.length;
                const additionalQuestions = await this.getQuestionsByConcept(
                    ranking.concept_id,
                    remaining * 2
                );

                const newQuestions = additionalQuestions.filter(q => !usedQuestionIds.has(q.id));
                const toAdd = newQuestions.slice(0, remaining);
                selectedQuestions.push(...toAdd);
                toAdd.forEach(q => usedQuestionIds.add(q.id));
            }
        }

        // If we still don't have enough, throw an error
        if (selectedQuestions.length < totalCount) {
            throw new Error(
                `Insufficient questions in question bank to meet difficulty distribution. ` +
                `Requested: ${totalCount}, Available: ${selectedQuestions.length}`
            );
        }

        // Return exactly the requested count
        return this.shuffleArray(selectedQuestions).slice(0, totalCount);
    }

    /**
     * Get questions by concept and difficulty
     */
    private async getQuestionsByConceptAndDifficulty(
        conceptId: string,
        difficulty: Difficulty,
        count: number,
        excludeIds: Set<string>
    ): Promise<Question[]> {
        // Get more than needed to account for exclusions
        const result = await this.pool.query<QuestionRow>(
            `SELECT * FROM questions 
             WHERE concept_id = $1 AND difficulty = $2
             ORDER BY RANDOM() 
             LIMIT $3`,
            [conceptId, difficulty, count * 3] // Request 3x to have buffer
        );

        const questions = result.rows
            .map(row => this.mapRowToQuestion(row))
            .filter(q => !excludeIds.has(q.id))
            .slice(0, count);

        return questions;
    }



    /**
     * Fill shortfall by getting additional questions from available concepts
     * Prioritizes high-importance concepts to maintain the importance-based distribution
     */
    private async fillShortfall(
        deficit: number,
        rankings: Array<{ concept_id: string; importance: number }>,
        _usedConceptIds: Set<string>,
        existingQuestions: Question[]
    ): Promise<Question[]> {
        const additionalQuestions: Question[] = [];
        const usedQuestionIds = new Set(existingQuestions.map(q => q.id));

        // Sort rankings by importance (highest first) to prioritize high-importance concepts
        const sortedRankings = [...rankings].sort((a, b) => b.importance - a.importance);

        // Try to get more questions from concepts in order of importance
        for (const ranking of sortedRankings) {
            if (additionalQuestions.length >= deficit) {
                break;
            }

            // Get all available questions from this concept
            const allConceptQuestions = await this.getQuestionsByConcept(
                ranking.concept_id,
                deficit * 2 // Request more than needed to have options
            );

            // Filter out questions we already have
            const newQuestions = allConceptQuestions.filter(q => !usedQuestionIds.has(q.id));

            // Add as many as we need
            const needed = deficit - additionalQuestions.length;
            const toAdd = newQuestions.slice(0, needed);
            additionalQuestions.push(...toAdd);
            toAdd.forEach(q => usedQuestionIds.add(q.id));
        }

        return additionalQuestions;
    }

    /**
     * Distribute questions across concepts based on importance
     * Uses a greedy algorithm that prioritizes high-importance concepts
     * This ensures that high-importance concepts always get more questions
     */
    private distributeQuestionsByConcept(
        rankings: Array<{ concept_id: string; importance: number }>,
        totalQuestions: number
    ): Record<string, number> {
        const distribution: Record<string, number> = {};

        // Calculate total importance
        const totalImportance = rankings.reduce((sum, r) => sum + r.importance, 0);

        if (totalImportance === 0) {
            // If no importance data, distribute evenly
            const questionsPerConcept = Math.ceil(totalQuestions / rankings.length);
            rankings.forEach(r => {
                distribution[r.concept_id] = questionsPerConcept;
            });
            return distribution;
        }

        // Calculate initial proportional distribution (as floating point)
        const proportions = rankings.map(ranking => ({
            concept_id: ranking.concept_id,
            importance: ranking.importance,
            idealCount: (ranking.importance / totalImportance) * totalQuestions,
            assignedCount: 0
        }));

        // Sort by importance (highest first) for greedy allocation
        proportions.sort((a, b) => b.importance - a.importance);

        // Greedy algorithm: Assign floor of ideal count first
        let remainingQuestions = totalQuestions;
        proportions.forEach(p => {
            const floorCount = Math.floor(p.idealCount);
            p.assignedCount = floorCount;
            remainingQuestions -= floorCount;
        });

        // Distribute remaining questions to concepts with highest fractional parts
        // This maintains the importance-based prioritization
        const fractionalParts = proportions.map(p => ({
            concept_id: p.concept_id,
            fractional: p.idealCount - p.assignedCount,
            assignedCount: p.assignedCount
        }));

        // Sort by fractional part (highest first), then by importance
        fractionalParts.sort((a, b) => {
            if (Math.abs(b.fractional - a.fractional) > 0.0001) {
                return b.fractional - a.fractional;
            }
            // If fractional parts are equal, prioritize by importance
            const aImportance = proportions.find(p => p.concept_id === a.concept_id)!.importance;
            const bImportance = proportions.find(p => p.concept_id === b.concept_id)!.importance;
            return bImportance - aImportance;
        });

        // Assign remaining questions
        for (let i = 0; i < remainingQuestions && i < fractionalParts.length; i++) {
            fractionalParts[i].assignedCount++;
        }

        // Build final distribution
        fractionalParts.forEach(p => {
            distribution[p.concept_id] = p.assignedCount;
        });

        return distribution;
    }

    /**
     * Get random questions for a specific concept
     */
    private async getQuestionsByConcept(conceptId: string, count: number): Promise<Question[]> {
        const result = await this.pool.query<QuestionRow>(
            `SELECT * FROM questions 
             WHERE concept_id = $1 
             ORDER BY RANDOM() 
             LIMIT $2`,
            [conceptId, count]
        );

        return result.rows.map(row => this.mapRowToQuestion(row));
    }

    /**
     * Balance question difficulty according to specified distribution
     * Requirements: 3.4
     */
    balanceQuestionDifficulty(
        questions: Question[],
        distribution: DifficultyDistribution
    ): Question[] {
        const totalQuestions = questions.length;

        // Calculate target counts for each difficulty
        const targetCounts = {
            easy: Math.round(totalQuestions * distribution.easy),
            medium: Math.round(totalQuestions * distribution.medium),
            hard: Math.round(totalQuestions * distribution.hard),
        };

        // Adjust to ensure total matches (due to rounding)
        const totalTarget = targetCounts.easy + targetCounts.medium + targetCounts.hard;
        if (totalTarget !== totalQuestions) {
            const diff = totalQuestions - totalTarget;
            targetCounts.medium += diff; // Add/subtract difference to medium
        }

        // Group questions by difficulty
        const questionsByDifficulty: Record<Difficulty, Question[]> = {
            easy: questions.filter(q => q.difficulty === 'easy'),
            medium: questions.filter(q => q.difficulty === 'medium'),
            hard: questions.filter(q => q.difficulty === 'hard'),
        };

        // Select questions according to target distribution
        const balancedQuestions: Question[] = [];

        for (const [difficulty, targetCount] of Object.entries(targetCounts) as [Difficulty, number][]) {
            const availableQuestions = questionsByDifficulty[difficulty];

            if (availableQuestions.length >= targetCount) {
                // We have enough questions of this difficulty
                balancedQuestions.push(...this.shuffleArray(availableQuestions).slice(0, targetCount));
            } else {
                // Not enough questions of this difficulty, use all available
                balancedQuestions.push(...availableQuestions);
            }
        }

        // If we don't have enough questions after balancing, fill with remaining questions
        if (balancedQuestions.length < totalQuestions) {
            const usedIds = new Set(balancedQuestions.map(q => q.id));
            const remainingQuestions = questions.filter(q => !usedIds.has(q.id));
            const needed = totalQuestions - balancedQuestions.length;
            balancedQuestions.push(...remainingQuestions.slice(0, needed));
        }

        return this.shuffleArray(balancedQuestions);
    }

    /**
     * Ensure all questions have valid textbook sources
     * Requirements: 3.3
     */
    private ensureValidSources(questions: Question[]): void {
        const invalidQuestions = questions.filter(q => !q.source || q.source.trim() === '');

        if (invalidQuestions.length > 0) {
            throw new Error(
                `Found ${invalidQuestions.length} questions without valid textbook sources. ` +
                `All questions must have a source reference.`
            );
        }
    }

    /**
     * Create test record in database
     */
    private async createTest(questions: Question[]): Promise<Test> {
        const questionIds = questions.map(q => q.id);

        const result = await this.pool.query<TestRow>(
            `INSERT INTO tests (question_ids, total_questions, duration)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [JSON.stringify(questionIds), questions.length, DEFAULT_DURATION]
        );

        return this.mapRowToTest(result.rows[0]);
    }

    /**
     * Create a test session for a user
     * Requirements: 3.5
     */
    async createTestSession(userId: string, testId: string): Promise<string> {
        // Verify test exists
        const testExists = await this.verifyTestExists(testId);
        if (!testExists) {
            throw new Error('Test not found');
        }

        // Generate unique session ID
        const sessionId = uuidv4();

        // Create test session
        await this.pool.query(
            `INSERT INTO test_sessions (id, user_id, test_id, status, total_time_spent)
             VALUES ($1, $2, $3, 'in_progress', 0)`,
            [sessionId, userId, testId]
        );

        return sessionId;
    }

    /**
     * Verify test exists
     */
    private async verifyTestExists(testId: string): Promise<boolean> {
        const result = await this.pool.query(
            'SELECT id FROM tests WHERE id = $1',
            [testId]
        );

        return result.rows.length > 0;
    }

    /**
     * Validate difficulty distribution
     */
    private validateDifficultyDistribution(distribution: DifficultyDistribution): void {
        const total = distribution.easy + distribution.medium + distribution.hard;
        const tolerance = 0.1; // 10% tolerance

        if (Math.abs(total - 1.0) > tolerance) {
            throw new Error(
                `Difficulty distribution must sum to 1.0 (±${tolerance}). Current sum: ${total}`
            );
        }

        if (distribution.easy < 0 || distribution.medium < 0 || distribution.hard < 0) {
            throw new Error('Difficulty distribution values must be non-negative');
        }
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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

    /**
     * Map database row to Test model
     */
    private mapRowToTest(row: TestRow): Test {
        return {
            id: row.id,
            question_ids: typeof row.question_ids === 'string'
                ? JSON.parse(row.question_ids)
                : row.question_ids,
            total_questions: row.total_questions,
            duration: row.duration,
            created_at: row.created_at,
        };
    }
}
