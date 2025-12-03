import express from 'express';
import Trend from '../models/Trend.js';
import Question from '../models/Question.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const trends = await Trend.find().sort({ year: -1 }).limit(10);
    const topicFrequency = await Question.aggregate([
      { $group: { _id: '$topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { topic: '$_id', count: 1, _id: 0 } }
    ]);
    const years = trends.map(t => t.year);
    const difficultyTrend = trends.map(t => t.averageDifficulty);
    res.json({ topicFrequency, years, difficultyTrend, trends });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
