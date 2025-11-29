import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  answers: { type: Map, of: String },
  score: { type: Number },
  totalQuestions: { type: Number },
  correctAnswers: { type: Number },
  timeTaken: { type: Number },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export default mongoose.model('Test', testSchema);
