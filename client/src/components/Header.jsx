import React from 'react';
import { Target, MessageSquareCode, LayoutDashboard, UserCheck, LogOut, ShieldAlert } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, user, onOpenAuth, onLogout }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="#home" onClick={() => setActiveTab('analyzer')} className="brand-logo">
          <span>SIGNAL</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--gold)' }}>GAP</span>
          <span className="brand-tag">v1.0 INTEL</span>
        </a>

        <nav className="nav-links">
          <button
            className={`nav-button ${activeTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            <Target size={16} color={activeTab === 'analyzer' ? 'var(--gold)' : 'currentColor'} />
            Resume Gap Analyzer
          </button>

          <button
            className={`nav-button ${activeTab === 'interview' ? 'active' : ''}`}
            onClick={() => setActiveTab('interview')}
          >
            <MessageSquareCode size={16} color={activeTab === 'interview' ? 'var(--indigo)' : 'currentColor'} />
            Mock Interview Coach
          </button>

          <button
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={16} color={activeTab === 'dashboard' ? 'var(--green)' : 'currentColor'} />
            Performance History
          </button>
        </nav>

        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="user-pill">
                <UserCheck size={14} color="var(--green)" />
                <span>{user.name}</span>
              </div>
              <button
                className="btn-secondary"
                onClick={onLogout}
                title="Sign out"
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="btn-secondary" onClick={onOpenAuth}>
              <ShieldAlert size={14} color="var(--gold)" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
