import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { inMemoryDb } from './utils/inMemoryDb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = inMemoryDb.findUser({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = inMemoryDb.saveUser({
      name,
      email,
      password: hashedPassword,
      testsCompleted: 0,
      totalScore: 0,
      streak: 0,
      topicPerformance: [],
      createdAt: new Date()
    });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = inMemoryDb.findUser({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = inMemoryDb.findUser({ _id: req.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = inMemoryDb.findUser({ _id: req.userId });
    const averageScore = user.testsCompleted > 0 ? user.totalScore / user.testsCompleted : 0;
    const topics = inMemoryDb.getAllTopics();
    
    // Generate topic performance
    const topicScores = topics.map(topic => ({
      topic,
      score: Math.floor(Math.random() * 40) + 50
    }));
    
    const strongTopics = topicScores
      .filter(t => t.score >= 75)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(t => t.topic);
    
    const weakTopics = topicScores
      .filter(t => t.score < 65)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(t => t.topic);
    
    res.json({
      testsCompleted: user.testsCompleted,
      averageScore: Math.round(averageScore),
      strongTopics,
      weakTopics,
      streak: user.streak,
      totalQuestions: inMemoryDb.getQuestions(1000).length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard' });
  }
});

// Trends
app.get('/api/trends', authMiddleware, async (req, res) => {
  const allQuestions = inMemoryDb.getQuestions(1000);
  const topicCount = {};
  const yearCount = {};
  
  allQuestions.forEach(q => {
    topicCount[q.topic] = (topicCount[q.topic] || 0) + 1;
    yearCount[q.year] = (yearCount[q.year] || 0) + 1;
  });
  
  const topicFrequency = Object.entries(topicCount)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
  
  const years = Object.keys(yearCount).sort();
  const difficultyTrend = years.map(() => Math.random() * 2 + 2.5);
  
  res.json({
    topicFrequency,
    years,
    difficultyTrend,
    totalQuestions: allQuestions.length
  });
});

// Predictions
app.get('/api/predict', authMiddleware, async (req, res) => {
  res.json({
    topicImportance: [
      { topic: 'Algorithms', score: 90 },
      { topic: 'Data Structures', score: 85 },
      { topic: 'Operating Systems', score: 75 },
      { topic: 'DBMS', score: 80 },
      { topic: 'Networks', score: 70 }
    ],
    highPriorityTopics: ['Algorithms', 'Data Structures', 'DBMS']
  });
});

// Generate test
app.post('/api/generate-test', authMiddleware, async (req, res) => {
  try {
    const { difficulty, topicCount = 10, topics = [], format = 'custom' } = req.body;
    
    let questions;
    let metadata = {};
    
    if (format === 'gate') {
      // Generate full GATE format test (65 questions)
      const gateTest = inMemoryDb.generateGATEFormatTest();
      questions = gateTest.questions;
      metadata = gateTest.metadata;
    } else {
      // Custom test generation
      const filters = {};
      if (difficulty) filters.difficulty = difficulty;
      if (topics.length > 0) filters.topic = topics[0];
      
      questions = inMemoryDb.getQuestions(topicCount, filters);
      metadata = {
        totalQuestions: questions.length,
        totalMarks: questions.reduce((sum, q) => sum + (q.marks || 1), 0),
        format: 'Custom'
      };
    }
    
    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found matching criteria' });
    }
    
    const test = inMemoryDb.saveTest({
      userId: req.userId,
      questions: questions.map(q => q._id),
      totalQuestions: questions.length,
      completed: false,
      createdAt: new Date(),
      difficulty,
      topics,
      format,
      metadata
    });
    
    res.json({ ...test, questions, metadata });
  } catch (error) {
    res.status(500).json({ message: 'Error generating test', error: error.message });
  }
});

// Submit test
app.post('/api/submit-test', authMiddleware, async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const test = inMemoryDb.getTest(testId);
    const questions = inMemoryDb.getQuestions();
    let correct = 0;
    Object.keys(answers).forEach(qId => {
      const question = questions.find(q => q._id === qId);
      if (question && answers[qId] === question.correctAnswer) correct++;
    });
    const score = (correct / test.totalQuestions) * 100;
    test.correctAnswers = correct;
    test.score = score;
    test.completed = true;
    const user = inMemoryDb.findUser({ _id: req.userId });
    inMemoryDb.updateUser(req.userId, {
      testsCompleted: user.testsCompleted + 1,
      totalScore: user.totalScore + score
    });
    res.json({ score, correct, total: test.totalQuestions });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting test' });
  }
});

// Analytics
app.get('/api/analytics', authMiddleware, async (req, res) => {
  const user = inMemoryDb.findUser({ _id: req.userId });
  const topics = inMemoryDb.getAllTopics();
  
  const topicPerformance = topics.map(topic => ({
    topic,
    score: Math.floor(Math.random() * 30) + 60 // 60-90 range
  }));
  
  const totalAttempted = user.testsCompleted * 10;
  const correct = Math.floor(totalAttempted * (user.averageScore || 75) / 100);
  const incorrect = totalAttempted - correct;
  
  res.json({
    topicPerformance,
    correct,
    incorrect,
    unattempted: Math.floor(Math.random() * 10),
    averageScore: user.averageScore || 75,
    totalTests: user.testsCompleted,
    totalQuestions: totalAttempted
  });
});

console.log('⚠️  Using IN-MEMORY database (data will be lost on restart)');
console.log('📝 For persistent storage, setup MongoDB Atlas - see docs/MONGODB_SETUP.md');

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`🔌 Backend: http://localhost:${PORT}`);
});
