const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Question = require('../models/Question');
const TestResult = require('../models/TestResult');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Question.deleteMany({});
    await TestResult.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    const users = [
      {
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
      },
      {
        name: 'Demo Student',
        email: 'demo@example.com',
        password: await bcrypt.hash('demo123', 10),
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('john123', 10),
      },
    ];

    await User.insertMany(users);
    console.log('✅ Seeded users:', users.length);
    return users;
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

// Seed questions from JSON file
const seedQuestions = async () => {
  try {
    // Try to load questions from ML service
    const questionsPath = path.join(__dirname, '../../ml_service/data/gate_questions_complete.json');
    
    if (!fs.existsSync(questionsPath)) {
      console.log('⚠️  Questions file not found. Generating...');
      console.log('Run: cd ml_service/data && python enhanced_questions.py');
      
      // Create sample questions as fallback
      const sampleQuestions = [
        {
          subject: 'Algorithms',
          topic: 'Sorting',
          difficulty: 'medium',
          question: 'What is the time complexity of QuickSort in the average case?',
          options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
          answer: 1,
          explanation: 'QuickSort has an average time complexity of O(n log n) due to the divide-and-conquer approach.',
          year: 2023,
        },
        {
          subject: 'Data Structures',
          topic: 'Trees',
          difficulty: 'easy',
          question: 'What is the maximum number of nodes in a binary tree of height h?',
          options: ['2^h', '2^h - 1', '2^(h+1) - 1', '2^(h-1)'],
          answer: 2,
          explanation: 'A binary tree of height h can have at most 2^(h+1) - 1 nodes.',
          year: 2023,
        },
        {
          subject: 'Operating Systems',
          topic: 'Process Management',
          difficulty: 'medium',
          question: 'Which scheduling algorithm can lead to starvation?',
          options: ['FCFS', 'Round Robin', 'Priority Scheduling', 'SJF'],
          answer: 2,
          explanation: 'Priority Scheduling can lead to starvation if high-priority processes keep arriving.',
          year: 2022,
        },
      ];

      await Question.insertMany(sampleQuestions);
      console.log('✅ Seeded sample questions:', sampleQuestions.length);
      return sampleQuestions;
    }

    // Load questions from file
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    const questions = questionsData.questions || questionsData;

    // Transform questions to match schema
    const formattedQuestions = questions.map(q => ({
      subject: q.subject,
      topic: q.topic || 'General',
      difficulty: q.difficulty || 'medium',
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation || 'No explanation provided.',
      year: q.year || 2023,
    }));

    await Question.insertMany(formattedQuestions);
    console.log('✅ Seeded questions from file:', formattedQuestions.length);
    return formattedQuestions;
  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  }
};

// Seed sample test results
const seedTestResults = async (users, questions) => {
  try {
    if (!users || users.length === 0 || !questions || questions.length === 0) {
      console.log('⚠️  Skipping test results (no users or questions)');
      return;
    }

    const testResults = [
      {
        user: users[0]._id,
        questions: questions.slice(0, 5).map(q => q._id),
        answers: [1, 2, 0, 1, 2],
        score: 80,
        totalQuestions: 5,
        timeTaken: 600, // 10 minutes
        completedAt: new Date(),
      },
      {
        user: users[1]._id,
        questions: questions.slice(0, 10).map(q => q._id),
        answers: [1, 2, 0, 1, 2, 3, 1, 0, 2, 1],
        score: 70,
        totalQuestions: 10,
        timeTaken: 1200, // 20 minutes
        completedAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ];

    await TestResult.insertMany(testResults);
    console.log('✅ Seeded test results:', testResults.length);
  } catch (error) {
    console.error('Error seeding test results:', error);
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    await connectDB();
    await clearDatabase();

    const users = await seedUsers();
    const questions = await seedQuestions();
    await seedTestResults(users, questions);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users?.length || 0}`);
    console.log(`   Questions: ${questions?.length || 0}`);
    console.log('\n🔐 Test Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('\n🚀 You can now start the server with: node server.js');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
