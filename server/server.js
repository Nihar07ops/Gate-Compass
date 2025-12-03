import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import authRoutes from './routes/auth.js';
import trendsRoutes from './routes/trends.js';
import predictionRoutes from './routes/prediction.js';
import testRoutes from './routes/tests.js';
import analyticsRoutes from './routes/analytics.js';
import dashboardRoutes from './routes/dashboard.js';
import { updatePredictions } from './utils/cronJobs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api', testRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);

cron.schedule('0 0 * * 0', updatePredictions);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
