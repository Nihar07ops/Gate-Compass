import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const averageScore = user.testsCompleted > 0 ? user.totalScore / user.testsCompleted : 0;
    const strongTopics = user.topicPerformance?.filter(t => t.score > 70).map(t => t.topic) || [];
    const weakTopics = user.topicPerformance?.filter(t => t.score < 50).map(t => t.topic) || [];
    res.json({
      testsCompleted: user.testsCompleted,
      averageScore: Math.round(averageScore),
      strongTopics,
      weakTopics,
      streak: user.streak
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

export default router;
