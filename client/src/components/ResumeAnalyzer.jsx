import React, { useState } from 'react';
import { Upload, FileText, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, XCircle } from 'lucide-react';
import ScoreDisplay from './ScoreDisplay';
import { analyzeResumeData } from '../services/api';

export default function ResumeAnalyzer({ onStartInterviewWithJD }) {
  const [roleTitle, setRoleTitle] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [inputMode, setInputMode] = useState('pdf'); // 'pdf' | 'text'

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please upload a valid PDF file.');
        return;
      }
      setError('');
      setResumeFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please upload a valid PDF file.');
        return;
      }
      setError('');
      setResumeFile(file);
    }
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    if (!jobDescription || jobDescription.trim().length < 10) {
      setError('Please provide a job description (at least 10 characters).');
      return;
    }
    if (inputMode === 'pdf' && !resumeFile && !resumeText) {
      setError('Please upload a PDF resume or switch to paste raw text.');
      return;
    }
    if (inputMode === 'text' && !resumeText.trim()) {
      setError('Please paste your resume text.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await analyzeResumeData({
        resumeFile: inputMode === 'pdf' ? resumeFile : null,
        resumeText: inputMode === 'text' ? resumeText : (resumeFile ? '' : resumeText),
        jobDescription,
        roleTitle
      });
      setAnalysisResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '32px' }}>
      {/* Hero Headline */}
      <div style={{ marginBottom: '32px', textAlign: 'left' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          <Sparkles size={14} />
          <span>PHASE 1 · RESUME GAP ANALYSIS</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px' }}>
          Signal vs. Noise Comparison
        </h1>
        <p style={{ color: 'var(--text-2)', maxWidth: '680px', fontSize: '16px' }}>
          Upload your resume PDF and paste the job description to run real-time AI gap analysis. Extract missing technical keywords, skill gaps, and 3 strategic resume improvements.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: analysisResult ? '1fr 1.2fr' : '1fr 1fr', gap: '32px' }}>
        
        {/* Left Side: Input Panel */}
        <div className="card-panel">
          <form onSubmit={handleRunAnalysis}>
            <div className="form-group">
              <label className="form-label">Target Role Title</label>
              <input
                type="text"
                className="form-control"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                required
              />
            </div>

            {/* Input Mode Selector */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Resume Input Mode</label>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--bg)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
                  <button
                    type="button"
                    className={`btn-secondary ${inputMode === 'pdf' ? 'active' : ''}`}
                    onClick={() => setInputMode('pdf')}
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                  >
                    Upload PDF
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary ${inputMode === 'text' ? 'active' : ''}`}
                    onClick={() => setInputMode('text')}
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              {inputMode === 'pdf' ? (
                <div
                  className={`pdf-dropzone ${resumeFile ? 'active' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('pdf-upload-input').click()}
                >
                  <input
                    id="pdf-upload-input"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <Upload size={32} color={resumeFile ? 'var(--gold)' : 'var(--text-2)'} />
                  <div>
                    {resumeFile ? (
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                        📄 {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
                      </div>
                    ) : (
                      <>
                        <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                          Click to select or drag PDF resume here
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '4px' }}>
                          Accepts PDF files up to 5MB
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <textarea
                  className="form-control"
                  rows={6}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste raw text from your resume here..."
                />
              )}
            </div>

            {/* Job Description Textarea */}
            <div className="form-group">
              <label className="form-label">Job Description / Requirements</label>
              <textarea
                className="form-control"
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                required
              />
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: 'var(--red-glow)', border: '1px solid var(--red)', borderRadius: 'var(--radius-md)', color: 'var(--red)', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                  Running Gap Analysis...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Run Gap Analysis
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Analysis Results Panel */}
        <div>
          {analysisResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Signature 120px Score Element */}
              <ScoreDisplay
                score={analysisResult.matchScore}
                label={`MATCH ACCURACY SIGNAL · ${roleTitle.toUpperCase()}`}
                subtext={`Computed against target JD requirements using AI skill gap vector model.`}
              />

              {/* Missing Skills vs Matched Skills */}
              <div className="card-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--red)', textTransform: 'uppercase', marginBottom: '12px' }}>
                    <AlertTriangle size={14} />
                    <span>Missing Critical Skills ({analysisResult.missingSkills?.length || 0})</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 ? (
                      analysisResult.missingSkills.map((skill, idx) => (
                        <span key={idx} className="skill-pill missing">
                          + {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>No major skill gaps detected!</span>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--green)', textTransform: 'uppercase', marginBottom: '12px' }}>
                    <CheckCircle2 size={14} />
                    <span>Matched Keywords ({analysisResult.matchedSkills?.length || 0})</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {analysisResult.matchedSkills && analysisResult.matchedSkills.length > 0 ? (
                      analysisResult.matchedSkills.map((skill, idx) => (
                        <span key={idx} className="skill-pill matched">
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>No keyword overlaps identified.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Strategic Improvements */}
              <div className="card-panel">
                <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} />
                  3 Strategic Improvements
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analysisResult.improvements?.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'var(--bg)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)', fontWeight: 700 }}>0{idx + 1}.</span>
                      <span style={{ fontSize: '14px', color: 'var(--text-1)' }}>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Shortcut to Phase 2 Interview */}
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => onStartInterviewWithJD(jobDescription, roleTitle)}
                    style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--indigo)', color: '#A5B4FC' }}
                  >
                    <span>Proceed to Phase 2: Mock Interview for this JD</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-panel" style={{ height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--border)' }}>
                <FileText size={28} color="var(--gold)" />
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Awaiting Target Job & Resume</h3>
              <p style={{ color: 'var(--text-2)', maxWidth: '360px', fontSize: '14px' }}>
                Upload your resume PDF on the left and click "Run Gap Analysis" to reveal your match score, skill breakdown, and tailored improvement action plan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
