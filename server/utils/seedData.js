import Question from '../models/Question.js';
import User from '../models/User.js';

// Sample GATE CSE Questions
const sampleQuestions = [
  {
    questionId: 'GATE2024-CS-01',
    question: 'What is the time complexity of inserting an element at the beginning of a linked list?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 0,
    explanation: 'Inserting at the beginning of a linked list requires only updating the head pointer, which takes constant time O(1).',
    topic: 'Data Structures',
    subtopic: 'Linked Lists',
    difficulty: 'Easy',
    year: 2024,
    marks: 1
  },
  {
    questionId: 'GATE2024-CS-02',
    question: 'Which sorting algorithm has the best average-case time complexity?',
    options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
    correctAnswer: 1,
    explanation: 'Quick Sort has an average-case time complexity of O(n log n), which is better than the O(n²) complexity of the other options.',
    topic: 'Algorithms',
    subtopic: 'Sorting',
    difficulty: 'Medium',
    year: 2024,
    marks: 2
  },
  {
    questionId: 'GATE2024-CS-03',
    question: 'In a binary search tree, what is the time complexity of searching for an element in the worst case?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 2,
    explanation: 'In the worst case, a BST can become skewed (like a linked list), resulting in O(n) search time.',
    topic: 'Data Structures',
    subtopic: 'Trees',
    difficulty: 'Medium',
    year: 2024,
    marks: 2
  },
  {
    questionId: 'GATE2023-CS-01',
    question: 'What is the maximum number of edges in a simple undirected graph with n vertices?',
    options: ['n', 'n-1', 'n(n-1)/2', 'n²'],
    correctAnswer: 2,
    explanation: 'In a complete graph with n vertices, each vertex connects to (n-1) others. Total edges = n(n-1)/2.',
    topic: 'Graph Theory',
    subtopic: 'Graph Properties',
    difficulty: 'Easy',
    year: 2023,
    marks: 1
  },
  {
    questionId: 'GATE2023-CS-02',
    question: 'Which of the following is NOT a property of a regular language?',
    options: ['Closed under union', 'Closed under intersection', 'Closed under complement', 'Closed under context-free grammar'],
    correctAnswer: 3,
    explanation: 'Regular languages are closed under union, intersection, and complement, but not all context-free grammars generate regular languages.',
    topic: 'Theory of Computation',
    subtopic: 'Regular Languages',
    difficulty: 'Hard',
    year: 2023,
    marks: 2
  }
];

// Sample users for testing
const sampleUsers = [
  {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    profile: {
      firstName: 'Test',
      lastName: 'User',
      college: 'Test University',
      graduationYear: 2024,
      targetExam: 'GATE CSE'
    }
  },
  {
    username: 'admin',
    email: 'admin@gatecompass.com',
    password: 'admin123',
    role: 'admin',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      college: 'Gate Compass',
      targetExam: 'GATE CSE'
    }
  }
];

export const seedQuestions = async () => {
  try {
    // Check if questions already exist
    const existingQuestions = await Question.countDocuments();
    
    if (existingQuestions > 0) {
      console.log(`📚 ${existingQuestions} questions already exist in database`);
      return;
    }

    // Insert sample questions
    const questions = await Question.insertMany(sampleQuestions);
    console.log(`✅ Seeded ${questions.length} sample questions`);
    
    return questions;
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    throw error;
  }
};

export const seedUsers = async () => {
  try {
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      console.log(`👥 ${existingUsers} users already exist in database`);
      return;
    }

    // Insert sample users
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Seeded ${users.length} sample users`);
    
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await seedUsers();
    await seedQuestions();
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};