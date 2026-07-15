import React, { useState, useEffect, useRef } from 'react';
import { useCamera } from '../hooks/useCamera';
import { Fingerprint } from './Icons';

// Public self-registration page - no auth required
export const StudentRegister: React.FC = () => {
  const { videoRef, startCamera, stopCamera, captureFrame, isActive, error: camErr } = useCamera();
  const [captured, setCaptured] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', id: '', department: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    startCamera('');
    return () => stopCamera();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captured) { setMessage('Please capture your photo first.'); setStatus('error'); return; }
    if (form.id.length < 3) { setMessage('ID must be at least 3 characters.'); setStatus('error'); return; }

    setStatus('loading');
    try {
      const res = await fetch('/api/users/public_register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          department: form.department,
          photoBase64: captured,
          registeredAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setStatus('success');
      setMessage(`Welcome, ${form.name}! You have been registered successfully.`);
      setForm({ name: '', id: '', department: '' });
      setCaptured(null);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: '#18181b', borderRadius: '16px', padding: '48px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: '#22c55e', fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>Registered!</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>{message}</p>
          <button
            onClick={() => setStatus('idle')}
            style={{ padding: '12px 32px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
          >
            Register Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', padding: '24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '24px' }}>
          <div style={{ width: '52px', height: '52px', background: '#2563eb', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Fingerprint style={{ color: 'white', width: '26px', height: '26px' }} />
          </div>
          <h1 style={{ color: '#f4f4f5', fontSize: '28px', fontWeight: 700, margin: '0 0 6px' }}>KereO Student Registration</h1>
          <p style={{ color: '#71717a', fontSize: '15px', margin: 0 }}>Register your face for automatic attendance tracking</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Camera */}
          <div style={{ background: '#18181b', borderRadius: '16px', padding: '24px', border: '1px solid #27272a' }}>
            <h3 style={{ color: '#f4f4f5', fontWeight: 700, margin: '0 0 16px', fontSize: '16px' }}>📷 Take Your Photo</h3>
            <div style={{ aspectRatio: '4/3', background: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', border: '1px solid #27272a' }}>
              {captured ? (
                <img src={captured} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              )}
            </div>
            {camErr && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{camErr}</p>}
            <button
              onClick={() => captured ? setCaptured(null) : setCaptured(captureFrame())}
              disabled={!isActive && !captured}
              style={{ width: '100%', padding: '12px', background: captured ? '#27272a' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              {captured ? '🔄 Retake Photo' : '📸 Capture Photo'}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ background: '#18181b', borderRadius: '16px', padding: '24px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ color: '#f4f4f5', fontWeight: 700, margin: '0 0 4px', fontSize: '16px' }}>📝 Your Details</h3>

            {['name', 'id', 'department'].map((field) => (
              <div key={field}>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  {field === 'id' ? 'Student ID' : field === 'name' ? 'Full Name' : 'Course / Department'}
                  {field !== 'department' && ' *'}
                </label>
                <input
                  required={field !== 'department'}
                  placeholder={field === 'name' ? 'e.g. John Doe' : field === 'id' ? 'e.g. STU001' : 'e.g. Computer Science'}
                  value={form[field as keyof typeof form]}
                  onChange={e => setForm({ ...form, [field]: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', color: '#f4f4f5', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            {status === 'error' && (
              <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>⚠️ {message}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{ marginTop: 'auto', padding: '13px', background: status === 'loading' ? '#1d4ed8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
            >
              {status === 'loading' ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
