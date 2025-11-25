import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ConceptService } from '../services/conceptService';
import { QuestionService } from '../services/questionService';
import { TrendAnalysisService } from '../services/trendAnalysisService';
import { ValidationError } from '../utils/validation';
import { adminRateLimiter, bulkImportRateLimiter, csrfProtection, validateUUIDParams } from '../middleware/security';

const router = Router();
const conceptService = new ConceptService();
const questionService = new QuestionService();
const trendService = new TrendAnalysisService();

// Apply authentication, admin, and rate limiting middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);
router.use(adminRateLimiter);
router.use(csrfProtection);

// ============================================
// Concept Routes
// ============================================

/**
 * GET /api/admin/concepts
 * Get all concepts
 */
router.get('/concepts', async (_req: Request, res: Response) => {
    try {
        const concepts = await conceptService.getAllConcepts();
        res.json({ concepts });
    } catch (error: any) {
        console.error('Error fetching concepts:', error);
        res.status(500).json({ error: 'Failed to fetch concepts' });
    }
});

/**
 * GET /api/admin/concepts/:id
 * Get concept by ID
 */
router.get('/concepts/:id', validateUUIDParams('id'), async (req: Request, res: Response) => {
    try {
        const concept = await conceptService.getConceptById(req.params.id);

        if (!concept) {
            res.status(404).json({ error: 'Concept not found' });
            return;
        }

        res.json({ concept });
    } catch (error: any) {
        console.error('Error fetching concept:', error);
        res.status(500).json({ error: 'Failed to fetch concept' });
    }
});

/**
 * POST /api/admin/concepts
 * Create a new concept
 */
router.post('/concepts', async (req: Request, res: Response) => {
    try {
        const concept = await conceptService.createConcept(req.body);
        res.status(201).json({ concept });
    } catch (error: any) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error('Error creating concept:', error);
        res.status(500).json({ error: 'Failed to create concept' });
    }
});

/**
 * PUT /api/admin/concepts/:id
 * Update concept
 */
router.put('/concepts/:id', validateUUIDParams('id'), async (req: Request, res: Response) => {
    try {
        const concept = await conceptService.updateConcept(req.params.id, req.body);

        if (!concept) {
            res.status(404).json({ error: 'Concept not found' });
            return;
        }

        res.json({ concept });
    } catch (error: any) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error('Error updating concept:', error);
        res.status(500).json({ error: 'Failed to update concept' });
    }
});

/**
 * DELETE /api/admin/concepts/:id
 * Delete concept
 */
router.delete('/concepts/:id', validateUUIDParams('id'), async (req: Request, res: Response) => {
    try {
        const deleted = await conceptService.deleteConcept(req.params.id);

        if (!deleted) {
            res.status(404).json({ error: 'Concept not found' });
            return;
        }

        res.json({ message: 'Concept deleted successfully' });
    } catch (error: any) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error('Error deleting concept:', error);
        res.status(500).json({ error: 'Failed to delete concept' });
    }
});

/**
 * GET /api/admin/concepts/category/:category
 * Get concepts by category
 */
router.get('/concepts/category/:category', async (req: Request, res: Response) => {
    try {
        const concepts = await conceptService.getConceptsByCategory(req.params.category);
        res.json({ concepts });
    } catch (error: any) {
        console.error('Error fetching concepts by category:', error);
        res.status(500).json({ error: 'Failed to fetch concepts' });
    }
});

// ============================================
// Question Routes
// ============================================

/**
 * GET /api/admin/questions
 * Get all questions with optional filters
 */
router.get('/questions', async (req: Request, res: Response) => {
    try {
        const filters = {
            concept_id: req.query.concept_id as string | undefined,
            difficulty: req.query.difficulty as string | undefined,
            year_appeared: req.query.year_appeared ? parseInt(req.query.year_appeared as string, 10) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
        };

        const questions = await questionService.getQuestions(filters);
        res.json({ questions });
    } catch (error: any) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

/**
 * GET /api/admin/questions/:id
 * Get question by ID
 */
router.get('/questions/:id', validateUUIDParams('id'), async (req: Request, res: Response) => {
    try {
        const question = await questionService.getQuestionById(req.params.id);

        if (!question) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }

        res.json({ question });
    } catch (error: any) {
        console.error('Error fetching question:', error);
        res.status(500).json({ error: 'Failed to fetch question' });
    }
});

/**
 * POST /api/admin/questions
 * Create a new question
 */
router.post('/questions', async (req: Request, res: Response) => {
    try {
        const question = await questionService.createQuestion(req.body);

        // Update trends after adding new question
        await trendService.updateTrendsWithNewData();

        res.status(201).json({ question });
    } catch (error: any) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error('Error creating question:', error);
        res.status(500).json({ error: 'Failed to create question' });
    }
});

/**
 * PUT /api/admin/questions/:id
 * Update question
 */
router.put('/questions/:id', validateUUIDParams('id'), async (req: Request, res: Response) => {
    try {
        const question = await questionService.updateQuestion(req.params.id, req.body);

        if (!question) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }

        res.json({ question });
    } catch (error: any) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error('Error updating question:', error);
        res.status(500).json({ error: 'Failed to update question' });
    }
});

/**
 * DELETE /api/admin/questions/:id
 * Delete question
 */
router.delete('/questions/:id', validateUUIDParams('id'), async (req: Request, res: Response) => {
    try {
        const deleted = await questionService.deleteQuestion(req.params.id);

        if (!deleted) {
            res.status(404).json({ error: 'Question not found' });
            return;
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

/**
 * POST /api/admin/questions/import
 * Bulk import questions
 */
router.post('/questions/import', bulkImportRateLimiter, async (req: Request, res: Response) => {
    try {
        const result = await questionService.bulkImportQuestions(req.body);

        // Update trends after bulk import
        if (result.successful > 0) {
            await trendService.updateTrendsWithNewData();
        }

        if (result.failed > 0) {
            res.status(207).json({
                message: 'Bulk import completed with some errors',
                result,
            });
        } else {
            res.status(201).json({
                message: 'All questions imported successfully',
                result,
            });
        }
    } catch (error: any) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error('Error importing questions:', error);
        res.status(500).json({ error: 'Failed to import questions' });
    }
});

/**
 * GET /api/admin/questions/concept/:conceptId/count
 * Get question count for a concept
 */
router.get('/questions/concept/:conceptId/count', validateUUIDParams('conceptId'), async (req: Request, res: Response) => {
    try {
        const count = await questionService.getQuestionCountByConcept(req.params.conceptId);
        res.json({ count });
    } catch (error: any) {
        console.error('Error fetching question count:', error);
        res.status(500).json({ error: 'Failed to fetch question count' });
    }
});

export default router;
