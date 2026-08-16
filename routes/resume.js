const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const ResumeAnalysis = require('../models/ResumeAnalysis');

// Configure multer memory storage for PDF processing
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported for resume upload.'));
    }
  }
});

// POST /api/resume/analyze
// Accepts either PDF file upload ('resumeFile') or raw text in req.body ('resumeText') along with 'jobDescription'
router.post('/analyze', auth({ required: false }), upload.single('resumeFile'), async (req, res) => {
  try {
    let resumeText = req.body.resumeText || '';
    const jobDescription = req.body.jobDescription || '';
    const roleTitle = req.body.roleTitle || 'Target Role';

    // If PDF file provided, extract text with pdf-parse
    if (req.file) {
      try {
        const parsedPdf = await pdfParse(req.file.buffer);
        resumeText = parsedPdf.text || '';
      } catch (pdfErr) {
        console.warn('PDF parsing error:', pdfErr.message);
        return res.status(400).json({ error: 'Could not extract text from the uploaded PDF. Please copy and paste your resume text manually.' });
      }
    }

    if (!jobDescription || jobDescription.trim().length < 10) {
      return res.status(400).json({ error: 'Job description is required (at least 10 characters).' });
    }

    if (!resumeText || resumeText.trim().length < 10) {
      return res.status(400).json({ error: 'Resume content is required. Please upload a PDF or paste text.' });
    }

    // Call AI analysis service
    const analysis = await aiService.analyzeResume(resumeText, jobDescription);

    // Save session to Mongo DB if Mongoose is connected
    let savedAnalysis = null;
    try {
      if (ResumeAnalysis.db.readyState === 1) {
        const newRecord = new ResumeAnalysis({
          userId: req.user ? req.user.id : null,
          roleTitle,
          resumeTextSnippet: resumeText.slice(0, 300),
          jobDescription: jobDescription.slice(0, 500),
          matchScore: analysis.matchScore,
          matchedSkills: analysis.matchedSkills,
          missingSkills: analysis.missingSkills,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
          rawAnalysis: analysis,
        });
        savedAnalysis = await newRecord.save();
      }
    } catch (dbErr) {
      console.warn('Could not persist analysis to DB (continuing anyway):', dbErr.message);
    }

    res.json({
      id: savedAnalysis ? savedAnalysis._id : `analysis_${Date.now()}`,
      roleTitle,
      resumeTextLength: resumeText.length,
      ...analysis
    });

  } catch (err) {
    console.error('Error analyzing resume:', err);
    res.status(500).json({ error: err.message || 'An unexpected error occurred during resume analysis.' });
  }
});

module.exports = router;
