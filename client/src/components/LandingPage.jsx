import React from 'react';
import { Target, MessageSquareCode, Sparkles, ShieldCheck, ArrowRight, Mic, CheckCircle2, FileText, Zap } from 'lucide-react';
import ScoreDisplay from './ScoreDisplay';

export default function LandingPage({ onOpenAuth }) {
  return (
    <div style={{ marginTop: '40px', paddingBottom: '60px' }}>
      {/* Hero Thesis Section */}
      <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 60px auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--gold-glow)', color: 'var(--gold)', border: '1px solid rgba(240, 180, 41, 0.3)', padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
          <Sparkles size={14} />
          <span>PRECISION CAREER INTELLIGENCE PLATFORM</span>
        </div>

        <h1 style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.03em' }}>
          Bridge the Gap Between Your Resume & Your Target Job
        </h1>

        <p style={{ color: 'var(--text-2)', fontSize: '18px', lineHeight: 1.6, marginBottom: '32px', maxWidth: '720px', margin: '0 auto 32px auto' }}>
          Upload your resume PDF to calculate a raw match score, extract missing technical keywords, and practice role-specific technical questions with an AI voice coach.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={onOpenAuth} style={{ width: 'auto', padding: '14px 32px', fontSize: '16px' }}>
            <span>Sign In for Free Access</span>
            <ArrowRight size={18} />
          </button>

          <button className="btn-secondary" onClick={onOpenAuth} style={{ padding: '14px 28px', fontSize: '15px' }}>
            <ShieldCheck size={18} color="var(--indigo)" />
            <span>Create Free Account</span>
          </button>
        </div>
      </div>

      {/* Signature Score Demo Feature */}
      <div style={{ maxWidth: '960px', margin: '0 auto 80px auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
        <ScoreDisplay
          score={88}
          label="SIGNATURE GAP MATCH SIGNAL"
          subtext="Raw typographic accuracy score calculated against target Job Description vector requirements."
        />

        <div className="card-panel">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px' }}>
            <Zap size={14} />
            <span>LIVE COMPARISON ENGINE</span>
          </div>

          <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>
            Signal vs. Noise Analysis
          </h2>

          <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '20px' }}>
            Stop guessing why applicant tracking systems reject your resume. Get direct breakdown of matched skills, missing critical keywords, and 3 strategic bulleted improvements.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span className="skill-pill matched">✓ REACT.JS</span>
            <span className="skill-pill matched">✓ NODE.JS</span>
            <span className="skill-pill missing">+ TYPESCRIPT</span>
            <span className="skill-pill missing">+ DOCKER & CI/CD</span>
          </div>
        </div>
      </div>

      {/* 4 Feature Pillars Grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 60px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800 }}>Complete Career Preparation Suite</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '8px' }}>
            Sign in to unlock all 4 phases of our career intelligence workflow.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          
          <div className="card-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--gold-glow)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={20} color="var(--gold)" />
              </div>
              <div>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--gold)' }}>PHASE 1</span>
                <h3 style={{ fontSize: '18px' }}>Resume Gap Analyzer</h3>
              </div>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
              Extract text from uploaded PDF resumes using pdf-parse, score job alignment out of 100, and highlight exact missing tech stack requirements.
            </p>
          </div>

          <div className="card-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--indigo-glow)', border: '1px solid var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquareCode size={20} color="var(--indigo)" />
              </div>
              <div>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--indigo)' }}>PHASE 2</span>
                <h3 style={{ fontSize: '18px' }}>Mock Interview Generator</h3>
              </div>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
              Generate 5 targeted technical and behavioral interview questions based on your specific target job description and experience level.
            </p>
          </div>

          <div className="card-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(248, 113, 113, 0.12)', border: '1px solid var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={20} color="var(--red)" />
              </div>
              <div>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--red)' }}>PHASE 3</span>
                <h3 style={{ fontSize: '18px' }}>AI Voice & Text Evaluator</h3>
              </div>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
              Dictate answers using browser Web Speech API. Get instant evaluations on Clarity, Relevance, and Technical Accuracy out of 10.
            </p>
          </div>

          <div className="card-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--green-glow)', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} color="var(--green)" />
              </div>
              <div>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--green)' }}>PHASE 4</span>
                <h3 style={{ fontSize: '18px' }}>Performance History & Audit</h3>
              </div>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
              Save session history securely so you can monitor your score improvements across multiple mock attempts and job applications.
            </p>
          </div>

        </div>
      </div>

      {/* Final Call to Action Banner */}
      <div className="card-panel" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '40px 32px', background: 'var(--surface-raised)', border: '1px solid var(--border-active)' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>Ready to Optimize Your Resume & Practice?</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '15px', marginBottom: '24px' }}>
          Sign in or create a free account now to get full access to all AI tools.
        </p>
        <button className="btn-primary" onClick={onOpenAuth} style={{ width: 'auto', margin: '0 auto', padding: '12px 32px' }}>
          <span>Sign In / Create Free Account</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
