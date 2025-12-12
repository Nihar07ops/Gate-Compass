import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  subtopic: String,
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  examType: {
    type: String,
    enum: ['GATE', 'Mock', 'Practice'],
    default: 'GATE'
  },
  marks: {
    type: Number,
    default: 1
  },
  negativeMarks: {
    type: Number,
    default: 0.33
  },
  tags: [{
    type: String
  }],
  statistics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    correctAttempts: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
questionSchema.index({ topic: 1, difficulty: 1, year: 1 });
questionSchema.index({ questionId: 1 });

export default mongoose.model('Question', questionSchema);