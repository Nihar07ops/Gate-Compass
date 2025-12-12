import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  topic: { type: String, required: true },
  subject: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  questionType: { type: String, enum: ['MCQ', 'MSQ', 'NAT'], required: true },
  year: { type: Number },
  marks: { type: Number, default: 1 },
  explanation: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Question', questionSchema);
