import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import passport from 'passport';
import { testConnection, closePool } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { configurePassport } from './config/passport';
import { scheduleTrendAnalysis } from './jobs/trendAnalysisJob';
import { sanitizeInput, generalRateLimiter } from './middleware/security';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import trendRoutes from './routes/trends';
import testRoutes from './routes/tests';
import resultsRoutes from './routes/results';

// Load environment variables from backend directory
const envPath = path.resolve(__dirname, '../.env.development');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });
console.log('GOOGLE_CLIENT_ID loaded:', process.env.GOOGLE_CLIENT_ID ? 'YES' : 'NO');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Input sanitization middleware
app.use(sanitizeInput);

// General rate limiting
app.use(generalRateLimiter);

// Initialize Passport
app.use(passport.initialize());
configurePassport();

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultsRoutes);

// Initialize database and start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('Failed to connect to database. Server not started.');
            process.exit(1);
        }

        // Connect to Redis
        const redisConnected = await connectRedis();
        if (!redisConnected) {
            console.warn('Failed to connect to Redis. Caching will be disabled.');
        }

        // Schedule trend analysis cron job
        scheduleTrendAnalysis();

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        });

        // Graceful shutdown
        const gracefulShutdown = async () => {
            console.log('Received shutdown signal, closing server gracefully...');
            server.close(async () => {
                console.log('HTTP server closed');
                await closePool();
                await disconnectRedis();
                process.exit(0);
            });
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
