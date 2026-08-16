const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const InterviewSession = require('../models/InterviewSession');
const ResumeAnalysis = require('../models/ResumeAnalysis');

// POST /api/interview/generate
router.post('/generate', auth({ required: false }), async (req, res) => {
  try {
    const { jobDescription, level = 'mid', roleTitle = 'Software Engineer' } = req.body;

    if (!jobDescription || jobDescription.trim().length < 10) {
      return res.status(400).json({ error: 'Job description is required to generate interview questions.' });
    }

    const questions = await aiService.generateQuestions(jobDescription, level);

    let savedSession = null;
    try {
      if (InterviewSession.db.readyState === 1) {
        const session = new InterviewSession({
          userId: req.user ? req.user.id : null,
          roleTitle,
          level,
          jobDescription: jobDescription.slice(0, 1000),
          questions: questions.map((q) => ({
            id: q.id,
            type: q.type,
            question: q.question,
            context: q.context,
            sampleAnswer: q.sampleAnswer,
          })),
        });
        savedSession = await session.save();
      }
    } catch (dbErr) {
      console.warn('DB session save skipped:', dbErr.message);
    }

    res.json({
      sessionId: savedSession ? savedSession._id : `session_${Date.now()}`,
      roleTitle,
      level,
      questions,
    });
  } catch (err) {
    console.error('Error generating questions:', err);
    res.status(500).json({ error: 'Failed to generate mock interview questions.' });
  }
});

// POST /api/interview/evaluate
router.post('/evaluate', auth({ required: false }), async (req, res) => {
  try {
    const { sessionId, questionId, question, answer, jobDescription } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Both question and candidate answer are required.' });
    }

    const evaluation = await aiService.evaluateAnswer(question, answer, jobDescription || '');

    // If session ID exists and DB connected, update session question evaluation
    try {
      if (sessionId && InterviewSession.db.readyState === 1) {
        const session = await InterviewSession.findById(sessionId);
        if (session) {
          const qObj = session.questions.find((q) => q.id === questionId || q.question === question);
          if (qObj) {
            qObj.userAnswer = answer;
            qObj.evaluation = {
              ...evaluation,
              evaluatedAt: new Date(),
            };
            await session.save();
          }
        }
      }
    } catch (dbErr) {
      console.warn('Could not update session evaluation in DB:', dbErr.message);
    }

    res.json({
      questionId,
      answer,
      evaluation,
    });
  } catch (err) {
    console.error('Error evaluating answer:', err);
    res.status(500).json({ error: 'Failed to evaluate answer.' });
  }
});

// GET /api/interview/history
router.get('/history', auth({ required: false }), async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId && InterviewSession.db.readyState !== 1) {
      return res.json({ resumeAnalyses: [], interviewSessions: [] });
    }

    const query = userId ? { $or: [{ userId }, { userId: null }] } : {};

    const [resumeAnalyses, interviewSessions] = await Promise.all([
      ResumeAnalysis.db.readyState === 1 ? ResumeAnalysis.find(query).sort({ createdAt: -1 }).limit(20) : [],
      InterviewSession.db.readyState === 1 ? InterviewSession.find(query).sort({ createdAt: -1 }).limit(20) : []
    ]);

    res.json({
      resumeAnalyses,
      interviewSessions
    });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch user practice history.' });
  }
});

// DELETE /api/interview/history/:id
router.delete('/history/:id', auth({ required: true }), async (req, res) => {
  try {
    const { id } = req.params;
    if (ResumeAnalysis.db.readyState === 1) {
      await ResumeAnalysis.deleteOne({ _id: id, userId: req.user.id });
      await InterviewSession.deleteOne({ _id: id, userId: req.user.id });
    }
    res.json({ message: 'History item removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item.' });
  }
});

module.exports = router;
