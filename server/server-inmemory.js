import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { inMemoryDb } from './utils/inMemoryDb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load PYQ analysis data
let pyqData = null;
try {
  const pyqPath = join(__dirname, 'data', 'pyq_analysis.json');
  pyqData = JSON.parse(readFileSync(pyqPath, 'utf8'));
  console.log('✅ Loaded PYQ analysis data from', pyqData.source);
} catch (error) {
  console.error('⚠️  Error loading PYQ analysis data:', error.message);
}

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

// Trends - Real PYQ analysis data
app.get('/api/trends', authMiddleware, async (req, res) => {
  try {
    if (!pyqData) {
      return res.status(500).json({ message: 'PYQ data not available' });
    }

    const { topic_wise_distribution, year_totals } = pyqData;
    
    // Get all unique topics
    const allTopics = new Set();
    Object.values(topic_wise_distribution).forEach(yearData => {
      Object.keys(yearData).forEach(topic => allTopics.add(topic));
    });
    
    // Calculate total questions per topic across all years
    const topicTotals = {};
    Array.from(allTopics).forEach(topic => {
      topicTotals[topic] = 0;
      Object.values(topic_wise_distribution).forEach(yearData => {
        topicTotals[topic] += yearData[topic] || 0;
      });
    });
    
    // Format topic frequency
    const topicFrequency = Object.entries(topicTotals)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
    
    // Get years sorted
    const years = Object.keys(year_totals).sort();
    
    // Prepare year-wise data for each topic
    const topicTrends = {};
    Array.from(allTopics).forEach(topic => {
      topicTrends[topic] = years.map(year => 
        topic_wise_distribution[year]?.[topic] || 0
      );
    });
    
    // Calculate total questions
    const totalQuestions = Object.values(year_totals).reduce((sum, count) => sum + count, 0);
    
    res.json({
      topicFrequency,
      years,
      yearTotals: year_totals,
      topicWiseDistribution: topic_wise_distribution,
      topicTrends,
      totalQuestions,
      analysisDate: pyqData.analysis_date,
      source: pyqData.source
    });
  } catch (error) {
    console.error('Error in trends endpoint:', error);
    res.status(500).json({ message: 'Error fetching trends data' });
  }
});

// Detailed Subtopic Analysis
let detailedSubtopics = null;
try {
  const subtopicsPath = join(__dirname, 'data', 'detailed_subtopics.json');
  detailedSubtopics = JSON.parse(readFileSync(subtopicsPath, 'utf8'));
  console.log('✅ Loaded detailed subtopics data');
} catch (error) {
  console.error('⚠️  Error loading detailed subtopics:', error.message);
}

app.get('/api/trends/detailed/:subject?', authMiddleware, async (req, res) => {
  try {
    const { subject } = req.params;
    
    if (!pyqData || !detailedSubtopics) {
      return res.status(500).json({ message: 'Analysis data not available' });
    }

    const { topic_wise_distribution, year_totals } = pyqData;
    const years = Object.keys(year_totals).sort();
    
    // If specific subject requested
    if (subject && detailedSubtopics[subject]) {
      const subjectData = detailedSubtopics[subject];
      const subtopics = subjectData.subtopics;
      
      // Calculate year-wise breakdown for each subtopic
      const subtopicYearData = {};
      Object.keys(subtopics).forEach(subtopic => {
        subtopicYearData[subtopic] = years.map(year => {
          const subjectTotal = topic_wise_distribution[year]?.[subject] || 0;
          const subtopicWeight = subtopics[subtopic].weight;
          return Math.round(subjectTotal * subtopicWeight);
        });
      });
      
      // Calculate totals
      const subtopicTotals = {};
      Object.keys(subtopics).forEach(subtopic => {
        subtopicTotals[subtopic] = subtopicYearData[subtopic].reduce((sum, val) => sum + val, 0);
      });
      
      return res.json({
        subject,
        subtopics,
        years,
        subtopicYearData,
        subtopicTotals,
        totalQuestions: Object.values(subtopicTotals).reduce((sum, val) => sum + val, 0)
      });
    }
    
    // Return all subjects with subtopic summary
    const allSubjectsData = {};
    Object.keys(detailedSubtopics).forEach(subj => {
      const subtopics = detailedSubtopics[subj].subtopics;
      const subjectTotal = Object.values(topic_wise_distribution).reduce((sum, yearData) => {
        return sum + (yearData[subj] || 0);
      }, 0);
      
      const subtopicTotals = {};
      Object.keys(subtopics).forEach(subtopic => {
        subtopicTotals[subtopic] = Math.round(subjectTotal * subtopics[subtopic].weight);
      });
      
      allSubjectsData[subj] = {
        subtopics: subtopicTotals,
        total: subjectTotal
      };
    });
    
    res.json({
      subjects: allSubjectsData,
      years,
      availableSubjects: Object.keys(detailedSubtopics)
    });
    
  } catch (error) {
    console.error('Error in detailed trends endpoint:', error);
    res.status(500).json({ message: 'Error fetching detailed trends' });
  }
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
