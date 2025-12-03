import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  testsCompleted: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  topicPerformance: [{
    topic: String,
    correct: Number,
    total: Number,
    score: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
