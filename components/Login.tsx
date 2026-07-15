import React, { useState } from 'react';
import { Fingerprint } from './Icons';
import { authService } from '../services/auth';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(username, password);
      onLogin();
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: '#09090b',
    }}>
      <div style={{
        background: '#18181b', borderRadius: '16px', padding: '48px',
        width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', background: '#2563eb', borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <Fingerprint style={{ color: 'white', width: '28px', height: '28px' }} />
          </div>
          <h1 style={{ color: '#f4f4f5', fontSize: '24px', fontWeight: 700, margin: 0 }}>KereO</h1>
          <p style={{ color: '#71717a', fontSize: '14px', marginTop: '4px' }}>Smart Attendance System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '13px', marginBottom: '6px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%', padding: '10px 14px', background: '#27272a',
                border: '1px solid #3f3f46', borderRadius: '8px', color: '#f4f4f5',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '13px', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 14px', background: '#27272a',
                border: '1px solid #3f3f46', borderRadius: '8px', color: '#f4f4f5',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: loading ? '#1d4ed8' : '#2563eb',
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
