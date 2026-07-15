
import React, { useState, useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';
import { UserProfile } from '../types';
import { Camera, Save, User, Hash, GraduationCap, X, CheckCircle, AlertCircle, RefreshCw } from './Icons';

export const UserRegistry: React.FC<{ onRegister: (u: UserProfile) => boolean }> = ({ onRegister }) => {
  const { videoRef, startCamera, stopCamera, captureFrame, isActive, error: camErr, devices } = useCamera();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(localStorage.getItem('kereo_preferred_camera') || '');
  const [captured, setCaptured] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', id: '', dept: '' });
  const [toast, setToast] = useState<{ m: string, t: 's'|'e' } | null>(null);

  useEffect(() => { 
    startCamera(selectedDeviceId); 
    return () => stopCamera(); 
  }, [selectedDeviceId, startCamera, stopCamera]);

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedDeviceId(id);
    localStorage.setItem('kereo_preferred_camera', id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id.length < 5 || !/^[a-zA-Z0-9]+$/.test(form.id)) {
      setToast({ m: "ID must be 5+ alphanumeric characters.", t: 'e' });
      return;
    }
    if (!captured) { setToast({ m: "Photo required.", t: 'e' }); return; }
    
    const success = onRegister({ 
      id: form.id, 
      name: form.name, 
      department: form.dept, 
      photoBase64: captured, 
      registeredAt: new Date().toISOString() 
    });
    
    if (success) {
      setToast({ m: "Registered successfully!", t: 's' });
      setForm({ name: '', id: '', dept: '' }); setCaptured(null);
    } else {
      setToast({ m: "ID already exists.", t: 'e' });
    }
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className={`fixed top-6 right-6 p-4 rounded-xl border flex items-center space-x-3 z-50 animate-bounce ${toast.t === 's' ? 'bg-emerald-900 border-emerald-500' : 'bg-red-900 border-red-500'}`}>
          {toast.t === 's' ? <CheckCircle /> : <AlertCircle />}
          <span>{toast.m}</span>
          <button onClick={() => setToast(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {camErr && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-2xl text-red-400 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{camErr}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Profile Portrait</h2>
            {devices.length > 1 && (
              <div className="relative group">
                <select 
                  value={selectedDeviceId}
                  onChange={handleDeviceChange}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs p-2 pr-8 outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                >
                  {devices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,5)}`}</option>
                  ))}
                </select>
                <RefreshCw className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 pointer-events-none" />
              </div>
            )}
          </div>

          <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6 border border-zinc-800 shadow-inner relative group">
            {captured ? (
              <img src={captured} className="w-full h-full object-cover" />
            ) : (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
            )}
            {!isActive && !captured && !camErr && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            )}
          </div>
          
          <button 
            onClick={() => captured ? setCaptured(null) : setCaptured(captureFrame())} 
            disabled={!isActive && !captured}
            className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {captured ? 'Retake Photo' : 'Capture Frame'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 space-y-6">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <User className="text-blue-400 w-5 h-5" />
            <span>Biometric Metadata</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Full Name</label>
              <input 
                required 
                placeholder="John Doe"
                className="w-full bg-zinc-950 p-4 rounded-xl border border-zinc-800 mt-2 focus:border-blue-500/50 outline-none transition-all" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Student ID / Unique Hash</label>
              <input 
                required 
                placeholder="CS101XX"
                className="w-full bg-zinc-950 p-4 rounded-xl border border-zinc-800 mt-2 focus:border-blue-500/50 outline-none transition-all" 
                value={form.id} 
                onChange={e => setForm({...form, id: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Course / Department</label>
              <input 
                placeholder="Applied Sciences"
                className="w-full bg-zinc-950 p-4 rounded-xl border border-zinc-800 mt-2 focus:border-blue-500/50 outline-none transition-all" 
                value={form.dept} 
                onChange={e => setForm({...form, dept: e.target.value})} 
              />
            </div>
          </div>
          <button type="submit" className="w-full py-5 rounded-xl bg-blue-600 font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all active:scale-[0.98]">
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
};
