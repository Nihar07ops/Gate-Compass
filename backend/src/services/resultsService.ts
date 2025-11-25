import { Pool } from 'pg';
import pool from '../config/database';
import {
    TestResult,
    TestResultRow,
    ConceptPerformance,
    Feedback,
    ConceptWeakness,
    Recommendation,
    TestSessionRow,
    SessionAnswerRow,
    QuestionTimeRow,
    QuestionRow,
    ConceptRow,
} from '../types/models';

const WEAK_CONCEPT_THRESHOLD = 0.6; // 60% accuracy threshold

/**
 * Service for calculating test results and generating analytics
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */
export class ResultsService {
    private pool: Pool;

    constructor() {
        this.pool = pool;
    }

    /**
     * Calculate score and generate complete test result
     * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
     */
    async calculateScore(sessionId: string): Promise<TestResult> {
        // Get session details
        const sessionResult = await this.pool.query<TestSessionRow>(
            `SELECT * FROM test_sessions WHERE id = $1`,
            [sessionId]
        );

        if (sessionResult.rows.length === 0) {
            throw new Error('Test session not found');
        }

        const session = sessionResult.rows[0];

        // Verify session is completed
        if (session.status === 'in_progress') {
            throw new Error('Test session is still in progress');
        }

        // Get test details
        const testResult = await this.pool.query(
            `SELECT * FROM tests WHERE id = $1`,
            [session.test_id]
        );

        if (testResult.rows.length === 0) {
            throw new Error('Test not found');
        }

        const test = testResult.rows[0];
        const questionIds = typeof test.question_ids === 'string'
            ? JSON.parse(test.question_ids)
            : test.question_ids;

        // Get all questions with correct answers
        const questionsResult = await this.pool.query<QuestionRow>(
            `SELECT * FROM questions WHERE id = ANY($1::uuid[])`,
            [questionIds]
        );

        const questions = questionsResult.rows;

        // Get user's answers
        const answersResult = await this.pool.query<SessionAnswerRow>(
            `SELECT * FROM session_answers WHERE session_id = $1`,
            [sessionId]
        );

        const userAnswers = new Map(
            answersResult.rows.map(row => [row.question_id, row.selected_answer])
        );

        // Get question times
        const timesResult = await this.pool.query<QuestionTimeRow>(
            `SELECT * FROM question_times WHERE session_id = $1`,
            [sessionId]
        );

        const questionTimes = new Map(
            timesResult.rows.map(row => [row.question_id, row.time_spent])
        );

        // Calculate scores
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let unanswered = 0;

        const questionsByAnswer = questions.map(q => {
            const userAnswer = userAnswers.get(q.id);
            const isCorrect = userAnswer === q.correct_answer;

            if (!userAnswer) {
                unanswered++;
            } else if (isCorrect) {
                correctAnswers++;
            } else {
                incorrectAnswers++;
            }

            return {
                question: q,
                userAnswer,
                isCorrect,
                timeSpent: questionTimes.get(q.id) || 0,
            };
        });

        const totalQuestions = questions.length;
        const score = correctAnswers;
        const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

        // Analyze concept-wise performance
        const conceptPerformance = await this.analyzeConceptPerformance(
            questionsByAnswer,
            questions
        );

        // Generate feedback
        const feedback = await this.generateFeedback(conceptPerformance, percentage);

        // Create test result
        const resultId = await this.saveTestResult({
            session_id: sessionId,
            user_id: session.user_id,
            score,
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            incorrect_answers: incorrectAnswers,
            unanswered,
            percentage,
            concept_performance: conceptPerformance,
            feedback,
        });

        return {
            id: resultId,
            session_id: sessionId,
            user_id: session.user_id,
            score,
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            incorrect_answers: incorrectAnswers,
            unanswered,
            percentage,
            concept_performance: conceptPerformance,
            feedback,
            created_at: new Date(),
        };
    }

