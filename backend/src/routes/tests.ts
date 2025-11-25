import express, { Request, Response } from 'express';
import { TestGenerationService } from '../services/testGenerationService';
import { TestSessionService } from '../services/testSessionService';
import { authenticateToken } from '../middleware/auth';
import { csrfProtection, testSubmissionRateLimiter, validateUUIDParams } from '../middleware/security';

const router = express.Router();
const testService = new TestGenerationService();
const sessionService = new TestSessionService();

/**
 * Generate a new mock test
 * POST /api/tests/generate
 */
router.post('/generate', authenticateToken, csrfProtection, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const config = {
            questionCount: req.body.questionCount,
            focusConcepts: req.body.focusConcepts,
            difficultyDistribution: req.body.difficultyDistribution,
        };

        const test = await testService.generateMockTest(userId, config);

        res.status(201).json({
            message: 'Test generated successfully',
            test,
        });
    } catch (error: any) {
        console.error('Error generating test:', error);
        res.status(500).json({
            error: error.message || 'Failed to generate test'
        });
    }
});

/**
 * Get test details by ID
 * GET /api/tests/:testId
 */
router.get('/:testId', authenticateToken, validateUUIDParams('testId'), async (req: Request, res: Response) => {
    try {
        const { testId } = req.params;

        const result = await testService['pool'].query(
            'SELECT * FROM tests WHERE id = $1',
            [testId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }

        const testRow = result.rows[0];
        const test = {
            id: testRow.id,
            question_ids: typeof testRow.question_ids === 'string'
                ? JSON.parse(testRow.question_ids)
                : testRow.question_ids,
            total_questions: testRow.total_questions,
            duration: testRow.duration,
            created_at: testRow.created_at,
        };

        res.json({ test });
    } catch (error: any) {
        console.error('Error fetching test:', error);
        res.status(500).json({ error: 'Failed to fetch test' });
    }
});

/**
 * Start a test session
 * POST /api/tests/:testId/start
 */
router.post('/:testId/start', authenticateToken, csrfProtection, validateUUIDParams('testId'), async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { testId } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const sessionId = await testService.createTestSession(userId, testId);

        res.status(201).json({
            message: 'Test session started',
            sessionId,
        });
    } catch (error: any) {
        console.error('Error starting test session:', error);
        res.status(500).json({
            error: error.message || 'Failed to start test session'
        });
    }
});

export default router;

/**
 * Save answer for a question in a test session
 * PUT /api/tests/sessions/:sessionId/answer
 */
router.put('/sessions/:sessionId/answer', authenticateToken, csrfProtection, validateUUIDParams('sessionId'), async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { questionId, selectedAnswer, markedForReview } = req.body;

        if (!questionId || selectedAnswer === undefined) {
            res.status(400).json({ error: 'questionId and selectedAnswer are required' });
            return;
        }

        await sessionService.saveAnswer(sessionId, {
            questionId,
            selectedAnswer,
            markedForReview: markedForReview || false,
        });

        res.json({ message: 'Answer saved successfully' });
    } catch (error: any) {
        console.error('Error saving answer:', error);
        res.status(500).json({
            error: error.message || 'Failed to save answer'
        });
    }
});

/**
 * Track time spent on a question
 * PUT /api/tests/sessions/:sessionId/time
 */
router.put('/sessions/:sessionId/time', authenticateToken, csrfProtection, validateUUIDParams('sessionId'), async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { questionId, timeSpent } = req.body;

        if (!questionId || timeSpent === undefined) {
            res.status(400).json({ error: 'questionId and timeSpent are required' });
            return;
        }

        await sessionService.trackQuestionTime(sessionId, {
            questionId,
            timeSpent,
        });

        res.json({ message: 'Time tracked successfully' });
    } catch (error: any) {
        console.error('Error tracking time:', error);
        res.status(500).json({
            error: error.message || 'Failed to track time'
        });
    }
});

/**
 * Submit test session
 * POST /api/tests/sessions/:sessionId/submit
 */
router.post('/sessions/:sessionId/submit', authenticateToken, csrfProtection, testSubmissionRateLimiter, validateUUIDParams('sessionId'), async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const session = await sessionService.submitTest(sessionId);

        res.json({
            message: 'Test submitted successfully',
            session,
        });
    } catch (error: any) {
        console.error('Error submitting test:', error);
        res.status(500).json({
            error: error.message || 'Failed to submit test'
        });
    }
});

/**
 * Auto-submit test session on timeout
 * POST /api/tests/sessions/:sessionId/auto-submit
 */
router.post('/sessions/:sessionId/auto-submit', authenticateToken, csrfProtection, validateUUIDParams('sessionId'), async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const session = await sessionService.autoSubmitOnTimeout(sessionId);

        res.json({
            message: 'Test auto-submitted successfully',
            session,
        });
    } catch (error: any) {
        console.error('Error auto-submitting test:', error);
        res.status(500).json({
            error: error.message || 'Failed to auto-submit test'
        });
    }
});

/**
 * Get session state (for recovery/debugging)
 * GET /api/tests/sessions/:sessionId/state
 */
router.get('/sessions/:sessionId/state', authenticateToken, validateUUIDParams('sessionId'), async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const state = await sessionService.getSessionState(sessionId);

        if (!state) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        res.json({ state });
    } catch (error: any) {
        console.error('Error getting session state:', error);
        res.status(500).json({
            error: error.message || 'Failed to get session state'
        });
    }
});

/**
 * Get questions for a test (for test-taking interface)
 * GET /api/tests/:testId/questions
 */
router.get('/:testId/questions', authenticateToken, validateUUIDParams('testId'), async (req: Request, res: Response) => {
    try {
        const { testId } = req.params;

        // Get test details
        const testResult = await testService['pool'].query(
            'SELECT * FROM tests WHERE id = $1',
            [testId]
        );

        if (testResult.rows.length === 0) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }

        const testRow = testResult.rows[0];
        const questionIds = typeof testRow.question_ids === 'string'
            ? JSON.parse(testRow.question_ids)
            : testRow.question_ids;

        // Get all questions
        const questionsResult = await testService['pool'].query(
            'SELECT id, content, options FROM questions WHERE id = ANY($1::uuid[])',
            [questionIds]
        );

        const questions = questionsResult.rows.map((row: any) => ({
            id: row.id,
            content: row.content,
            options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
        }));

        res.json({ questions });
    } catch (error: any) {
        console.error('Error fetching test questions:', error);
        res.status(500).json({ error: 'Failed to fetch test questions' });
    }
});
