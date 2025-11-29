// Temporary in-memory database for testing without MongoDB
const users = new Map();
const tests = new Map();
const questions = new Map();
const trends = new Map();

// Sample data
const sampleQuestions = [
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
  },
  {
    _id: '2',
    text: 'Which scheduling algorithm can cause starvation?',
    options: ['FCFS', 'Round Robin', 'Priority Scheduling', 'SJF'],
    correctAnswer: 'Priority Scheduling',
    topic: 'Process Scheduling',
    subject: 'Operating Systems',
    difficulty: 'medium',
    questionType: 'MCQ',
    year: 2023,
    marks: 2
  }
];

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
  
  getQuestions: (limit = 10) => {
    return Array.from(questions.values()).slice(0, limit);
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
