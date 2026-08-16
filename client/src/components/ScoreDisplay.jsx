import React, { useEffect, useState } from 'react';

export default function ScoreDisplay({ score, label = "MATCH ACCURACY SIGNAL", subtext }) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    // Reset to 0 then animate to actual score percentage
    setAnimatedWidth(0);
    const timer = setTimeout(() => {
      setAnimatedWidth(Math.min(100, Math.max(0, score)));
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Color dynamic accent based on score bracket
  const getScoreColor = (val) => {
    if (val >= 80) return 'var(--gold)';
    if (val >= 60) return '#F59E0B';
    return 'var(--red)';
  };

  const accentColor = getScoreColor(score);

  return (
    <div className="signature-score-card">
      <div className="signature-score-wrapper">
        <div className="signature-score-number" style={{ color: accentColor }}>
          {score}
          <span style={{ fontSize: '36px', opacity: 0.5, fontWeight: 500, fontFamily: 'var(--font-mono)' }}>%</span>
        </div>
        
        {/* Animated thin amber/gold underline from left to match-% width */}
        <div className="signature-score-underline-container">
          <div
            className="signature-score-underline-fill"
            style={{
              width: `${animatedWidth}%`,
              background: accentColor,
              boxShadow: `0 0 12px ${accentColor}`
            }}
          />
        </div>

        <div className="signature-score-label">
          {label}
        </div>

        {subtext && (
          <p style={{ color: 'var(--text-2)', fontSize: '13px', marginTop: '8px', maxWidth: '400px' }}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
