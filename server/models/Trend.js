import mongoose from 'mongoose';

const trendSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  topicFrequency: [{
    topic: String,
    count: Number,
    percentage: Number
  }],
  difficultyDistribution: {
    easy: Number,
    medium: Number,
    hard: Number
  },
  averageDifficulty: { type: Number },
  questionTypes: {
    MCQ: Number,
    MSQ: Number,
    NAT: Number
  },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Trend', trendSchema);
