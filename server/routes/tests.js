import express from 'express';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate-test', authMiddleware, async (req, res) => {
  try {
    const { difficulty, topicCount } = req.body;
    const questions = await Question.aggregate([
      { $match: { difficulty: difficulty || 'medium' } },
      { $sample: { size: topicCount || 10 } }
    ]);
    const test = new Test({
      userId: req.userId,
      questions: questions.map(q => q._id),
      totalQuestions: questions.length
    });
    await test.save();
    res.json({ ...test.toObject(), questions });
  } catch (error) {
    res.status(500).json({ message: 'Error generating test', error: error.message });
  }
});

router.post('/submit-test', authMiddleware, async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const test = await Test.findById(testId).populate('questions');
    let correct = 0;
    test.questions.forEach(q => {
      if (answers[q._id] === q.correctAnswer) correct++;
    });
    test.correctAnswers = correct;
    test.score = (correct / test.totalQuestions) * 100;
    test.completed = true;
    test.completedAt = new Date();
    test.answers = answers;
    await test.save();
    await User.findByIdAndUpdate(req.userId, {
      $inc: { testsCompleted: 1, totalScore: test.score }
    });
    res.json({ score: test.score, correct, total: test.totalQuestions });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting test', error: error.message });
  }
});

export default router;
