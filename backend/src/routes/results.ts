import express, { Request, Response } from 'express';
import { ResultsService } from '../services/resultsService';
import { authenticateToken } from '../middleware/auth';
import { validateUUIDParams, csrfProtection } from '../middleware/security';

const router = express.Router();
const resultsService = new ResultsService();

/**
 * Get test results by session ID
 * GET /api/results/:sessionId
 * Requirements: 7.1, 7.2
 */
router.get('/:sessionId', authenticateToken, validateUUIDParams('sessionId'), async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        // Check if result already exists
        let result = await resultsService.getResultBySessionId(sessionId);

        // If result doesn't exist, calculate it
        if (!result) {
            result = await resultsService.calculateScore(sessionId);
        }

        res.json({ result });
    } catch (error: any) {
        console.error('Error fetching test result:', error);
        res.status(500).json({
            error: error.message || 'Failed to fetch test result'
        });
    }
});

/**
 * Get detailed analysis for a test session
 * GET /api/results/:sessionId/analysis
 * Requirements: 7.2, 7.3, 5.5
 */
router.get('/:sessionId/analysis', authenticateToken, validateUUIDParams('sessionId'), async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const analysis = await resultsService.getDetailedAnalysis(sessionId);

        res.json({ analysis });
    } catch (error: any) {
        console.error('Error fetching detailed analysis:', error);
        res.status(500).json({
            error: error.message || 'Failed to fetch detailed analysis'
        });
    }
});

/**
 * Get historical performance for a user with pagination
 * GET /api/results/user/:userId/history?page=1&limit=10
 * Requirements: 7.6
 */
router.get('/user/:userId/history', authenticateToken, validateUUIDParams('userId'), async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const authenticatedUserId = req.user?.userId;

        // Verify user can only access their own history (unless admin)
        if (authenticatedUserId !== userId && req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        // Parse pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const history = await resultsService.getHistoricalPerformance(userId, page, limit);

        res.json(history);
    } catch (error: any) {
        console.error('Error fetching historical performance:', error);
        res.status(500).json({
            error: error.message || 'Failed to fetch historical performance'
        });
    }
});

/**
 * Calculate and save results for a completed test session
 * POST /api/results/:sessionId/calculate
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
router.post('/:sessionId/calculate', authenticateToken, csrfProtection, validateUUIDParams('sessionId'), async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const result = await resultsService.calculateScore(sessionId);

        res.status(201).json({
            message: 'Results calculated successfully',
            result,
        });
    } catch (error: any) {
        console.error('Error calculating results:', error);
        res.status(500).json({
            error: error.message || 'Failed to calculate results'
        });
    }
});

export default router;
