import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/Question.js';
import Trend from '../models/Trend.js';
import fs from 'fs';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Question.deleteMany({});
    await Trend.deleteMany({});

    const sampleQuestions = JSON.parse(
      fs.readFileSync('../ml_service/data/sample_questions.json', 'utf-8')
    );
    await Question.insertMany(sampleQuestions);

    const sampleTrends = [
      {
        year: 2023,
        topicFrequency: [
          { topic: 'Algorithms', count: 15, percentage: 20 },
          { topic: 'Data Structures', count: 12, percentage: 16 }
        ],
        difficultyDistribution: { easy: 20, medium: 50, hard: 30 },
        averageDifficulty: 3.2,
        questionTypes: { MCQ: 40, MSQ: 15, NAT: 10 }
      }
    ];
    await Trend.insertMany(sampleTrends);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
