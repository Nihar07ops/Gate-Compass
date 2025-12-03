import express from 'express';
import Test from '../models/Test.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const tests = await Test.find({ userId: req.userId, completed: true }).populate('questions');
    const totalQuestions = tests.reduce((sum, t) => sum + t.totalQuestions, 0);
    const correctAnswers = tests.reduce((sum, t) => sum + t.correctAnswers, 0);
    const analytics = {
      topicPerformance: user.topicPerformance || [],
      correct: correctAnswers,
      incorrect: totalQuestions - correctAnswers,
      unattempted: 0,
      averageScore: user.testsCompleted > 0 ? user.totalScore / user.testsCompleted : 0
    };
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

export default router;
