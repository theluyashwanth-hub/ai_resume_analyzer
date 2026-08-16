import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Target, MessageSquareCode, Clock } from 'lucide-react';
import { fetchUserHistory } from '../services/api';

export default function Dashboard({ onSelectAnalysis }) {
  const [history, setHistory] = useState({ resumeAnalyses: [], interviewSessions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchUserHistory();
        if (isMounted) setHistory(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Could not fetch practice history.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalAnalyses = history.resumeAnalyses?.length || 0;
  const totalSessions = history.interviewSessions?.length || 0;
  const avgScore = totalAnalyses > 0
    ? Math.round(history.resumeAnalyses.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) / totalAnalyses)
    : 0;

  return (
    <div style={{ marginTop: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          <LayoutDashboard size={14} />
          <span>PHASE 4 · SESSION HISTORY & AUDIT</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800 }}>
          Performance & Signal Metrics
        </h1>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="card-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-2)' }}>AVG MATCH SCORE</span>
            <Target size={18} color="var(--gold)" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 800, color: 'var(--gold)' }}>
            {avgScore ? `${avgScore}%` : '—'}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>Across all uploaded resume analyses</span>
        </div>

        <div className="card-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-2)' }}>RESUME GAP RUNS</span>
            <Target size={18} color="var(--indigo)" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 800, color: 'var(--text-1)' }}>
            {totalAnalyses}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>Total resumes evaluated against JDs</span>
        </div>

        <div className="card-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-2)' }}>MOCK INTERVIEWS</span>
            <MessageSquareCode size={18} color="var(--green)" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 800, color: 'var(--green)' }}>
            {totalSessions}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>Role practice sessions completed</span>
        </div>
      </div>

      {/* Resume Gap Analysis Log Table */}
      <div className="card-panel" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} color="var(--gold)" />
          Recent Resume Gap Analyses
        </h2>

        {history.resumeAnalyses && history.resumeAnalyses.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Target Role</th>
                  <th style={{ padding: '12px 16px' }}>Score</th>
                  <th style={{ padding: '12px 16px' }}>Missing Skills</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.resumeAnalyses.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{item.roleTitle || 'Target Role'}</td>
                    <td style={{ padding: '16px', fontFamily: 'var(--font-display)', fontWeight: 800, color: item.matchScore >= 75 ? 'var(--gold)' : 'var(--red)' }}>
                      {item.matchScore}%
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {item.missingSkills?.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="skill-pill missing" style={{ fontSize: '11px' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-2)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-2)', fontSize: '14px' }}>
            No saved analyses yet. Perform a Resume Gap Analysis to track your progress over time.
          </div>
        )}
      </div>

      {/* Mock Interview Log */}
      <div className="card-panel">
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquareCode size={18} color="var(--indigo)" />
          Recent Mock Interview Sessions
        </h2>

        {history.interviewSessions && history.interviewSessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.interviewSessions.map((session) => (
              <div key={session._id} style={{ background: 'var(--bg)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{session.roleTitle}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    Level: {session.level?.toUpperCase()} · {session.questions?.length || 0} Questions
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-2)', fontSize: '14px' }}>
            No interview sessions generated yet. Practice answering AI questions to build your score!
          </div>
        )}
      </div>
    </div>
  );
}
