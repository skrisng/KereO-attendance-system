
import React from 'react';
import { LayoutDashboard, UserPlus, ScanFace, History, Users, Fingerprint } from './Icons';
import { AppMode } from '../types';
import { authService } from '../services/auth';

interface LayoutProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentMode, setMode, children }) => {
  const navItems = [
    { mode: AppMode.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { mode: AppMode.SCANNER, label: 'Live Scanner', icon: ScanFace },
    { mode: AppMode.REGISTER, label: 'Register User', icon: UserPlus },
    { mode: AppMode.STUDENTS, label: 'Student Directory', icon: Users },
    { mode: AppMode.HISTORY, label: 'Attendance Log', icon: History },
  ];

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 overflow-hidden">
      <aside className="w-72 bg-white border-r border-gray-300 flex flex-col z-20">
        <div className="p-8 border-b border-gray-300 flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><Fingerprint className="text-white" /></div>
          <div><span className="font-bold text-xl block text-gray-900">KereO</span><span className="text-[10px] text-gray-500 uppercase font-bold">Smart Attendance</span></div>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          {navItems.map(item => (
            <button key={item.mode} onClick={() => setMode(item.mode)} className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${currentMode === item.mode ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}>
              <item.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-gray-300">
          <button
            onClick={() => { authService.logout(); window.location.reload(); }}
            className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <span className="text-lg">⏻</span>
            <span className="font-bold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 relative">
        <div className="max-w-6xl mx-auto p-10">{children}</div>
      </main>
    </div>
  );
};
