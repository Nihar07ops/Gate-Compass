import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client
const redisClient = createClient({
    url: REDIS_URL,
});

// Error handling
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Redis client connected');
});

// Connect to Redis
let isConnected = false;

export const connectRedis = async (): Promise<boolean> => {
    try {
        if (!isConnected) {
            await redisClient.connect();
            isConnected = true;
            console.log('Successfully connected to Redis');
        }
        return true;
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        return false;
    }
};

export const disconnectRedis = async (): Promise<void> => {
    try {
        if (isConnected) {
            await redisClient.quit();
            isConnected = false;
            console.log('Redis connection closed');
        }
    } catch (error) {
        console.error('Error disconnecting from Redis:', error);
    }
};

export default redisClient;