    /**
     * Analyze concept-wise performance
     * Requirements: 7.3
     */
    private async analyzeConceptPerformance(
        questionsByAnswer: Array<{
            question: QuestionRow;
            userAnswer: string | undefined;
            isCorrect: boolean;
            timeSpent: number;
        }>,
        questions: QuestionRow[]
    ): Promise<ConceptPerformance[]> {
        // Get all unique concept IDs
        const conceptIds = [...new Set(questions.map(q => q.concept_id))];

        // Get concept details
        const conceptsResult = await this.pool.query<ConceptRow>(
            `SELECT * FROM concepts WHERE id = ANY($1::uuid[])`,
            [conceptIds]
        );

        const conceptsMap = new Map(
            conceptsResult.rows.map(c => [c.id, c])
        );

        // Group questions by concept
        const conceptGroups = new Map<string, typeof questionsByAnswer>();

        for (const item of questionsByAnswer) {
            const conceptId = item.question.concept_id;
            if (!conceptGroups.has(conceptId)) {
                conceptGroups.set(conceptId, []);
            }
            conceptGroups.get(conceptId)!.push(item);
        }

        // Calculate performance for each concept
        const performance: ConceptPerformance[] = [];

        for (const [conceptId, items] of conceptGroups) {
            const concept = conceptsMap.get(conceptId);
            if (!concept) continue;

            const totalQuestions = items.length;
            const correctAnswers = items.filter(item => item.isCorrect).length;
            const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;

            // Calculate average time per question (only for answered questions)
            const answeredItems = items.filter(item => item.userAnswer !== undefined);
            const totalTime = answeredItems.reduce((sum, item) => sum + item.timeSpent, 0);
            const averageTimePerQuestion = answeredItems.length > 0
                ? totalTime / answeredItems.length
                : 0;

            performance.push({
                concept_id: conceptId,
                concept_name: concept.name,
                total_questions: totalQuestions,
                correct_answers: correctAnswers,
                accuracy,
                average_time_per_question: averageTimePerQuestion,
            });
        }

        // Sort by accuracy (ascending) to highlight weak areas first
        return performance.sort((a, b) => a.accuracy - b.accuracy);
    }

    /**
     * Generate personalized feedback
     * Requirements: 7.4, 7.5
     */
    private async generateFeedback(
        conceptPerformance: ConceptPerformance[],
        overallPercentage: number
    ): Promise<Feedback> {
        // Generate overall message
        let overallMessage = '';
        if (overallPercentage >= 80) {
            overallMessage = 'Excellent performance! You have a strong grasp of most concepts.';
        } else if (overallPercentage >= 60) {
            overallMessage = 'Good effort! With focused practice on weak areas, you can improve significantly.';
        } else if (overallPercentage >= 40) {
            overallMessage = 'You need more practice. Focus on understanding fundamental concepts.';
        } else {
            overallMessage = 'Significant improvement needed. Consider revisiting the basics and practicing regularly.';
        }

        // Identify strengths (concepts with >= 80% accuracy)
        const strengths = conceptPerformance
            .filter(cp => cp.accuracy >= 0.8)
            .map(cp => `${cp.concept_name} (${(cp.accuracy * 100).toFixed(1)}% accuracy)`);

        // Identify weaknesses (concepts with < 60% accuracy)
        const weaknesses: ConceptWeakness[] = conceptPerformance
            .filter(cp => cp.accuracy < WEAK_CONCEPT_THRESHOLD)
            .map(cp => ({
                concept_name: cp.concept_name,
                accuracy: cp.accuracy,
                questions_attempted: cp.total_questions,
            }));

        // Generate recommendations for weak concepts
        const recommendations = await this.getRecommendations(weaknesses);

        return {
            overall_message: overallMessage,
            strengths: strengths.length > 0 ? strengths : ['Keep practicing to build your strengths'],
            weaknesses,
            recommendations,
        };
    }

