import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temporary in-memory database for testing without MongoDB
const users = new Map();
const tests = new Map();
const questions = new Map();
const trends = new Map();

// Load questions from JSON file - Use Comprehensive GATE Database
let sampleQuestions = [];
try {
  // Try to load the new comprehensive database first
  const comprehensivePath = path.join(__dirname, '../../ml_service/data/comprehensive_gate_questions.json');
  const questionsData = JSON.parse(fs.readFileSync(comprehensivePath, 'utf-8'));
  sampleQuestions = questionsData.map(q => ({
    _id: q.id,
    text: q.text,
    options: q.options,
    correctAnswer: q.correctAnswer,
    topic: q.topic,
    subject: q.subject,
    section: q.section,
    difficulty: q.difficulty,
    questionType: q.questionType,
    year: q.year,
    marks: q.marks,
    numerical_value: q.numerical_value
  }));
  console.log(`✅ Loaded ${sampleQuestions.length} comprehensive GATE questions (2015-2024)`);
  
  // Count by section and year
  const sections = {};
  const years = {};
  const subjects = {};
  
  sampleQuestions.forEach(q => {
    sections[q.section] = (sections[q.section] || 0) + 1;
    years[q.year] = (years[q.year] || 0) + 1;
    subjects[q.subject] = (subjects[q.subject] || 0) + 1;
  });
  
  console.log(`📊 Sections: ${Object.entries(sections).map(([s, c]) => `${s}(${c})`).join(', ')}`);
  console.log(`📅 Years: ${Object.keys(years).sort().join(', ')} (${Object.keys(years).length} years)`);
  console.log(`📚 Subjects: ${Object.keys(subjects).length} subjects covered`);
} catch (error) {
  console.log('⚠️  Comprehensive database not found, trying GATE Professional Bank...');
  try {
    const gateProfessionalPath = path.join(__dirname, '../../ml_service/data/gate_professional_bank.json');
    const questionsData = JSON.parse(fs.readFileSync(gateProfessionalPath, 'utf-8'));
    sampleQuestions = questionsData.map(q => ({
      _id: q.id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      topic: q.topic,
      subject: q.subject,
      section: q.section,
      difficulty: q.difficulty,
      questionType: q.questionType,
      year: q.year,
      marks: q.marks
    }));
    console.log(`✅ Loaded ${sampleQuestions.length} GATE professional questions`);
  } catch (fallbackError) {
    console.log('⚠️  Using fallback questions');
    sampleQuestions = [
      {
        _id: '1',
        text: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'],
        correctAnswer: 'O(log n)',
        topic: 'Algorithms',
        subject: 'Data Structures and Algorithms',
        difficulty: 'easy',
        questionType: 'MCQ',
        year: 2023,
        marks: 1
      }
    ];
  }
}

sampleQuestions.forEach(q => questions.set(q._id, q));

// Create default test user
const defaultUser = {
  _id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: '$2a$10$8ktPMBFf1QgSvGa6wAFUduA3Og/b6eYj7bPYz6jHQTLrqyNbEkzpW', // password123
  testsCompleted: 0,
  totalScore: 0,
  streak: 0,
  topicPerformance: [],
  createdAt: new Date()
};
users.set(defaultUser._id, defaultUser);
console.log('👤 Default test user created: test@example.com / password123');

export const inMemoryDb = {
  users,
  tests,
  questions,
  trends,
  
  // Helper methods
  findUser: (query) => {
    if (query.email) {
      return Array.from(users.values()).find(u => u.email === query.email);
    }
    if (query._id) {
      return users.get(query._id);
    }
    return null;
  },
  
  createUser: (userData) => {
    const id = Date.now().toString();
    const user = { _id: id, ...userData, createdAt: new Date() };
    users.set(id, user);
    return user;
  },
  
  createTest: (testData) => {
    const id = Date.now().toString();
    const test = { _id: id, ...testData, createdAt: new Date() };
    tests.set(id, test);
    return test;
  },
  
  getQuestions: (limit = 50, filters = {}) => {
    let questionList = Array.from(questions.values());
    
    // Apply filters
    if (filters.difficulty) {
      questionList = questionList.filter(q => q.difficulty === filters.difficulty);
    }
    if (filters.subject) {
      questionList = questionList.filter(q => q.subject === filters.subject);
    }
    if (filters.topic) {
      questionList = questionList.filter(q => q.topic === filters.topic);
    }
    if (filters.year) {
      questionList = questionList.filter(q => q.year === filters.year);
    }
    
    // Shuffle and limit
    const shuffled = questionList.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  },
  
  getQuestionById: (id) => {
    return questions.get(id);
  },
  
  getUserTests: (userId) => {
    return Array.from(tests.values()).filter(t => t.userId === userId);
  },
  
  getAllTopics: () => {
    const topics = new Set();
    Array.from(questions.values()).forEach(q => topics.add(q.topic));
    return Array.from(topics);
  },
  
  getAllSubjects: () => {
    const subjects = new Set();
    Array.from(questions.values()).forEach(q => subjects.add(q.subject));
    return Array.from(subjects);
  },
  
  getQuestionsBySubject: (subject) => {
    return Array.from(questions.values()).filter(q => q.subject === subject);
  },
  
  getQuestionsByYear: (year) => {
    return Array.from(questions.values()).filter(q => q.year === year);
  },
  
  updateUser: (id, updates) => {
    const user = users.get(id);
    if (user) {
      Object.assign(user, updates);
      users.set(id, user);
    }
    return user;
  },
  
  saveTest: (testData) => {
    const id = Date.now().toString();
    const test = { _id: id, ...testData, createdAt: new Date() };
    tests.set(id, test);
    return test;
  },
  
  getTest: (testId) => {
    return tests.get(testId);
  },
  
  generateGATEFormatTest: () => {
    // Generate a full GATE format test with 65 questions
    const allQuestions = Array.from(questions.values());
    
    // GATE format distribution
    const coreCSQuestions = allQuestions.filter(q => q.section === 'Core Computer Science');
    const aptitudeQuestions = allQuestions.filter(q => q.section === 'General Aptitude');
    const mathQuestions = allQuestions.filter(q => q.section === 'Engineering Mathematics');
    
    // Select questions (randomized)
    const selectedCore = coreCSQuestions.sort(() => 0.5 - Math.random()).slice(0, 55);
    const selectedAptitude = aptitudeQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
    const selectedMath = mathQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
    
    const testQuestions = [...selectedCore, ...selectedAptitude, ...selectedMath]
      .sort(() => 0.5 - Math.random()); // Final shuffle
    
    return {
      questions: testQuestions,
      metadata: {
        totalQuestions: testQuestions.length,
        format: 'GATE',
        sections: {
          'Core Computer Science': selectedCore.length,
          'General Aptitude': selectedAptitude.length,
          'Engineering Mathematics': selectedMath.length
        },
        timeLimit: 180, // 3 hours
        totalMarks: testQuestions.reduce((sum, q) => sum + (q.marks || 1), 0)
      }
    };
  }
};