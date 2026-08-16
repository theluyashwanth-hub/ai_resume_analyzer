import React, { useState } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import MockInterview from './components/MockInterview';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import { getAuthUser, logoutUser } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => getAuthUser());
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'interview' | 'dashboard'
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Context passed when transferring from Phase 1 -> Phase 2
  const [interviewContext, setInterviewContext] = useState({
    jobDescription: '',
    roleTitle: ''
  });

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const handleSelectTab = (tab) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleStartInterviewWithJD = (jdText, title) => {
    setInterviewContext({
      jobDescription: jdText,
      roleTitle: title || 'Software Engineer'
    });
    setActiveTab('interview');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        activeTab={user ? activeTab : 'home'}
        setActiveTab={handleSelectTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <main className="app-container" style={{ flex: 1 }}>
        {!user ? (
          /* Default Landing Page describing website & prompting sign in */
          <LandingPage onOpenAuth={() => setIsAuthOpen(true)} />
        ) : (
          /* Protected AI Tools — Accessible only after login / sign up */
          <>
            {activeTab === 'analyzer' && (
              <ResumeAnalyzer onStartInterviewWithJD={handleStartInterviewWithJD} />
            )}

            {activeTab === 'interview' && (
              <MockInterview
                initialJobDescription={interviewContext.jobDescription}
                initialRoleTitle={interviewContext.roleTitle}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard />
            )}
          </>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center', color: 'var(--text-2)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
        SIGNAL / GAP — Career Intelligence & Voice Interview Engine · Built with React, Express & AI API
      </footer>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(authUser) => {
          setUser(authUser);
          setActiveTab('analyzer');
        }}
      />
    </div>
  );
}
