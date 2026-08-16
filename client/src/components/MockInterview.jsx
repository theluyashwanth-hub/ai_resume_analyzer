import React, { useState, useEffect } from 'react';
import { MessageSquareCode, Mic, MicOff, Send, Sparkles, CheckCircle2, ChevronRight, RefreshCw, Volume2, ShieldCheck, HelpCircle } from 'lucide-react';
import { generateInterviewQuestions, evaluateCandidateAnswer } from '../services/api';

export default function MockInterview({ initialJobDescription = '', initialRoleTitle = '' }) {
  const [jobDescription, setJobDescription] = useState(initialJobDescription || '');
  const [roleTitle, setRoleTitle] = useState(initialRoleTitle || '');
  const [level, setLevel] = useState('mid');

  const [session, setSession] = useState(null); // { sessionId, questions: [] }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  const [loadingGen, setLoadingGen] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);
  const [evaluations, setEvaluations] = useState({}); // { [qId]: evalResult }
  const [error, setError] = useState('');

  // Initialize Web Speech API for voice answer input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      rec.onerror = (err) => {
        console.warn('Speech recognition error:', err.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please type your answer below.');
      return;
    }
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Could not start mic:', err);
      }
    }
  };

  const handleGenerateSession = async (e) => {
    if (e) e.preventDefault();
    if (!jobDescription || jobDescription.trim().length < 10) {
      setError('Please provide a job description to generate relevant questions.');
      return;
    }

    setLoadingGen(true);
    setError('');

    try {
      const data = await generateInterviewQuestions({ jobDescription, level, roleTitle });
      setSession(data);
      setCurrentIdx(0);
      setEvaluations({});
      setUserAnswer('');
    } catch (err) {
      setError(err.message || 'Failed to generate interview questions.');
    } finally {
      setLoadingGen(false);
    }
  };

  const handleEvaluateCurrentAnswer = async () => {
    if (!userAnswer || userAnswer.trim().length < 5) {
      setError('Please type or record a substantive answer before submitting.');
      return;
    }

    const currentQ = session.questions[currentIdx];
    setLoadingEval(true);
    setError('');

    try {
      const res = await evaluateCandidateAnswer({
        sessionId: session.sessionId,
        questionId: currentQ.id,
        question: currentQ.question,
        answer: userAnswer,
        jobDescription,
      });

      setEvaluations((prev) => ({
        ...prev,
        [currentQ.id]: res.evaluation,
      }));
    } catch (err) {
      setError(err.message || 'Failed to evaluate answer.');
    } finally {
      setLoadingEval(false);
    }
  };

  const currentQ = session?.questions?.[currentIdx];
  const currentEval = currentQ ? evaluations[currentQ.id] : null;

  return (
    <div style={{ marginTop: '32px' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--indigo)', fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          <MessageSquareCode size={14} />
          <span>PHASE 2 & 3 · MOCK INTERVIEW SIMULATOR</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px' }}>
          AI Evaluation & Voice Coach
        </h1>
        <p style={{ color: 'var(--text-2)', maxWidth: '680px', fontSize: '16px' }}>
          Generate 5 target interview questions matched to your job description. Record your answer via microphone or keyboard to receive immediate clarity, relevance, and technical scoring out of 10.
        </p>
      </div>

      {!session ? (
        /* Question Generation Setup Panel */
        <div className="card-panel" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles color="var(--indigo)" size={20} />
            Configure Mock Interview Parameters
          </h2>

          <form onSubmit={handleGenerateSession}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-group">
              <div>
                <label className="form-label">Role Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Frontend React Developer"
                  required
                />
              </div>

              <div>
                <label className="form-label">Experience Level</label>
                <select
                  className="form-control"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="junior">Junior (0-2 years)</option>
                  <option value="mid">Mid Level (2-5 years)</option>
                  <option value="senior">Senior Level (5+ years)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Description Context</label>
              <textarea
                className="form-control"
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                required
              />
            </div>

            {error && (
              <div style={{ color: 'var(--red)', background: 'var(--red-glow)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loadingGen} style={{ background: 'var(--indigo)', color: '#fff' }}>
              {loadingGen ? (
                <>
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Generating 5 Targeted Questions...
                </>
              ) : (
                <>
                  <MessageSquareCode size={18} />
                  Generate 5 Interview Questions
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Active Interview Simulator Room */
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
          
          {/* Question Navigator Sidebar */}
          <div className="card-panel" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-2)' }}>QUESTIONS (5)</span>
              <button
                onClick={() => setSession(null)}
                style={{ background: 'none', border: 'none', color: 'var(--indigo)', cursor: 'pointer', fontSize: '12px' }}
              >
                New Session
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {session.questions.map((q, idx) => {
                const isEval = Boolean(evaluations[q.id]);
                const isActive = idx === currentIdx;

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => {
                      setCurrentIdx(idx);
                      setUserAnswer('');
                      setError('');
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: isActive ? 'var(--surface-raised)' : 'var(--bg)',
                      border: isActive ? '1px solid var(--indigo)' : '1px solid var(--border)',
                      color: isActive ? 'var(--text-1)' : 'var(--text-2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: q.type === 'technical' ? 'var(--gold)' : 'var(--indigo)' }}>
                        Q0{idx + 1} · {q.type.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        {q.question}
                      </div>
                    </div>

                    {isEval ? (
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
                        {evaluations[q.id].score}/10
                      </span>
                    ) : (
                      <ChevronRight size={14} color="var(--text-muted)" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Answer & Evaluation Stage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Question Card */}
            <div className="card-panel">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="font-mono" style={{ fontSize: '12px', background: currentQ?.type === 'technical' ? 'var(--gold-glow)' : 'var(--indigo-glow)', color: currentQ?.type === 'technical' ? 'var(--gold)' : 'var(--indigo)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                  QUESTION {currentIdx + 1} OF 5 · {currentQ?.type?.toUpperCase()}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{roleTitle}</span>
              </div>

              <h2 style={{ fontSize: '22px', lineHeight: '1.4', marginBottom: '12px' }}>
                {currentQ?.question}
              </h2>

              {currentQ?.context && (
                <p style={{ fontSize: '13px', color: 'var(--text-2)', background: 'var(--bg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={14} color="var(--indigo)" />
                  <span>{currentQ.context}</span>
                </p>
              )}
            </div>

            {/* Answer Input Area with Voice Speech Integration */}
            <div className="card-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Your Candidate Response</label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: isRecording ? 'var(--red)' : 'var(--text-2)' }}>
                    {isRecording ? '🔴 Listening via Mic...' : 'Click mic to speak answer'}
                  </span>

                  <button
                    type="button"
                    className={`mic-btn ${isRecording ? 'recording' : ''}`}
                    onClick={toggleRecording}
                    title={isRecording ? 'Stop recording' : 'Start voice recording'}
                  >
                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                </div>
              </div>

              <textarea
                className="form-control"
                rows={5}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type or click the microphone button to dictate your answer..."
              />

              {error && (
                <div style={{ color: 'var(--red)', fontSize: '13px', marginTop: '10px' }}>
                  {error}
                </div>
              )}

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  className="btn-primary"
                  onClick={handleEvaluateCurrentAnswer}
                  disabled={loadingEval || !userAnswer.trim()}
                  style={{ width: 'auto', background: 'var(--indigo)', color: '#fff' }}
                >
                  {loadingEval ? (
                    <>
                      <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Evaluating Answer Clarity & Accuracy...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit & Evaluate Answer
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Answer Evaluation Feedback Card */}
            {currentEval && (
              <div className="card-panel" style={{ border: '1px solid var(--indigo)', background: 'rgba(23, 24, 38, 0.95)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--green)' }}>
                    <ShieldCheck size={20} />
                    <h3 style={{ fontSize: '18px', color: 'var(--text-1)' }}>AI Evaluation Feedback</h3>
                  </div>

                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: 'var(--gold)' }}>
                    {currentEval.score}<span style={{ fontSize: '18px', color: 'var(--text-2)' }}>/10</span>
                  </div>
                </div>

                {/* Sub-scores radar pills */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: 'var(--bg)', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    Clarity: <strong style={{ color: 'var(--text-1)' }}>{currentEval.clarity}/10</strong>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    Relevance: <strong style={{ color: 'var(--text-1)' }}>{currentEval.relevance}/10</strong>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    Technical Accuracy: <strong style={{ color: 'var(--text-1)' }}>{currentEval.technicalAccuracy}/10</strong>
                  </div>
                </div>

                {/* 2-line specific feedback */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {currentEval.feedback?.map((line, idx) => (
                    <div key={idx} style={{ fontSize: '14px', color: 'var(--text-1)', background: 'var(--bg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--indigo)' }}>
                      {line}
                    </div>
                  ))}
                </div>

                {currentEval.keyTakeaway && (
                  <div style={{ fontSize: '13px', color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
                    💡 Key Takeaway: {currentEval.keyTakeaway}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
