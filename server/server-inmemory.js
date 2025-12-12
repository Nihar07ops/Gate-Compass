import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { inMemoryDb } from './utils/inMemoryDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

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
    console.log('📝 Register request received:', req.body);
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const existingUser = inMemoryDb.findUser({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('💾 Saving user...');
    const user = inMemoryDb.createUser({
      name,
      email,
      password: hashedPassword,
      testsCompleted: 0,
      totalScore: 0,
      streak: 0,
      topicPerformance: [],
      createdAt: new Date()
    });
    
    console.log('🎫 Generating token...');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    console.log('✅ Registration successful:', user.email);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('❌ Registration error:', error);
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

// Enhanced Trends - Year-wise and Topic-wise Analysis
app.get('/api/trends', authMiddleware, async (req, res) => {
  try {
    const { subject, startYear = 2015, endYear = 2024 } = req.query;
    
    // Get data from ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    let url = `${mlServiceUrl}/trends/overview?start_year=${startYear}&end_year=${endYear}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('ML service unavailable');
    }
    
    const mlData = await response.json();
    
    // Get local data for immediate response
    const allQuestions = inMemoryDb.getQuestions(1000);
    const yearWiseData = {};
    const subjectWiseData = {};
    
    // Process questions by year and subject
    allQuestions.forEach(q => {
      const year = q.year || 2023;
      const subj = q.subject || 'Unknown';
      
      if (!yearWiseData[year]) {
        yearWiseData[year] = { total: 0, subjects: {}, topics: {} };
      }
      if (!subjectWiseData[subj]) {
        subjectWiseData[subj] = { total: 0, years: {}, topics: {} };
      }
      
      yearWiseData[year].total++;
      yearWiseData[year].subjects[subj] = (yearWiseData[year].subjects[subj] || 0) + 1;
      yearWiseData[year].topics[q.topic] = (yearWiseData[year].topics[q.topic] || 0) + 1;
      
      subjectWiseData[subj].total++;
      subjectWiseData[subj].years[year] = (subjectWiseData[subj].years[year] || 0) + 1;
      subjectWiseData[subj].topics[q.topic] = (subjectWiseData[subj].topics[q.topic] || 0) + 1;
    });
    
    res.json({
      ...mlData,
      localData: {
        yearWiseBreakdown: yearWiseData,
        subjectWiseBreakdown: subjectWiseData,
        totalQuestions: allQuestions.length
      }
    });
  } catch (error) {
    console.error('Trends API error:', error);
    
    // Fallback to local data if ML service fails
    const allQuestions = inMemoryDb.getQuestions(1000);
    const topicCount = {};
    const yearCount = {};
    const subjectCount = {};
    
    allQuestions.forEach(q => {
      topicCount[q.topic] = (topicCount[q.topic] || 0) + 1;
      yearCount[q.year] = (yearCount[q.year] || 0) + 1;
      subjectCount[q.subject] = (subjectCount[q.subject] || 0) + 1;
    });
    
    const topicFrequency = Object.entries(topicCount)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
    
    const years = Object.keys(yearCount).sort();
    const subjects = Object.keys(subjectCount);
    
    res.json({
      topicFrequency,
      years,
      subjects,
      yearCount,
      subjectCount,
      totalQuestions: allQuestions.length,
      fallback: true
    });
  }
});

// Subject-specific trends
app.get('/api/trends/subject/:subject', authMiddleware, async (req, res) => {
  try {
    const { subject } = req.params;
    const { startYear = 2015, endYear = 2024 } = req.query;
    
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const url = `${mlServiceUrl}/trends/subject/${encodeURIComponent(subject)}?start_year=${startYear}&end_year=${endYear}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Subject data not found');
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Subject trends error:', error);
    res.status(500).json({ error: 'Failed to fetch subject trends' });
  }
});

// Year-wise analysis
app.get('/api/trends/yearwise', authMiddleware, async (req, res) => {
  try {
    const { startYear = 2015, endYear = 2024 } = req.query;
    
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const url = `${mlServiceUrl}/trends/yearwise?start_year=${startYear}&end_year=${endYear}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('ML service unavailable');
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Year-wise trends error:', error);
    res.status(500).json({ error: 'Failed to fetch year-wise trends' });
  }
});

// Enhanced Predictions with ML
app.get('/api/predict', authMiddleware, async (req, res) => {
  try {
    const { subject, year } = req.query;
    
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    let url = `${mlServiceUrl}/predictions/topics`;
    
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (year) params.append('year', year);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('ML service unavailable');
    }
    
    const data = await response.json();
    
    // Format for frontend compatibility
    const topicImportance = data.predictions.map(pred => ({
      topic: pred.topic,
      score: Math.round(pred.importanceScore * 10), // Scale to 0-100
      confidence: pred.confidence,
      frequency: pred.frequency,
      totalMarks: pred.totalMarks,
      averageDifficulty: pred.averageDifficulty
    }));
    
    const highPriorityTopics = topicImportance
      .filter(t => t.score >= 70)
      .slice(0, 5)
      .map(t => t.topic);
    
    res.json({
      topicImportance,
      highPriorityTopics,
      filters: data.filters,
      enhanced: true
    });
  } catch (error) {
    console.error('Predictions error:', error);
    
    // Fallback predictions
    res.json({
      topicImportance: [
        { topic: 'Algorithms', score: 90 },
        { topic: 'Data Structures', score: 85 },
        { topic: 'Operating Systems', score: 75 },
        { topic: 'DBMS', score: 80 },
        { topic: 'Networks', score: 70 }
      ],
      highPriorityTopics: ['Algorithms', 'Data Structures', 'DBMS'],
      fallback: true
    });
  }
});