    /**
     * Get textbook recommendations for weak concepts
     * Requirements: 7.5
     */
    private async getRecommendations(
        weaknesses: ConceptWeakness[]
    ): Promise<Recommendation[]> {
        if (weaknesses.length === 0) {
            return [];
        }

        // Get concept details for weak concepts
        const conceptNames = weaknesses.map(w => w.concept_name);

        const conceptsResult = await this.pool.query<ConceptRow>(
            `SELECT * FROM concepts WHERE name = ANY($1::text[])`,
            [conceptNames]
        );

        const conceptsMap = new Map(
            conceptsResult.rows.map(c => [c.name, c])
        );

        // Generate recommendations based on concept and accuracy
        const recommendations: Recommendation[] = [];

        for (const weakness of weaknesses) {
            const concept = conceptsMap.get(weakness.concept_name);
            if (!concept) continue;

            // Determine priority based on accuracy
            let priority: 'high' | 'medium' | 'low' = 'medium';
            if (weakness.accuracy < 0.3) {
                priority = 'high';
            } else if (weakness.accuracy < 0.5) {
                priority = 'medium';
            } else {
                priority = 'low';
            }

            // Generate textbook recommendations based on concept
            const textbookChapters = this.getTextbookChaptersForConcept(
                concept.name,
                concept.category
            );

            // Generate practice topics
            const practiceTopics = this.getPracticeTopicsForConcept(
                concept.name,
                concept.category
            );

            recommendations.push({
                concept_name: concept.name,
                textbook_chapters: textbookChapters,
                practice_topics: practiceTopics,
                priority,
            });
        }

        // Sort by priority (high first)
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return recommendations.sort(
            (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
    }

    /**
     * Get textbook chapter recommendations for a concept
     */
    private getTextbookChaptersForConcept(
        conceptName: string,
        category: string
    ): string[] {
        // This is a simplified mapping. In a real system, this would be stored in the database
        // or fetched from a more comprehensive knowledge base
        const recommendations: Record<string, string[]> = {
            'Data Structures': [
                'Cormen - Introduction to Algorithms: Chapters 10-14',
                'Tanenbaum - Data Structures Using C: Chapters 2-6',
            ],
            'Algorithms': [
                'Cormen - Introduction to Algorithms: Chapters 15-17, 22-26',
                'Kleinberg - Algorithm Design: Chapters 4-6',
            ],
            'Operating Systems': [
                'Silberschatz - Operating System Concepts: Chapters 3-9',
                'Tanenbaum - Modern Operating Systems: Chapters 2-6',
            ],
            'Database Management': [
                'Korth - Database System Concepts: Chapters 1-8, 12-15',
                'Elmasri - Fundamentals of Database Systems: Chapters 3-9',
            ],
            'Computer Networks': [
                'Tanenbaum - Computer Networks: Chapters 1-6',
                'Kurose - Computer Networking: Chapters 1-5',
            ],
            'Theory of Computation': [
                'Hopcroft - Introduction to Automata Theory: Chapters 2-9',
                'Sipser - Introduction to the Theory of Computation: Chapters 1-5',
            ],
            'Compiler Design': [
                'Aho - Compilers: Principles, Techniques, and Tools: Chapters 2-8',
            ],
            'Digital Logic': [
                'Morris Mano - Digital Design: Chapters 1-7',
            ],
        };

        // Try to find exact match first
        if (recommendations[conceptName]) {
            return recommendations[conceptName];
        }

        // Try to find by category
        if (recommendations[category]) {
            return recommendations[category];
        }

        // Default recommendation
        return [
            'Review standard GATE textbooks for this topic',
            'Practice previous years\' questions on this concept',
        ];
    }

    /**
     * Get practice topics for a concept
     */
    private getPracticeTopicsForConcept(
        conceptName: string,
        _category: string
    ): string[] {
        // Simplified practice topic suggestions
        return [
            `Solve 20+ practice problems on ${conceptName}`,
            `Review fundamental theorems and definitions`,
            `Work through solved examples step-by-step`,
            `Take concept-specific mock tests`,
        ];
    }

    /**
     * Get historical performance for a user with pagination
     * Requirements: 7.6
     */
    async getHistoricalPerformance(
        userId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ results: TestResult[]; total: number; page: number; totalPages: number }> {
        // Validate pagination parameters
        const validatedPage = Math.max(1, page);
        const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
        const offset = (validatedPage - 1) * validatedLimit;

        // Get total count
        const countResult = await this.pool.query<{ count: string }>(
            `SELECT COUNT(*) as count FROM test_results WHERE user_id = $1`,
            [userId]
        );
        const total = parseInt(countResult.rows[0].count, 10);

        // Get paginated results
        const result = await this.pool.query<TestResultRow>(
            `SELECT * FROM test_results 
             WHERE user_id = $1 
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, validatedLimit, offset]
        );

        const results = result.rows.map(row => this.mapRowToTestResult(row));
        const totalPages = Math.ceil(total / validatedLimit);

        return {
            results,
            total,
            page: validatedPage,
            totalPages,
        };
    }

    /**
     * Get test result by session ID
     * Requirements: 7.1, 7.2
     */
    async getResultBySessionId(sessionId: string): Promise<TestResult | null> {
        const result = await this.pool.query<TestResultRow>(
            `SELECT * FROM test_results WHERE session_id = $1`,
            [sessionId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRowToTestResult(result.rows[0]);
    }

    /**
     * Get detailed analysis including question-by-question breakdown
     * Requirements: 7.2, 5.5
     */
    async getDetailedAnalysis(sessionId: string) {
        // Get test result
        const testResult = await this.getResultBySessionId(sessionId);

        if (!testResult) {
            throw new Error('Test result not found');
        }

        // Get session details
        const sessionResult = await this.pool.query<TestSessionRow>(
            `SELECT * FROM test_sessions WHERE id = $1`,
            [sessionId]
        );

        if (sessionResult.rows.length === 0) {
            throw new Error('Test session not found');
        }

        const session = sessionResult.rows[0];

        // Get test details
        const testDbResult = await this.pool.query(
            `SELECT * FROM tests WHERE id = $1`,
            [session.test_id]
        );

        const test = testDbResult.rows[0];
        const questionIds = typeof test.question_ids === 'string'
            ? JSON.parse(test.question_ids)
            : test.question_ids;

        // Get all questions with details
        const questionsResult = await this.pool.query<QuestionRow>(
            `SELECT * FROM questions WHERE id = ANY($1::uuid[])`,
            [questionIds]
        );

        // Get user's answers
        const answersResult = await this.pool.query<SessionAnswerRow>(
            `SELECT * FROM session_answers WHERE session_id = $1`,
            [sessionId]
        );

        const userAnswers = new Map(
            answersResult.rows.map(row => [row.question_id, row])
        );

        // Get question times
        const timesResult = await this.pool.query<QuestionTimeRow>(
            `SELECT * FROM question_times WHERE session_id = $1`,
            [sessionId]
        );

        const questionTimes = new Map(
            timesResult.rows.map(row => [row.question_id, row.time_spent])
        );

        // Build detailed question breakdown
        const questionBreakdown = questionsResult.rows.map(q => {
            const userAnswer = userAnswers.get(q.id);
            const timeSpent = questionTimes.get(q.id) || 0;
            const isCorrect = userAnswer?.selected_answer === q.correct_answer;

            return {
                question_id: q.id,
                content: q.content,
                options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                user_answer: userAnswer?.selected_answer || null,
                correct_answer: q.correct_answer,
                explanation: q.explanation,
                is_correct: isCorrect,
                time_spent: timeSpent,
                marked_for_review: userAnswer?.marked_for_review || false,
                concept: q.concept_id,
                difficulty: q.difficulty,
            };
        });

        return {
            result: testResult,
            session: {
                id: session.id,
                start_time: session.start_time,
                end_time: session.end_time,
                total_time_spent: session.total_time_spent,
                status: session.status,
            },
            questions: questionBreakdown,
        };
    }

    /**
     * Save test result to database
     */
    private async saveTestResult(data: {
        session_id: string;
        user_id: string;
        score: number;
        total_questions: number;
        correct_answers: number;
        incorrect_answers: number;
        unanswered: number;
        percentage: number;
        concept_performance: ConceptPerformance[];
        feedback: Feedback;
    }): Promise<string> {
        const result = await this.pool.query(
            `INSERT INTO test_results 
             (session_id, user_id, score, total_questions, correct_answers, 
              incorrect_answers, unanswered, percentage, concept_performance, feedback)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id`,
            [
                data.session_id,
                data.user_id,
                data.score,
                data.total_questions,
                data.correct_answers,
                data.incorrect_answers,
                data.unanswered,
                data.percentage,
                JSON.stringify(data.concept_performance),
                JSON.stringify(data.feedback),
            ]
        );

        return result.rows[0].id;
    }

    /**
     * Map database row to TestResult model
     */
    private mapRowToTestResult(row: TestResultRow): TestResult {
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
    }
}
