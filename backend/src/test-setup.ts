import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.development for tests
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });
