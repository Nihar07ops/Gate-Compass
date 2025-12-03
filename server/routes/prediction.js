import express from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const mlResponse = await axios.get(`${process.env.ML_SERVICE_URL}/predict`);
    res.json(mlResponse.data);
  } catch (error) {
    res.status(500).json({ 
      message: 'Prediction service unavailable',
      topicImportance: [
        { topic: 'Data Structures', score: 85 },
        { topic: 'Algorithms', score: 90 },
        { topic: 'Operating Systems', score: 75 },
        { topic: 'DBMS', score: 80 },
        { topic: 'Computer Networks', score: 70 }
      ],
      highPriorityTopics: ['Algorithms', 'Data Structures', 'DBMS']
    });
  }
});

export default router;
