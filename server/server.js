import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Database and Models
import connectDB from './config/database.js';
import User from './models/User.js';
import Question from './models/Question.js';
import TestAttempt from './models/TestAttempt.js';
import StudySession from './models/StudySession.js';
import { seedDatabase } from './utils/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Gate-Compass Server with MongoDB',
    timestamp: new Date().toISOString(),
    database: 'MongoDB'
  });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      profile: profile || {}
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last active
    await user.updateLastActive();

    // Generate token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        progress: user.progress
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      profile: req.user.profile,
      progress: req.user.progress,
      achievements: req.user.achievements
    }
  });
});

// Question Routes
app.get('/api/questions', authMiddleware, async (req, res) => {
  try {
    const { topic, difficulty, year, limit = 20, page = 1 } = req.query;
    
    const filter = { isActive: true };
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (year) filter.year = parseInt(year);

    const questions = await Question.find(filter)
      .select('-correctAnswer -explanation') // Don't send answers in list
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ year: -1, createdAt: -1 });

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

app.get('/api/questions/:id', authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ question });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Failed to fetch question' });
  }
});

// Submit answer
app.post('/api/questions/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { selectedAnswer, timeTaken } = req.body;
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = selectedAnswer === question.correctAnswer;
    const marksAwarded = isCorrect ? question.marks : -question.negativeMarks;

    // Update question statistics
    question.statistics.totalAttempts += 1;
    if (isCorrect) question.statistics.correctAttempts += 1;
    
    // Update average time
    const currentAvg = question.statistics.averageTime;
    const totalAttempts = question.statistics.totalAttempts;
    question.statistics.averageTime = 
      ((currentAvg * (totalAttempts - 1)) + timeTaken) / totalAttempts;

    await question.save();

    // Update user progress
    const user = req.user;
    user.progress.totalQuestions += 1;
    if (isCorrect) user.progress.correctAnswers += 1;
    user.progress.totalStudyTime += Math.floor(timeTaken / 60); // Convert to minutes

    await user.save();

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      marksAwarded,
      userProgress: user.progress
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Failed to submit answer' });
  }
});

// Test Routes
app.post('/api/tests/start', authMiddleware, async (req, res) => {
  try {
    const { testType, testName, duration, topics, difficulty } = req.body;
    
    // Get questions based on criteria
    const filter = { isActive: true };
    if (topics && topics.length > 0) filter.topic = { $in: topics };
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .limit(20) // Default test size
      .select('_id');

    if (questions.length === 0) {
      return res.status(400).json({ message: 'No questions found for the given criteria' });
    }

    const testAttempt = new TestAttempt({
      userId: req.user._id,
      testType,
      testName,
      duration,
      startTime: new Date(),
      questions: questions.map(q => ({ questionId: q._id })),
      score: {
        totalQuestions: questions.length,
        totalMarks: questions.length * 2 // Assuming 2 marks per question
      }
    });

    await testAttempt.save();

    res.json({
      testId: testAttempt._id,
      questions: questions.map(q => q._id),
      duration,
      startTime: testAttempt.startTime
    });
  } catch (error) {
    console.error('Error starting test:', error);
    res.status(500).json({ message: 'Failed to start test' });
  }
});

// Analytics Routes
app.get('/api/analytics/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Get recent test attempts
    const recentTests = await TestAttempt.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('testName score createdAt');

    // Get topic-wise performance
    const topicStats = await TestAttempt.aggregate([
      { $match: { userId: user._id, status: 'Completed' } },
      { $unwind: '$analysis.topicWise' },
      {
        $group: {
          _id: '$analysis.topicWise.topic',
          totalQuestions: { $sum: '$analysis.topicWise.total' },
          correctAnswers: { $sum: '$analysis.topicWise.correct' },
          avgPercentage: { $avg: '$analysis.topicWise.percentage' }
        }
      }
    ]);

    res.json({
      userProgress: user.progress,
      recentTests,
      topicStats,
      achievements: user.achievements
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    const dbConnection = await connectDB();
    
    if (dbConnection) {
      // Seed database with initial data
      await seedDatabase();
      console.log('🌱 Database seeded successfully');
    } else {
      console.log('⚠️ Running without MongoDB - using fallback mode');
    }

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Frontend: http://localhost:3000`);
      console.log(`🔌 Backend: http://localhost:${PORT}`);
      console.log(`📊 Database: ${dbConnection ? 'MongoDB' : 'Fallback Mode'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();