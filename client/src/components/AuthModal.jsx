import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await loginUser(email, password);
      } else {
        if (!name.trim()) throw new Error('Name is required');
        res = await registerUser(name, email, password);
      }
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gold-glow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gold)', marginBottom: '12px' }}>
            <ShieldCheck size={24} color="var(--gold)" />
          </div>
          <h2 style={{ fontSize: '22px' }}>
            {isLogin ? 'Sign In to SIGNAL / GAP' : 'Create Intelligence Account'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '4px' }}>
            {isLogin ? 'Access saved resume analyses & session history' : 'Save all mock interview performance metrics securely'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
                <User size={16} color="var(--text-2)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@company.com"
                required
              />
              <Mail size={16} color="var(--text-2)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <Lock size={16} color="var(--text-2)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--red)', fontSize: '13px', background: 'var(--red-glow)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: '16px' }}>
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-2)' }}>
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
            >
              {isLogin ? 'Register now' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
