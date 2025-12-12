import { DEMO_CONFIG } from '../config/demo';

// Mock API responses for demo mode
const mockDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const demoApi = {
    // Dashboard data
    getDashboard: async () => {
        console.log('Demo API: getDashboard called');
        await mockDelay();
        const data = DEMO_CONFIG.mockResponses.dashboard;
        console.log('Demo API: returning dashboard data:', data);
        return { data };
    },

    // Analytics data
    getAnalytics: async () => {
        await mockDelay();
        return { data: DEMO_CONFIG.mockResponses.analytics };
    },

    // Generate mock test
    generateTest: async (config) => {
        await mockDelay(1200);

        const mockQuestions = [
            {
                _id: '1',
                text: 'What is the time complexity of binary search in a sorted array?',
                options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
                correctAnswer: 'O(log n)',
                topic: 'Algorithms',
                subject: 'Data Structures and Algorithms',
                difficulty: 'medium',
                marks: 1
            },
            {
                _id: '2',
                text: 'Which data structure is used for implementing recursion?',
                options: ['Queue', 'Stack', 'Array', 'Linked List'],
                correctAnswer: 'Stack',
                topic: 'Data Structures',
                subject: 'Data Structures and Algorithms',
                difficulty: 'easy',
                marks: 1
            },
            {
                _id: '3',
                text: 'In which scheduling algorithm does the process with shortest burst time get executed first?',
                options: ['FCFS', 'SJF', 'Round Robin', 'Priority'],
                correctAnswer: 'SJF',
                topic: 'Process Scheduling',
                subject: 'Operating Systems',
                difficulty: 'medium',
                marks: 2
            },
            {
                _id: '4',
                text: 'What is the maximum number of edges in a simple graph with n vertices?',
                options: ['n', 'n-1', 'n(n-1)/2', 'n²'],
                correctAnswer: 'n(n-1)/2',
                topic: 'Graph Theory',
                subject: 'Discrete Mathematics',
                difficulty: 'medium',
                marks: 1
            },
            {
                _id: '5',
                text: 'Which normal form eliminates transitive dependencies?',
                options: ['1NF', '2NF', '3NF', 'BCNF'],
                correctAnswer: '3NF',
                topic: 'Normalization',
                subject: 'Database Management Systems',
                difficulty: 'medium',
                marks: 2
            }
        ];

        const questionCount = config.format === 'gate' ? 65 : (config.topicCount || 5);
        const questions = [];

        // Generate questions based on request
        for (let i = 0; i < questionCount; i++) {
            const baseQuestion = mockQuestions[i % mockQuestions.length];
            questions.push({
                ...baseQuestion,
                _id: `demo-${i + 1}`,
                text: `${baseQuestion.text} (Question ${i + 1})`
            });
        }

        return {
            data: {
                _id: `test-${Date.now()}`,
                questions,
                totalQuestions: questions.length,
                metadata: {
                    format: config.format || 'custom',
                    totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
                    timeLimit: config.format === 'gate' ? 180 : 60
                }
            }
        };
    },

    // Submit test
    submitTest: async (testId, answers) => {
        await mockDelay(1000);

        const totalQuestions = Object.keys(answers).length || 5;
        const correct = Math.floor(totalQuestions * 0.7); // 70% correct rate
        const incorrect = totalQuestions - correct;
        const score = (correct / totalQuestions) * 100;

        return {
            data: {
                score: Math.round(score),
                correct,
                incorrect,
                unanswered: 0,
                total: totalQuestions,
                details: Object.keys(answers).map((qId, index) => ({
                    questionId: qId,
                    isCorrect: index < correct,
                    topic: 'Demo Topic',
                    subject: 'Demo Subject'
                }))
            }
        };
    },

    // Predictions
    getPredictions: async () => {
        await mockDelay();
        return {
            data: {
                topicImportance: [
                    { topic: 'Programming & Data Structures', score: 95 },
                    { topic: 'Algorithms', score: 90 },
                    { topic: 'Database Management', score: 85 },
                    { topic: 'Computer Organization', score: 80 },
                    { topic: 'Operating Systems', score: 75 },
                    { topic: 'Theory of Computation', score: 70 },
                    { topic: 'Computer Networks', score: 65 },
                    { topic: 'Compiler Design', score: 60 }
                ],
                highPriorityTopics: [
                    'Programming & Data Structures',
                    'Algorithms',
                    'Database Management'
                ],
                recommendations: [
                    'Focus on coding practice for Programming & Data Structures',
                    'Master sorting and searching algorithms',
                    'Practice SQL queries and database design'
                ]
            }
        };
    },

    // Authentication endpoints for API wrapper
    login: async (data) => {
        await mockDelay(1000);
        if (data.email && data.password) {
            const token = 'demo-token-' + Date.now();
            localStorage.setItem('token', token);
            return {
                data: {
                    token,
                    user: DEMO_CONFIG.demoUser
                }
            };
        } else {
            throw new Error('Please enter email and password');
        }
    },

    register: async (data) => {
        await mockDelay(1000);
        const token = 'demo-token-' + Date.now();
        localStorage.setItem('token', token);
        return {
            data: {
                token,
                user: { ...DEMO_CONFIG.demoUser, name: data.name, email: data.email }
            }
        };
    },

    getUser: async () => {
        await mockDelay(500);
        const token = localStorage.getItem('token');
        if (token) {
            return { data: DEMO_CONFIG.demoUser };
        } else {
            throw new Error('No token found');
        }
    }
};