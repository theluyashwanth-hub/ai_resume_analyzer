const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  roleTitle: {
    type: String,
    default: 'Target Role',
    trim: true,
  },
  resumeTextSnippet: {
    type: String,
    default: '',
  },
  jobDescription: {
    type: String,
    required: [true, 'Job Description is required'],
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  rawAnalysis: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
