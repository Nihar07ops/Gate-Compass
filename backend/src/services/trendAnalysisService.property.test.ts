import * as fc from 'fast-check';
import pool from '../config/database';
import { Difficulty } from '../types/models';
import { TrendAnalysisService } from './trendAnalysisService';

// Feature: gate-compass, Property 5: Question categorization completeness
// **Validates: Requirements 2.1**
// For any set of previous years' questions processed by the system, every question
// should be assigned to exactly one primary concept.

describe('Trend Analysis Service - Property-Based Tests', () => {
    describe('Property 5: Question categorization completeness', () => {
        beforeAll(async () => {
            // Clean up test data before running tests
            try {
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_CONCEPT%']);
            } catch (error) {
                console.error('Error in beforeAll:', error);
            }
        }, 30000);

        afterEach(async () => {
            // Clean up test data after each test
            try {
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_CONCEPT%']);
            } catch (error) {
                console.error('Error in afterEach:', error);
            }
        }, 30000);

        afterAll(async () => {
            // Final cleanup
            try {
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_CONCEPT%']);
            } catch (error) {
                console.error('Error in afterAll:', error);
            }
        }, 30000);

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        });

        // Generator for difficulty levels
        const difficultyArb = fc.constantFrom<Difficulty>('easy', 'medium', 'hard');

        // Generator for valid questions with concept_id
        const questionArb = (conceptId: string) => fc.record({
            content: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
            options: fc.array(validOptionArb, { minLength: 2, maxLength: 4 }),
            correct_answer: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            explanation: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
            concept_id: fc.constant(conceptId),
            difficulty: difficultyArb,
            source: fc.constant('TEST_SOURCE_' + Math.random().toString(36).substring(7)),
            year_appeared: fc.option(fc.integer({ min: 2000, max: 2024 }), { nil: undefined }),
        });

        it('should assign exactly one concept to every question in the database', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
                        { minLength: 1, maxLength: 5 }
                    ),
                    fc.integer({ min: 1, max: 10 }),
                    async (conceptNames, questionCount) => {
                        try {
                            // Create unique concept names
                            const uniqueConceptNames = Array.from(new Set(conceptNames.map(name =>
                                'TEST_CONCEPT_' + name.replace(/[^a-zA-Z0-9]/g, '_')
                            )));

                            // Insert concepts into database
                            const conceptIds: string[] = [];
                            for (const conceptName of uniqueConceptNames) {
                                const result = await pool.query(
                                    `INSERT INTO concepts (name, category, description) 
                                     VALUES ($1, $2, $3) 
                                     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                                     RETURNING id`,
                                    [conceptName, 'TEST_CATEGORY', 'Test description']
                                );
                                conceptIds.push(result.rows[0].id);
                            }

                            // Generate and insert questions, each with exactly one concept
                            const insertedQuestionIds: string[] = [];
                            for (let i = 0; i < questionCount; i++) {
                                // Randomly assign a concept to each question
                                const conceptId = conceptIds[i % conceptIds.length];

                                const questionData = fc.sample(questionArb(conceptId), 1)[0];

                                const result = await pool.query(
                                    `INSERT INTO questions 
                                     (content, options, correct_answer, explanation, concept_id, difficulty, source, year_appeared)
                                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                     RETURNING id`,
                                    [
                                        questionData.content,
                                        JSON.stringify(questionData.options),
                                        questionData.correct_answer,
                                        questionData.explanation,
                                        questionData.concept_id,
                                        questionData.difficulty,
                                        questionData.source,
                                        questionData.year_appeared || null,
                                    ]
                                );
                                insertedQuestionIds.push(result.rows[0].id);
                            }

                            // Verify: Every question should have exactly one concept_id
                            const questionsResult = await pool.query(
                                `SELECT id, concept_id FROM questions WHERE id = ANY($1)`,
                                [insertedQuestionIds]
                            );

                            // Check that all questions were retrieved
                            expect(questionsResult.rows.length).toBe(questionCount);

                            // Check that every question has exactly one non-null concept_id
                            for (const row of questionsResult.rows) {
                                expect(row.concept_id).toBeDefined();
                                expect(row.concept_id).not.toBeNull();
                                expect(typeof row.concept_id).toBe('string');
                                expect(row.concept_id.length).toBeGreaterThan(0);

                                // Verify the concept_id is one of the valid concepts we created
                                expect(conceptIds).toContain(row.concept_id);
                            }

                            // Verify: No question should have multiple concept associations
                            // (This is enforced by the schema - concept_id is a single column, not an array)
                            const multiConceptCheck = await pool.query(
                                `SELECT id, concept_id FROM questions 
                                 WHERE id = ANY($1) AND concept_id IS NULL`,
                                [insertedQuestionIds]
                            );

                            expect(multiConceptCheck.rows.length).toBe(0);

                            // Clean up
                            await pool.query('DELETE FROM questions WHERE id = ANY($1)', [insertedQuestionIds]);
                            await pool.query('DELETE FROM concepts WHERE id = ANY($1)', [conceptIds]);
                        } catch (error) {
                            console.error('Error in property test:', error);
                            throw error;
                        }
                    }
                ),
                { numRuns: 100 }
            );
        }, 120000);
    });

    // Feature: gate-compass, Property 6: Frequency calculation correctness
    // **Validates: Requirements 2.2**
    // For any concept in the system, the calculated frequency metric should equal
    // the count of questions tagged with that concept divided by the total number
    // of questions, across all years.
    describe('Property 6: Frequency calculation correctness', () => {
        beforeAll(async () => {
            // Clean up test data before running tests
            try {
                await pool.query('DELETE FROM concept_trends WHERE concept_id IN (SELECT id FROM concepts WHERE name LIKE $1)', ['%TEST_FREQ_CONCEPT%']);
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_FREQ_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_FREQ_CONCEPT%']);
            } catch (error) {
                console.error('Error in beforeAll:', error);
            }
        }, 30000);

        afterEach(async () => {
            // Clean up test data after each test
            try {
                await pool.query('DELETE FROM concept_trends WHERE concept_id IN (SELECT id FROM concepts WHERE name LIKE $1)', ['%TEST_FREQ_CONCEPT%']);
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_FREQ_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_FREQ_CONCEPT%']);
            } catch (error) {
                console.error('Error in afterEach:', error);
            }
        }, 30000);

        afterAll(async () => {
            // Final cleanup
            try {
                await pool.query('DELETE FROM concept_trends WHERE concept_id IN (SELECT id FROM concepts WHERE name LIKE $1)', ['%TEST_FREQ_CONCEPT%']);
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_FREQ_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_FREQ_CONCEPT%']);
            } catch (error) {
                console.error('Error in afterAll:', error);
            }
        }, 30000);

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        });

        // Generator for difficulty levels
        const difficultyArb = fc.constantFrom<Difficulty>('easy', 'medium', 'hard');

        // Generator for valid questions with concept_id
        const questionArb = (conceptId: string, sourcePrefix: string) => fc.record({
            content: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
            options: fc.array(validOptionArb, { minLength: 2, maxLength: 4 }),
            correct_answer: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            explanation: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
            concept_id: fc.constant(conceptId),
            difficulty: difficultyArb,
            source: fc.constant(sourcePrefix + Math.random().toString(36).substring(7)),
            year_appeared: fc.option(fc.integer({ min: 2000, max: 2024 }), { nil: undefined }),
        });

        it('should calculate frequency as (concept question count / total questions)', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            conceptName: fc.string({ minLength: 5, maxLength: 30 }).filter(s => s.trim().length > 0),
                            questionCount: fc.integer({ min: 1, max: 20 })
                        }),
                        { minLength: 2, maxLength: 5 }
                    ),
                    async (conceptConfigs) => {
                        try {
                            // Create unique concept names
                            const uniqueConfigs = Array.from(
                                new Map(
                                    conceptConfigs.map(config => [
                                        'TEST_FREQ_CONCEPT_' + config.conceptName.replace(/[^a-zA-Z0-9]/g, '_'),
                                        config.questionCount
                                    ])
                                ).entries()
                            ).map(([name, count]) => ({ conceptName: name, questionCount: count }));

                            // Skip if we don't have at least 2 unique concepts
                            if (uniqueConfigs.length < 2) {
                                return true;
                            }

                            // Insert concepts into database
                            const conceptData: Array<{ id: string; name: string; questionCount: number }> = [];
                            for (const config of uniqueConfigs) {
                                const result = await pool.query(
                                    `INSERT INTO concepts (name, category, description) 
                                     VALUES ($1, $2, $3) 
                                     RETURNING id`,
                                    [config.conceptName, 'TEST_CATEGORY', 'Test description for frequency']
                                );
                                conceptData.push({
                                    id: result.rows[0].id,
                                    name: config.conceptName,
                                    questionCount: config.questionCount
                                });
                            }

                            // Generate and insert questions for each concept
                            let totalQuestions = 0;
                            const insertedQuestionIds: string[] = [];

                            for (const concept of conceptData) {
                                for (let i = 0; i < concept.questionCount; i++) {
                                    const questionData = fc.sample(questionArb(concept.id, 'TEST_FREQ_SOURCE_'), 1)[0];

                                    const result = await pool.query(
                                        `INSERT INTO questions 
                                         (content, options, correct_answer, explanation, concept_id, difficulty, source, year_appeared)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                         RETURNING id`,
                                        [
                                            questionData.content,
                                            JSON.stringify(questionData.options),
                                            questionData.correct_answer,
                                            questionData.explanation,
                                            questionData.concept_id,
                                            questionData.difficulty,
                                            questionData.source,
                                            questionData.year_appeared || null,
                                        ]
                                    );
                                    insertedQuestionIds.push(result.rows[0].id);
                                    totalQuestions++;
                                }
                            }

                            // Run trend analysis
                            const trendService = new TrendAnalysisService();
                            await trendService.analyzeTrends();

                            // Verify frequency calculation for each concept
                            for (const concept of conceptData) {
                                // Get the calculated frequency from the database
                                const trendResult = await pool.query(
                                    `SELECT frequency FROM concept_trends WHERE concept_id = $1`,
                                    [concept.id]
                                );

                                expect(trendResult.rows.length).toBe(1);
                                const calculatedFrequency = parseFloat(trendResult.rows[0].frequency);

                                // Calculate expected frequency
                                const expectedFrequency = concept.questionCount / totalQuestions;

                                // Verify the frequency matches (with small tolerance for floating point)
                                expect(Math.abs(calculatedFrequency - expectedFrequency)).toBeLessThan(0.0001);
                            }

                            // Clean up
                            await pool.query('DELETE FROM concept_trends WHERE concept_id = ANY($1)', [conceptData.map(c => c.id)]);
                            await pool.query('DELETE FROM questions WHERE id = ANY($1)', [insertedQuestionIds]);
                            await pool.query('DELETE FROM concepts WHERE id = ANY($1)', [conceptData.map(c => c.id)]);

                            return true;
                        } catch (error) {
                            console.error('Error in frequency calculation property test:', error);
                            throw error;
                        }
                    }
                ),
                { numRuns: 100 }
            );
        }, 120000);
    });

    // Feature: gate-compass, Property 7: Ranking monotonicity
    // **Validates: Requirements 2.3**
    // For any two concepts A and B, if concept A has higher frequency than concept B,
    // then concept A should be ranked higher (lower rank number) than concept B in the trend rankings.
    describe('Property 7: Ranking monotonicity', () => {
        beforeAll(async () => {
            // Clean up test data before running tests
            try {
                await pool.query('DELETE FROM concept_trends WHERE concept_id IN (SELECT id FROM concepts WHERE name LIKE $1)', ['%TEST_RANK_CONCEPT%']);
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_RANK_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_RANK_CONCEPT%']);
            } catch (error) {
                console.error('Error in beforeAll:', error);
            }
        }, 30000);

        afterEach(async () => {
            // Clean up test data after each test
            try {
                await pool.query('DELETE FROM concept_trends WHERE concept_id IN (SELECT id FROM concepts WHERE name LIKE $1)', ['%TEST_RANK_CONCEPT%']);
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_RANK_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_RANK_CONCEPT%']);
            } catch (error) {
                console.error('Error in afterEach:', error);
            }
        }, 30000);

        afterAll(async () => {
            // Final cleanup
            try {
                await pool.query('DELETE FROM concept_trends WHERE concept_id IN (SELECT id FROM concepts WHERE name LIKE $1)', ['%TEST_RANK_CONCEPT%']);
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_RANK_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_RANK_CONCEPT%']);
            } catch (error) {
                console.error('Error in afterAll:', error);
            }
        }, 30000);

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        });

        // Generator for difficulty levels
        const difficultyArb = fc.constantFrom<Difficulty>('easy', 'medium', 'hard');

        // Generator for valid questions with concept_id
        const questionArb = (conceptId: string, sourcePrefix: string) => fc.record({
            content: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
            options: fc.array(validOptionArb, { minLength: 2, maxLength: 4 }),
            correct_answer: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            explanation: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
            concept_id: fc.constant(conceptId),
            difficulty: difficultyArb,
            source: fc.constant(sourcePrefix + Math.random().toString(36).substring(7)),
            year_appeared: fc.option(fc.integer({ min: 2000, max: 2024 }), { nil: undefined }),
        });

        it('should rank concepts with higher frequency higher (lower rank number)', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            conceptName: fc.string({ minLength: 5, maxLength: 30 }).filter(s => s.trim().length > 0),
                            questionCount: fc.integer({ min: 1, max: 30 })
                        }),
                        { minLength: 3, maxLength: 6 }
                    ),
                    async (conceptConfigs) => {
                        try {
                            // Create unique concept names with random suffix to ensure uniqueness
                            const uniqueConfigs = Array.from(
                                new Map(
                                    conceptConfigs.map((config, index) => [
                                        'TEST_RANK_CONCEPT_' + config.conceptName.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Math.random().toString(36).substring(7) + '_' + index,
                                        config.questionCount
                                    ])
                                ).entries()
                            ).map(([name, count]) => ({ conceptName: name, questionCount: count }));

                            // Skip if we don't have at least 3 unique concepts
                            if (uniqueConfigs.length < 3) {
                                return true;
                            }

                            // Insert concepts into database
                            const conceptData: Array<{ id: string; name: string; questionCount: number }> = [];
                            for (const config of uniqueConfigs) {
                                const result = await pool.query(
                                    `INSERT INTO concepts (name, category, description) 
                                     VALUES ($1, $2, $3) 
                                     RETURNING id`,
                                    [config.conceptName, 'TEST_CATEGORY', 'Test description for ranking']
                                );
                                conceptData.push({
                                    id: result.rows[0].id,
                                    name: config.conceptName,
                                    questionCount: config.questionCount
                                });
                            }

                            // Generate and insert questions for each concept
                            const insertedQuestionIds: string[] = [];

                            for (const concept of conceptData) {
                                for (let i = 0; i < concept.questionCount; i++) {
                                    const questionData = fc.sample(questionArb(concept.id, 'TEST_RANK_SOURCE_'), 1)[0];

                                    const result = await pool.query(
                                        `INSERT INTO questions 
                                         (content, options, correct_answer, explanation, concept_id, difficulty, source, year_appeared)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                         RETURNING id`,
                                        [
                                            questionData.content,
                                            JSON.stringify(questionData.options),
                                            questionData.correct_answer,
                                            questionData.explanation,
                                            questionData.concept_id,
                                            questionData.difficulty,
                                            questionData.source,
                                            questionData.year_appeared || null,
                                        ]
                                    );
                                    insertedQuestionIds.push(result.rows[0].id);
                                }
                            }

                            // Run trend analysis
                            const trendService = new TrendAnalysisService();
                            await trendService.analyzeTrends();

                            // Get concept rankings
                            const rankings = await trendService.getConceptRanking();

                            // Build a map of concept_id to ranking data
                            const rankingMap = new Map(
                                rankings.map(r => [r.concept_id, { rank: r.rank, frequency: r.frequency }])
                            );

                            // Verify monotonicity: for any two concepts, if A has higher frequency than B,
                            // then A should have a lower rank number (higher ranking) than B
                            for (let i = 0; i < conceptData.length; i++) {
                                for (let j = i + 1; j < conceptData.length; j++) {
                                    const conceptA = conceptData[i];
                                    const conceptB = conceptData[j];

                                    const rankingA = rankingMap.get(conceptA.id);
                                    const rankingB = rankingMap.get(conceptB.id);

                                    // Both concepts should have rankings
                                    expect(rankingA).toBeDefined();
                                    expect(rankingB).toBeDefined();

                                    if (rankingA && rankingB) {
                                        // If concept A has higher frequency than B
                                        if (rankingA.frequency > rankingB.frequency) {
                                            // Then A should have a lower rank number (higher ranking)
                                            expect(rankingA.rank).toBeLessThan(rankingB.rank);
                                        }
                                        // If concept B has higher frequency than A
                                        else if (rankingB.frequency > rankingA.frequency) {
                                            // Then B should have a lower rank number (higher ranking)
                                            expect(rankingB.rank).toBeLessThan(rankingA.rank);
                                        }
                                        // If frequencies are equal, ranks can be in any order (tie)
                                        // No assertion needed for equal frequencies
                                    }
                                }
                            }

                            // Clean up
                            await pool.query('DELETE FROM concept_trends WHERE concept_id = ANY($1)', [conceptData.map(c => c.id)]);
                            await pool.query('DELETE FROM questions WHERE id = ANY($1)', [insertedQuestionIds]);
                            await pool.query('DELETE FROM concepts WHERE id = ANY($1)', [conceptData.map(c => c.id)]);

                            return true;
                        } catch (error) {
                            console.error('Error in ranking monotonicity property test:', error);
                            throw error;
                        }
                    }
                ),
                { numRuns: 100 }
            );
        }, 120000);
    });

    // Feature: gate-compass, Property 8: Trend display completeness
    // **Validates: Requirements 2.4**
    // For any concept in the trend rankings, the displayed trend data should include
    // the concept name, frequency, importance score, and yearly distribution.
    describe('Property 8: Trend display completeness', () => {
        beforeAll(async () => {
            // Clean up test data before running tests
            try {
                await pool.query('DELETE FROM concept_trends WHERE concept_id IN (SELECT id FROM concepts WHERE name LIKE $1)', ['%TEST_DISPLAY_CONCEPT%']);
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_DISPLAY_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_DISPLAY_CONCEPT%']);
            } catch (error) {
                console.error('Error in beforeAll:', error);
            }
        }, 30000);

        afterEach(async () => {
            // Clean up test data after each test
            try {
                await pool.query('DELETE FROM concept_trends WHERE concept_id IN (SELECT id FROM concepts WHERE name LIKE $1)', ['%TEST_DISPLAY_CONCEPT%']);
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_DISPLAY_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_DISPLAY_CONCEPT%']);
            } catch (error) {
                console.error('Error in afterEach:', error);
            }
        }, 30000);

        afterAll(async () => {
            // Final cleanup
            try {
                await pool.query('DELETE FROM concept_trends WHERE concept_id IN (SELECT id FROM concepts WHERE name LIKE $1)', ['%TEST_DISPLAY_CONCEPT%']);
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_DISPLAY_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_DISPLAY_CONCEPT%']);
            } catch (error) {
                console.error('Error in afterAll:', error);
            }
        }, 30000);

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        });

        // Generator for difficulty levels
        const difficultyArb = fc.constantFrom<Difficulty>('easy', 'medium', 'hard');

        // Generator for valid questions with concept_id and year
        const questionArb = (conceptId: string, sourcePrefix: string) => fc.record({
            content: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
            options: fc.array(validOptionArb, { minLength: 2, maxLength: 4 }),
            correct_answer: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            explanation: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
            concept_id: fc.constant(conceptId),
            difficulty: difficultyArb,
            source: fc.constant(sourcePrefix + Math.random().toString(36).substring(7)),
            year_appeared: fc.integer({ min: 2015, max: 2024 }), // Always include year for this test
        });

        it('should include concept name, frequency, importance, and yearly distribution in trend data', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            conceptName: fc.string({ minLength: 5, maxLength: 30 }).filter(s => s.trim().length > 0),
                            questionCount: fc.integer({ min: 2, max: 15 })
                        }),
                        { minLength: 2, maxLength: 5 }
                    ),
                    async (conceptConfigs) => {
                        try {
                            // Create unique concept names
                            const uniqueConfigs = Array.from(
                                new Map(
                                    conceptConfigs.map((config, index) => [
                                        'TEST_DISPLAY_CONCEPT_' + config.conceptName.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Math.random().toString(36).substring(7) + '_' + index,
                                        config.questionCount
                                    ])
                                ).entries()
                            ).map(([name, count]) => ({ conceptName: name, questionCount: count }));

                            // Skip if we don't have at least 2 unique concepts
                            if (uniqueConfigs.length < 2) {
                                return true;
                            }

                            // Insert concepts into database
                            const conceptData: Array<{ id: string; name: string; questionCount: number }> = [];
                            for (const config of uniqueConfigs) {
                                const result = await pool.query(
                                    `INSERT INTO concepts (name, category, description) 
                                     VALUES ($1, $2, $3) 
                                     RETURNING id`,
                                    [config.conceptName, 'TEST_CATEGORY', 'Test description for display']
                                );
                                conceptData.push({
                                    id: result.rows[0].id,
                                    name: config.conceptName,
                                    questionCount: config.questionCount
                                });
                            }

                            // Generate and insert questions for each concept with years
                            const insertedQuestionIds: string[] = [];

                            for (const concept of conceptData) {
                                for (let i = 0; i < concept.questionCount; i++) {
                                    const questionData = fc.sample(questionArb(concept.id, 'TEST_DISPLAY_SOURCE_'), 1)[0];

                                    const result = await pool.query(
                                        `INSERT INTO questions 
                                         (content, options, correct_answer, explanation, concept_id, difficulty, source, year_appeared)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                         RETURNING id`,
                                        [
                                            questionData.content,
                                            JSON.stringify(questionData.options),
                                            questionData.correct_answer,
                                            questionData.explanation,
                                            questionData.concept_id,
                                            questionData.difficulty,
                                            questionData.source,
                                            questionData.year_appeared,
                                        ]
                                    );
                                    insertedQuestionIds.push(result.rows[0].id);
                                }
                            }

                            // Run trend analysis
                            const trendService = new TrendAnalysisService();
                            await trendService.analyzeTrends();

                            // Get concept rankings (this is what gets displayed to users)
                            const rankings = await trendService.getConceptRanking();

                            // Filter to only our test concepts
                            const testRankings = rankings.filter(r =>
                                conceptData.some(c => c.id === r.concept_id)
                            );

                            // Verify that we have rankings for all our test concepts
                            expect(testRankings.length).toBe(conceptData.length);

                            // For each concept in the trend rankings, verify all required fields are present
                            for (const ranking of testRankings) {
                                // 1. Concept name should be present and non-empty
                                expect(ranking.concept_name).toBeDefined();
                                expect(typeof ranking.concept_name).toBe('string');
                                expect(ranking.concept_name.length).toBeGreaterThan(0);

                                // Verify it matches one of our test concepts
                                const matchingConcept = conceptData.find(c => c.id === ranking.concept_id);
                                expect(matchingConcept).toBeDefined();
                                expect(ranking.concept_name).toBe(matchingConcept!.name);

                                // 2. Frequency should be present and valid (between 0 and 1)
                                expect(ranking.frequency).toBeDefined();
                                expect(typeof ranking.frequency).toBe('number');
                                expect(ranking.frequency).toBeGreaterThan(0);
                                expect(ranking.frequency).toBeLessThanOrEqual(1);
                                expect(isFinite(ranking.frequency)).toBe(true);

                                // 3. Importance score should be present and valid (between 0 and 1)
                                expect(ranking.importance).toBeDefined();
                                expect(typeof ranking.importance).toBe('number');
                                expect(ranking.importance).toBeGreaterThan(0);
                                expect(ranking.importance).toBeLessThanOrEqual(1);
                                expect(isFinite(ranking.importance)).toBe(true);

                                // 4. Yearly distribution should be present and valid
                                expect(ranking.yearly_distribution).toBeDefined();
                                expect(typeof ranking.yearly_distribution).toBe('object');
                                expect(ranking.yearly_distribution).not.toBeNull();

                                // Yearly distribution should be a non-empty object (since all questions have years)
                                const years = Object.keys(ranking.yearly_distribution);
                                expect(years.length).toBeGreaterThan(0);

                                // Each year should be a valid number and each count should be positive
                                for (const year of years) {
                                    const yearNum = parseInt(year, 10);
                                    expect(isNaN(yearNum)).toBe(false);
                                    expect(yearNum).toBeGreaterThanOrEqual(2015);
                                    expect(yearNum).toBeLessThanOrEqual(2024);

                                    const count = ranking.yearly_distribution[yearNum];
                                    expect(typeof count).toBe('number');
                                    expect(count).toBeGreaterThan(0);
                                    expect(Number.isInteger(count)).toBe(true);
                                }

                                // Verify the sum of yearly distribution equals the question count for this concept
                                const totalFromDistribution = Object.values(ranking.yearly_distribution)
                                    .reduce((sum, count) => sum + count, 0);
                                expect(totalFromDistribution).toBe(matchingConcept!.questionCount);
                            }

                            // Clean up
                            await pool.query('DELETE FROM concept_trends WHERE concept_id = ANY($1)', [conceptData.map(c => c.id)]);
                            await pool.query('DELETE FROM questions WHERE id = ANY($1)', [insertedQuestionIds]);
                            await pool.query('DELETE FROM concepts WHERE id = ANY($1)', [conceptData.map(c => c.id)]);

                            return true;
                        } catch (error) {
                            console.error('Error in trend display completeness property test:', error);
                            throw error;
                        }
                    }
                ),
                { numRuns: 100 }
            );
        }, 120000);
    });

    // Feature: gate-compass, Property 9: Trend freshness
    // **Validates: Requirements 2.5, 8.4**
    // For any addition of new previous years' questions to the system, the trend analysis
    // should be updated to include these questions in frequency and importance calculations.
    describe('Property 9: Trend freshness', () => {
        beforeAll(async () => {
            // Clean up test data before running tests
            try {
                await pool.query('DELETE FROM concept_trends WHERE concept_id IN (SELECT id FROM concepts WHERE name LIKE $1)', ['%TEST_FRESH_CONCEPT%']);
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_FRESH_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_FRESH_CONCEPT%']);
            } catch (error) {
                console.error('Error in beforeAll:', error);
            }
        }, 30000);

        afterEach(async () => {
            // Clean up test data after each test
            try {
                await pool.query('DELETE FROM concept_trends WHERE concept_id IN (SELECT id FROM concepts WHERE name LIKE $1)', ['%TEST_FRESH_CONCEPT%']);
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_FRESH_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_FRESH_CONCEPT%']);
            } catch (error) {
                console.error('Error in afterEach:', error);
            }
        }, 30000);

        afterAll(async () => {
            // Final cleanup
            try {
                await pool.query('DELETE FROM concept_trends WHERE concept_id IN (SELECT id FROM concepts WHERE name LIKE $1)', ['%TEST_FRESH_CONCEPT%']);
                await pool.query('DELETE FROM questions WHERE source LIKE $1', ['%TEST_FRESH_SOURCE%']);
                await pool.query('DELETE FROM concepts WHERE name LIKE $1', ['%TEST_FRESH_CONCEPT%']);
            } catch (error) {
                console.error('Error in afterAll:', error);
            }
        }, 30000);

        // Generator for valid question options
        const validOptionArb = fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            text: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        });

        // Generator for difficulty levels
        const difficultyArb = fc.constantFrom<Difficulty>('easy', 'medium', 'hard');

        // Generator for valid questions with concept_id
        const questionArb = (conceptId: string, sourcePrefix: string) => fc.record({
            content: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
            options: fc.array(validOptionArb, { minLength: 2, maxLength: 4 }),
            correct_answer: fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
            explanation: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
            concept_id: fc.constant(conceptId),
            difficulty: difficultyArb,
            source: fc.constant(sourcePrefix + Math.random().toString(36).substring(7)),
            year_appeared: fc.option(fc.integer({ min: 2000, max: 2024 }), { nil: undefined }),
        });

        it('should update trend analysis to include new questions in frequency and importance calculations', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.array(
                        fc.record({
                            conceptName: fc.string({ minLength: 5, maxLength: 30 }).filter(s => s.trim().length > 0),
                            initialQuestionCount: fc.integer({ min: 2, max: 10 }),
                            additionalQuestionCount: fc.integer({ min: 1, max: 10 })
                        }),
                        { minLength: 2, maxLength: 4 }
                    ),
                    async (conceptConfigs) => {
                        try {
                            // Create unique concept names
                            const uniqueConfigs = Array.from(
                                new Map(
                                    conceptConfigs.map((config, index) => [
                                        'TEST_FRESH_CONCEPT_' + config.conceptName.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Math.random().toString(36).substring(7) + '_' + index,
                                        { initialQuestionCount: config.initialQuestionCount, additionalQuestionCount: config.additionalQuestionCount }
                                    ])
                                ).entries()
                            ).map(([name, counts]) => ({ conceptName: name, ...counts }));

                            // Skip if we don't have at least 2 unique concepts
                            if (uniqueConfigs.length < 2) {
                                return true;
                            }

                            // Insert concepts into database
                            const conceptData: Array<{ id: string; name: string; initialQuestionCount: number; additionalQuestionCount: number }> = [];
                            for (const config of uniqueConfigs) {
                                const result = await pool.query(
                                    `INSERT INTO concepts (name, category, description) 
                                     VALUES ($1, $2, $3) 
                                     RETURNING id`,
                                    [config.conceptName, 'TEST_CATEGORY', 'Test description for freshness']
                                );
                                conceptData.push({
                                    id: result.rows[0].id,
                                    name: config.conceptName,
                                    initialQuestionCount: config.initialQuestionCount,
                                    additionalQuestionCount: config.additionalQuestionCount
                                });
                            }

                            // Phase 1: Insert initial set of questions
                            const insertedQuestionIds: string[] = [];
                            let initialTotalQuestions = 0;

                            for (const concept of conceptData) {
                                for (let i = 0; i < concept.initialQuestionCount; i++) {
                                    const questionData = fc.sample(questionArb(concept.id, 'TEST_FRESH_SOURCE_INITIAL_'), 1)[0];

                                    const result = await pool.query(
                                        `INSERT INTO questions 
                                         (content, options, correct_answer, explanation, concept_id, difficulty, source, year_appeared)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                         RETURNING id`,
                                        [
                                            questionData.content,
                                            JSON.stringify(questionData.options),
                                            questionData.correct_answer,
                                            questionData.explanation,
                                            questionData.concept_id,
                                            questionData.difficulty,
                                            questionData.source,
                                            questionData.year_appeared || null,
                                        ]
                                    );
                                    insertedQuestionIds.push(result.rows[0].id);
                                    initialTotalQuestions++;
                                }
                            }

                            // Run initial trend analysis
                            const trendService = new TrendAnalysisService();
                            await trendService.analyzeTrends();

                            // Capture initial trend data
                            const initialTrends = new Map<string, { frequency: number; importance: number }>();
                            for (const concept of conceptData) {
                                const trendResult = await pool.query(
                                    `SELECT frequency, importance FROM concept_trends WHERE concept_id = $1`,
                                    [concept.id]
                                );

                                expect(trendResult.rows.length).toBe(1);
                                initialTrends.set(concept.id, {
                                    frequency: parseFloat(trendResult.rows[0].frequency),
                                    importance: parseFloat(trendResult.rows[0].importance)
                                });

                                // Verify initial frequency calculation
                                const expectedInitialFrequency = concept.initialQuestionCount / initialTotalQuestions;
                                expect(Math.abs(initialTrends.get(concept.id)!.frequency - expectedInitialFrequency)).toBeLessThan(0.0001);
                            }

                            // Phase 2: Add new questions to the system
                            const newTotalQuestions = initialTotalQuestions + conceptData.reduce((sum, c) => sum + c.additionalQuestionCount, 0);

                            for (const concept of conceptData) {
                                for (let i = 0; i < concept.additionalQuestionCount; i++) {
                                    const questionData = fc.sample(questionArb(concept.id, 'TEST_FRESH_SOURCE_NEW_'), 1)[0];

                                    const result = await pool.query(
                                        `INSERT INTO questions 
                                         (content, options, correct_answer, explanation, concept_id, difficulty, source, year_appeared)
                                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                         RETURNING id`,
                                        [
                                            questionData.content,
                                            JSON.stringify(questionData.options),
                                            questionData.correct_answer,
                                            questionData.explanation,
                                            questionData.concept_id,
                                            questionData.difficulty,
                                            questionData.source,
                                            questionData.year_appeared || null,
                                        ]
                                    );
                                    insertedQuestionIds.push(result.rows[0].id);
                                }
                            }

                            // Update trends with new data (this simulates Requirements 2.5 and 8.4)
                            await trendService.updateTrendsWithNewData();

                            // Phase 3: Verify that trends have been updated to include new questions
                            for (const concept of conceptData) {
                                const updatedTrendResult = await pool.query(
                                    `SELECT frequency, importance FROM concept_trends WHERE concept_id = $1`,
                                    [concept.id]
                                );

                                expect(updatedTrendResult.rows.length).toBe(1);
                                const updatedFrequency = parseFloat(updatedTrendResult.rows[0].frequency);
                                const updatedImportance = parseFloat(updatedTrendResult.rows[0].importance);

                                // Calculate expected new frequency
                                const totalQuestionsForConcept = concept.initialQuestionCount + concept.additionalQuestionCount;
                                const expectedNewFrequency = totalQuestionsForConcept / newTotalQuestions;

                                // Verify the frequency has been updated to reflect new questions
                                expect(Math.abs(updatedFrequency - expectedNewFrequency)).toBeLessThan(0.0001);

                                // Verify that the frequency has changed from the initial value
                                // (unless by coincidence the proportions stayed exactly the same)
                                const initialFrequency = initialTrends.get(concept.id)!.frequency;

                                // The frequency should change unless the proportion stayed exactly the same
                                // We check if the new frequency correctly reflects the new total
                                const frequencyChanged = Math.abs(updatedFrequency - initialFrequency) > 0.0001;
                                const proportionStayedSame = Math.abs(
                                    (concept.initialQuestionCount / initialTotalQuestions) -
                                    (totalQuestionsForConcept / newTotalQuestions)
                                ) < 0.0001;

                                // Either the frequency changed, or the proportion stayed the same
                                expect(frequencyChanged || proportionStayedSame).toBe(true);

                                // Verify importance is recalculated (it should be a valid number)
                                expect(updatedImportance).toBeGreaterThan(0);
                                expect(updatedImportance).toBeLessThanOrEqual(1);
                                expect(isFinite(updatedImportance)).toBe(true);
                            }

                            // Clean up
                            await pool.query('DELETE FROM concept_trends WHERE concept_id = ANY($1)', [conceptData.map(c => c.id)]);
                            await pool.query('DELETE FROM questions WHERE id = ANY($1)', [insertedQuestionIds]);
                            await pool.query('DELETE FROM concepts WHERE id = ANY($1)', [conceptData.map(c => c.id)]);

                            return true;
                        } catch (error) {
                            console.error('Error in trend freshness property test:', error);
                            throw error;
                        }
                    }
                ),
                { numRuns: 100 }
            );
        }, 120000);
    });
});
