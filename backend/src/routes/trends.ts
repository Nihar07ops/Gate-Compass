import express, { Request, Response } from 'express';
import { TrendAnalysisService } from '../services/trendAnalysisService';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { triggerTrendAnalysis } from '../jobs/trendAnalysisJob';
import { validateUUIDParams, csrfProtection } from '../middleware/security';

const router = express.Router();
const trendService = new TrendAnalysisService();

/**
 * Get concept trends and rankings
 * GET /api/trends
 */
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
    try {
        const trendData = await trendService.getCachedTrends();

        if (!trendData) {
            res.status(404).json({
                error: 'No trend data available. Please add questions to the system first.'
            });
            return;
        }

        res.json(trendData);
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({ error: 'Failed to fetch trend data' });
    }
});

/**
 * Get concept rankings only
 * GET /api/trends/rankings
 */
router.get('/rankings', authenticateToken, async (_req: Request, res: Response) => {
    try {
        const rankings = await trendService.getConceptRanking();

        if (rankings.length === 0) {
            res.status(404).json({
                error: 'No rankings available. Please add questions to the system first.'
            });
            return;
        }

        res.json({ rankings });
    } catch (error) {
        console.error('Error fetching rankings:', error);
        res.status(500).json({ error: 'Failed to fetch rankings' });
    }
});

/**
 * Trigger trend recalculation (admin only)
 * POST /api/trends/refresh
 */
router.post('/refresh', authenticateToken, requireAdmin, csrfProtection, async (_req: Request, res: Response) => {
    try {
        await triggerTrendAnalysis();
        res.json({
            message: 'Trend analysis completed successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error refreshing trends:', error);
        res.status(500).json({ error: 'Failed to refresh trend data' });
    }
});

/**
 * Get trend data for a specific concept
 * GET /api/trends/concept/:conceptId
 */
router.get('/concept/:conceptId', authenticateToken, validateUUIDParams('conceptId'), async (req: Request, res: Response) => {
    try {
        const { conceptId } = req.params;

        const trendData = await trendService.getCachedTrends();

        if (!trendData) {
            res.status(404).json({ error: 'No trend data available' });
            return;
        }

        const conceptRanking = trendData.rankings.find(r => r.concept_id === conceptId);

        if (!conceptRanking) {
            res.status(404).json({ error: 'Concept not found in trend data' });
            return;
        }

        res.json(conceptRanking);
    } catch (error) {
        console.error('Error fetching concept trend:', error);
        res.status(500).json({ error: 'Failed to fetch concept trend data' });
    }
});

export default router;
