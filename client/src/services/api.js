const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('signal_gap_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('signal_gap_token', token);
  else localStorage.removeItem('signal_gap_token');
};

export const getAuthUser = () => {
  const user = localStorage.getItem('signal_gap_user');
  return user ? JSON.parse(user) : null;
};

export const setAuthUser = (user) => {
  if (user) localStorage.setItem('signal_gap_user', JSON.stringify(user));
  else localStorage.removeItem('signal_gap_user');
};

// --- Local History Cache Helpers ---
const getLocalHistory = () => {
  try {
    const raw = localStorage.getItem('signal_gap_local_history');
    return raw ? JSON.parse(raw) : { resumeAnalyses: [], interviewSessions: [] };
  } catch (e) {
    return { resumeAnalyses: [], interviewSessions: [] };
  }
};

const saveLocalAnalysisItem = (item) => {
  const history = getLocalHistory();
  const newItem = {
    _id: item.id || `local_res_${Date.now()}`,
    roleTitle: item.roleTitle || 'Target Role',
    matchScore: item.matchScore,
    missingSkills: item.missingSkills || [],
    matchedSkills: item.matchedSkills || [],
    createdAt: new Date().toISOString()
  };
  history.resumeAnalyses = [newItem, ...(history.resumeAnalyses || [])].slice(0, 20);
  localStorage.setItem('signal_gap_local_history', JSON.stringify(history));
};

const saveLocalSessionItem = (item) => {
  const history = getLocalHistory();
  const newItem = {
    _id: item.sessionId || `local_session_${Date.now()}`,
    roleTitle: item.roleTitle || 'Candidate Role',
    level: item.level || 'mid',
    questions: item.questions || [],
    createdAt: new Date().toISOString()
  };
  history.interviewSessions = [newItem, ...(history.interviewSessions || [])].slice(0, 20);
  localStorage.setItem('signal_gap_local_history', JSON.stringify(history));
};

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setAuthToken(data.token);
  setAuthUser(data.user);
  return data;
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  setAuthToken(data.token);
  setAuthUser(data.user);
  return data;
}

export function logoutUser() {
  setAuthToken(null);
  setAuthUser(null);
}

export async function analyzeResumeData({ resumeFile, resumeText, jobDescription, roleTitle }) {
  const formData = new FormData();
  if (resumeFile) formData.append('resumeFile', resumeFile);
  if (resumeText) formData.append('resumeText', resumeText);
  formData.append('jobDescription', jobDescription);
  if (roleTitle) formData.append('roleTitle', roleTitle);

  const res = await fetch(`${API_BASE}/resume/analyze`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to analyze resume');
  
  // Cache to local history for seamless metrics refresh
  saveLocalAnalysisItem(data);
  return data;
}

export async function generateInterviewQuestions({ jobDescription, level, roleTitle }) {
  const res = await fetch(`${API_BASE}/interview/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ jobDescription, level, roleTitle }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate interview questions');
  
  // Cache to local history
  saveLocalSessionItem(data);
  return data;
}

export async function evaluateCandidateAnswer({ sessionId, questionId, question, answer, jobDescription }) {
  const res = await fetch(`${API_BASE}/interview/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ sessionId, questionId, question, answer, jobDescription }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to evaluate answer');
  return data;
}

export async function fetchUserHistory() {
  const localData = getLocalHistory();
  
  try {
    const res = await fetch(`${API_BASE}/interview/history?_t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        ...authHeaders(),
      },
      cache: 'no-store'
    });
    
    if (res.ok) {
      const serverData = await res.json();
      
      // Merge server items and local items (deduplicate by _id)
      const mergedAnalyses = [...(serverData.resumeAnalyses || [])];
      (localData.resumeAnalyses || []).forEach(localItem => {
        if (!mergedAnalyses.some(s => s._id === localItem._id)) {
          mergedAnalyses.push(localItem);
        }
      });

      const mergedSessions = [...(serverData.interviewSessions || [])];
      (localData.interviewSessions || []).forEach(localItem => {
        if (!mergedSessions.some(s => s._id === localItem._id)) {
          mergedSessions.push(localItem);
        }
      });

      return {
        resumeAnalyses: mergedAnalyses,
        interviewSessions: mergedSessions
      };
    }
  } catch (err) {
    console.warn('Backend history fetch failed, returning local cached history:', err.message);
  }

  return localData;
}
