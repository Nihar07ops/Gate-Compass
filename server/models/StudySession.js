import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  subtopic: String,
  sessionType: {
    type: String,
    enum: ['Study', 'Practice', 'Review', 'Mock Test'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: {
    type: Number, // in minutes
    default: 0
  },
  questionsAttempted: {
    type: Number,
    default: 0
  },
  questionsCorrect: {
    type: Number,
    default: 0
  },
  notes: String,
  resources: [{
    type: String,
    url: String,
    title: String
  }],
  progress: {
    conceptsLearned: [{
      concept: String,
      confidence: {
        type: Number,
        min: 1,
        max: 5
      }
    }],
    weakAreas: [String],
    strongAreas: [String]
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
studySessionSchema.index({ userId: 1, createdAt: -1 });
studySessionSchema.index({ topic: 1, sessionType: 1 });

export default mongoose.model('StudySession', studySessionSchema);