// Generate test
app.post('/api/generate-test', authMiddleware, async (req, res) => {
  try {
    const { difficulty, topicCount = 10, topics = [], format = 'custom' } = req.body;
    console.log('🎯 Generating test:', { format, difficulty, topicCount });
    
    let questions;
    let metadata = {};
    
    if (format === 'gate') {
      // Generate full GATE format test (65 questions) - ALWAYS RANDOMIZED
      const gateTest = inMemoryDb.generateGATEFormatTest();
      questions = gateTest.questions;
      metadata = gateTest.metadata;
      console.log(`✅ Generated GATE test with ${questions.length} questions`);
      console.log(`📊 First 3 question IDs: ${questions.slice(0, 3).map(q => q._id).join(', ')}`);
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
      console.log(`✅ Generated custom test with ${questions.length} questions`);
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
    console.error('❌ Error generating test:', error);
    res.status(500).json({ message: 'Error generating test', error: error.message });
  }
});

// Submit test
app.post('/api/submit-test', authMiddleware, async (req, res) => {
  try {
    const { testId, answers } = req.body;
    console.log('📝 Submitting test:', testId);
    console.log('📋 Answers received:', Object.keys(answers).length);
    
    const test = inMemoryDb.getTest(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    const allQuestions = Array.from(inMemoryDb.questions.values());
    
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const details = [];
    
    // Analyze each question
    test.questions.forEach(qId => {
      const question = allQuestions.find(q => q._id === qId);
      if (!question) {
        console.warn('⚠️  Question not found:', qId);
        return;
      }
      
      const userAnswer = answers[qId];
      const isCorrect = userAnswer && userAnswer === question.correctAnswer;
      
      if (!userAnswer) {
        unanswered++;
      } else if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }
      
      details.push({
        questionId: qId,
        question: question.text,
        userAnswer: userAnswer || null,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        topic: question.topic,
        subject: question.subject
      });
    });
    
    const total = test.totalQuestions;
    const score = total > 0 ? (correct / total) * 100 : 0;
    
    console.log(`✅ Test results: ${correct}/${total} correct (${score.toFixed(2)}%)`);
    
    test.correctAnswers = correct;
    test.score = score;
    test.completed = true;
    
    const user = inMemoryDb.findUser({ _id: req.userId });
    if (user) {
      inMemoryDb.updateUser(req.userId, {
        testsCompleted: (user.testsCompleted || 0) + 1,
        totalScore: (user.totalScore || 0) + score
      });
    }
    
    res.json({ 
      score, 
      correct, 
      incorrect,
      unanswered,
      total,
      details 
    });
  } catch (error) {
    console.error('❌ Error submitting test:', error);
    res.status(500).json({ message: 'Error submitting test', error: error.message });
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
