// Demo configuration for GitHub Pages deployment
// Enable demo mode in production OR when backend is not available
const isDemoMode = () => {
    try {
        return process.env.NODE_ENV === 'production' ||
            process.env.VITE_DEMO_MODE === 'true' ||
            (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) ||
            (typeof window !== 'undefined' && window.location.search.includes('demo=true')) ||
            (typeof localStorage !== 'undefined' && localStorage.getItem('forceDemo') === 'true');
    } catch (error) {
        console.log('Demo mode detection error:', error);
        return false;
    }
};

export const DEMO_MODE = isDemoMode();

export const DEMO_CONFIG = {
    // Demo user credentials
    demoUser: {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@gatecompass.com',
        testsCompleted: 15,
        averageScore: 78,
        streak: 7
    },

    // Mock API responses
    mockResponses: {
        dashboard: {
            testsCompleted: 15,
            averageScore: 78,
            strongTopics: ['Programming & Data Structures', 'Algorithms', 'Database Management'],
            weakTopics: ['Computer Networks', 'Compiler Design', 'Digital Logic'],
            streak: 7,
            totalQuestions: 2500
        },

        analytics: {
            topicPerformance: [
                { topic: 'Programming & Data Structures', score: 85 },
                { topic: 'Algorithms', score: 82 },
                { topic: 'Database Management', score: 79 },
                { topic: 'Operating Systems', score: 76 },
                { topic: 'Computer Organization', score: 73 },
                { topic: 'Theory of Computation', score: 70 },
                { topic: 'Computer Networks', score: 65 },
                { topic: 'Compiler Design', score: 62 },
                { topic: 'Digital Logic', score: 60 }
            ],
            correct: 1170,
            incorrect: 480,
            unattempted: 50,
            averageScore: 78,
            totalTests: 15,
            totalQuestions: 1700
        }
    }
};

// Demo authentication functions
export const demoAuth = {
    login: (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    const token = 'demo-token-' + Date.now();
                    localStorage.setItem('token', token);
                    resolve({
                        token,
                        user: DEMO_CONFIG.demoUser
                    });
                } else {
                    reject(new Error('Please enter email and password'));
                }
            }, 1000);
        });
    },

    register: (name, email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const token = 'demo-token-' + Date.now();
                localStorage.setItem('token', token);
                resolve({
                    token,
                    user: { ...DEMO_CONFIG.demoUser, name, email }
                });
            }, 1000);
        });
    },

    getUser: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const token = localStorage.getItem('token');
                if (token) {
                    resolve(DEMO_CONFIG.demoUser);
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }
};