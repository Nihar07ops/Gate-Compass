import mongoose from 'mongoose';

const testAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testType: {
    type: String,
    enum: ['Mock Test', 'Topic Test', 'Full Test', 'Practice'],
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedAnswer: {
      type: Number,
      min: 0,
      max: 3
    },
    isCorrect: Boolean,
    timeTaken: {
      type: Number, // in seconds
      default: 0
    },
    marksAwarded: {
      type: Number,
      default: 0
    }
  }],
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: {
    type: Number, // in minutes
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  score: {
    totalQuestions: {
      type: Number,
      required: true
    },
    attempted: {
      type: Number,
      default: 0
    },
    correct: {
      type: Number,
      default: 0
    },
    incorrect: {
      type: Number,
      default: 0
    },
    unattempted: {
      type: Number,
      default: 0
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    marksObtained: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  analysis: {
    topicWise: [{
      topic: String,
      total: Number,
      correct: Number,
      percentage: Number
    }],
    difficultyWise: [{
      difficulty: String,
      total: Number,
      correct: Number,
      percentage: Number
    }]
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Abandoned'],
    default: 'In Progress'
  }
}, {
  timestamps: true
});

// Index for efficient querying
testAttemptSchema.index({ userId: 1, createdAt: -1 });
testAttemptSchema.index({ testType: 1, status: 1 });

export default mongoose.model('TestAttempt', testAttemptSchema);