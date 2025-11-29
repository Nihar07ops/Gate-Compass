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

// Load questions from JSON file - Try GATE format first
let sampleQuestions = [];
try {
  const gateFormatPath = path.join(__dirname, '../../ml_service/data/gate_format_complete.json');
  const questionsData = JSON.parse(fs.readFileSync(gateFormatPath, 'utf8'));
  sampleQuestions = questionsData.questions.map(q => ({
    _id: q.id,
    text: q.text,
    options: q.options,
    correctAnswer: q.correctAnswer,
    topic: q.topic,
    subject: q.section,
    section: q.section,
    difficulty: q.difficulty,
    questionType: 'MCQ',
    year: q.year,
    marks: q.marks
  }));
  console.log(`✅ Loaded ${sampleQuestions.length} GATE format questions`);
  console.log(`📊 Sections: GA(${questionsData.metadata.sections['General Aptitude'].questions}), EM(${questionsData.metadata.sections['Engineering Mathematics'].questions}), CS(${questionsData.metadata.sections['Core Computer Science'].questions})`);
} catch (error) {
  // Fallback to enhanced questions
  try {
    const questionsPath = path.join(__dirname, '../../ml_service/data/gate_questions_complete.json');
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    sampleQuestions = questionsData.questions.map(q => ({
      _id: q.id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      topic: q.topic,
      subject: q.subject,
      difficulty: q.difficulty,
      questionType: 'MCQ',
      year: q.year,
      marks: q.marks
    }));
    console.log(`✅ Loaded ${sampleQuestions.length} questions from database`);
  } catch (error2) {
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
  
  saveUser: (user) => {
    const id = user._id || Date.now().toString();
    user._id = id;
    users.set(id, user);
    return user;
  },
  
  getQuestions: (limit = 10, filters = {}) => {
    let allQuestions = Array.from(questions.values());
    
    // Apply filters
    if (filters.difficulty) {
      allQuestions = allQuestions.filter(q => q.difficulty === filters.difficulty);
    }
    if (filters.topic) {
      allQuestions = allQuestions.filter(q => q.topic === filters.topic);
    }
    if (filters.subject) {
      allQuestions = allQuestions.filter(q => q.subject === filters.subject);
    }
    
    // Shuffle questions for variety
    allQuestions = allQuestions.sort(() => Math.random() - 0.5);
    
    return allQuestions.slice(0, limit);
  },
  
  getAllTopics: () => {
    const topics = new Set();
    Array.from(questions.values()).forEach(q => topics.add(q.topic));
    return Array.from(topics);
  },
  
  getQuestionsByTopic: (topic) => {
    return Array.from(questions.values()).filter(q => q.topic === topic);
  },
  
  getQuestionsBySection: (section) => {
    return Array.from(questions.values()).filter(q => q.section === section);
  },
  
  generateGATEFormatTest: () => {
    const allQuestions = Array.from(questions.values());
    
    // Get questions by section
    const gaQuestions = allQuestions.filter(q => q.section === 'General Aptitude');
    const emQuestions = allQuestions.filter(q => q.section === 'Engineering Mathematics');
    const csQuestions = allQuestions.filter(q => q.section === 'Core Computer Science');
    
    // Select questions (or use all if less than required)
    const selectedGA = gaQuestions.slice(0, Math.min(10, gaQuestions.length));
    const selectedEM = emQuestions.slice(0, Math.min(13, emQuestions.length));
    const selectedCS = csQuestions.slice(0, Math.min(42, csQuestions.length));
    
    // Combine all sections
    const testQuestions = [...selectedGA, ...selectedEM, ...selectedCS];
    
    return {
      questions: testQuestions,
      metadata: {
        totalQuestions: testQuestions.length,
        totalMarks: testQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
        sections: {
          'General Aptitude': selectedGA.length,
          'Engineering Mathematics': selectedEM.length,
          'Core Computer Science': selectedCS.length
        },
        duration: 180, // 3 hours in minutes
        format: 'GATE CSE'
      }
    };
  },
  
  saveTest: (test) => {
    const id = test._id || Date.now().toString();
    test._id = id;
    tests.set(id, test);
    return test;
  },
  
  getTest: (id) => {
    return tests.get(id);
  },
  
  updateUser: (id, updates) => {
    const user = users.get(id);
    if (user) {
      Object.assign(user, updates);
      users.set(id, user);
    }
    return user;
  }
};
