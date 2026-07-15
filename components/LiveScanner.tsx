import React, { useState, useEffect, useRef } from 'react';
import { useCamera } from '../hooks/useCamera';
import { UserProfile, AttendanceRecord } from '../types';
import { attendanceAPI } from '../services/api';
import { ScanFace, Loader2, User, Clock, CheckCircle, Play, Pause, AlertCircle, RefreshCw, ChevronDown } from './Icons';

export const LiveScanner: React.FC<{ knownUsers: UserProfile[], onAttendanceMarked: (r: AttendanceRecord) => void }> = ({ knownUsers, onAttendanceMarked }) => {
  const savedDevice = localStorage.getItem('kereo_preferred_camera') || '';
  const { videoRef, startCamera, stopCamera, switchCamera, captureFrame, isActive, isInitializing, devices, error: camErr, reconnectCount, refreshDevices } = useCamera();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(savedDevice);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'info' | 'success' | 'error'>('info');
  const [autoMode, setAutoMode] = useState(false);
  const autoInterval = useRef<any>(null);

  // Start camera on mount and when device changes
  useEffect(() => {
    startCamera(selectedDeviceId);
    return () => {
      stopCamera();
      if (autoInterval.current) clearInterval(autoInterval.current);
    };
  }, [selectedDeviceId]);

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedDeviceId(id);
    switchCamera(id);
  };

  const showMsg = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const runScan = async () => {
    if (isProcessing || knownUsers.length === 0) return;
    const img = captureFrame();
    if (!img) { showMsg('Could not capture frame. Check camera.', 'error'); return; }

    setIsProcessing(true);
    showMsg('Analyzing biometrics...', 'info');

    try {
      const res = await attendanceAPI.recognize(img, knownUsers);
      if (res.match && res.userId) {
        showMsg(`✓ Access Granted: ${res.name}`, 'success');
        setRecent(prev => [
          { id: Date.now(), name: res.name, time: new Date().toLocaleTimeString(), conf: res.confidence },
          ...prev
        ].slice(0, 10));
        onAttendanceMarked({
          id: String(Date.now()),
          userId: res.userId,
          name: res.name || 'Unknown',
          timestamp: new Date().toISOString(),
          status: 'Present',
          confidence: res.confidence,
          snapshotBase64: img,
        });
      } else {
        showMsg(res.reasoning || 'No match found.', 'error');
      }
    } catch (err) {
      console.error('Recognition error:', err);
      showMsg('Recognition failed. Check connection.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-scan mode
  useEffect(() => {
    if (autoMode) {
      autoInterval.current = setInterval(runScan, 5000);
    } else {
      if (autoInterval.current) clearInterval(autoInterval.current);
    }
    return () => { if (autoInterval.current) clearInterval(autoInterval.current); };
  }, [autoMode, knownUsers, isActive]);

  const msgColors = {
    info:    'bg-blue-600',
    success: 'bg-emerald-600',
    error:   'bg-red-600',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Camera Feed */}
      <div className="lg:col-span-2 space-y-4">

        {/* Camera selector - shows ALL connected cameras including CCTV */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 flex-1">
            <ScanFace className="w-4 h-4 text-zinc-400 shrink-0" />
            <select
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl text-sm p-2 outline-none focus:border-blue-500 text-zinc-200"
            >
              <option value="">Default Camera</option>
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${d.deviceId.slice(0, 8)}...`}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { refreshDevices(); startCamera(selectedDeviceId); }}
            title="Refresh cameras / reconnect"
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-zinc-400" />
          </button>
          {/* Live indicator */}
          <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {isActive ? 'LIVE' : 'OFFLINE'}
          </div>
        </div>

        {/* Video feed */}
        <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Initializing overlay */}
          {isInitializing && !camErr && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
              <p className="text-zinc-400 text-sm font-medium">
                {reconnectCount > 0 ? `Reconnecting... (attempt ${reconnectCount})` : 'Initializing camera...'}
              </p>
            </div>
          )}

          {/* Error overlay */}
          {camErr && !isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/60 backdrop-blur-md p-8 text-center">
              <AlertCircle className="w-14 h-14 text-red-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Camera Error</h3>
              <p className="text-red-200/80 text-sm max-w-xs mb-6">{camErr}</p>
              <button
                onClick={() => startCamera(selectedDeviceId)}
                className="px-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Scan processing overlay */}
          {isProcessing && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-scan" />
              <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
            </div>
          )}

          {/* Status message */}
          {msg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
              <div className={`${msgColors[msgType]} text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl`}>
                {msg}
              </div>
            </div>
          )}

          {/* Camera info badge */}
          {isActive && (
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-zinc-400 text-[10px] font-mono px-3 py-1.5 rounded-lg border border-zinc-700">
              {videoRef.current?.videoWidth || 0} × {videoRef.current?.videoHeight || 0}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={runScan}
            disabled={!isActive || isProcessing || knownUsers.length === 0}
            className="flex items-center justify-center gap-3 bg-white text-black p-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition-all disabled:opacity-40 active:scale-[0.98]"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanFace className="w-5 h-5" />}
            Manual Scan
          </button>

          <button
            onClick={() => setAutoMode(m => !m)}
            disabled={!isActive || knownUsers.length === 0}
            className={`flex items-center justify-center gap-3 p-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-[0.98] disabled:opacity-40 ${autoMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'}`}
          >
            {autoMode ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {autoMode ? 'Stop Auto' : 'Auto Scan'}
          </button>
        </div>

        {/* No users warning */}
        {knownUsers.length === 0 && (
          <div className="p-5 bg-amber-900/20 border border-amber-500/30 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-amber-200/80 text-sm">No students registered yet. Go to "Register User" first.</p>
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500">Live Activity</h3>
          <div className={`flex items-center gap-2 text-[10px] font-bold px-3 py-1 rounded-full ${autoMode ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${autoMode ? 'bg-blue-500' : 'bg-emerald-500'}`} />
            {autoMode ? 'AUTO SCANNING' : 'STANDBY'}
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto">
          {recent.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <Clock className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-zinc-600 text-sm">No scans yet.<br />Start scanning to see activity.</p>
            </div>
          ) : (
            recent.map(item => (
              <div key={item.id} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-zinc-100 truncate">{item.name}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{item.time}</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-[10px] font-black">{Math.round(item.conf)}%</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex justify-between">
          <span>{devices.length} camera{devices.length !== 1 ? 's' : ''} detected</span>
          <span className="text-blue-500">Gemini AI</span>
        </div>
      </div>
    </div>
  );
};
