const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['technical', 'behavioral'], default: 'technical' },
  question: { type: String, required: true },
  context: { type: String, default: '' },
  sampleAnswer: { type: String, default: '' },
  userAnswer: { type: String, default: '' },
  evaluation: {
    score: { type: Number, min: 0, max: 10, default: null },
    clarity: { type: Number, min: 0, max: 10, default: null },
    relevance: { type: Number, min: 0, max: 10, default: null },
    technicalAccuracy: { type: Number, min: 0, max: 10, default: null },
    feedback: [{ type: String }],
    keyTakeaway: { type: String, default: '' },
    evaluatedAt: { type: Date },
  },
});

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  roleTitle: {
    type: String,
    default: 'Candidate Position',
  },
  level: {
    type: String,
    enum: ['junior', 'mid', 'senior'],
    default: 'mid',
  },
  jobDescription: {
    type: String,
    default: '',
  },
  questions: [questionSchema],
  overallScore: {
    type: Number,
    min: 0,
    max: 10,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
