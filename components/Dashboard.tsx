
import React from 'react';
import { UserProfile, AttendanceRecord, AppMode } from '../types';
import { Users, UserCheck, Clock, AlertTriangle, ArrowRight } from './Icons';

interface DashboardProps {
  users: UserProfile[];
  records: AttendanceRecord[];
  onNavigate?: (mode: AppMode) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ users, records, onNavigate }) => {
  // Calculate simple stats
  const totalUsers = users.length;
  
  // Get unique users present today
  const today = new Date().toDateString();
  const presentToday = new Set(
    records
      .filter(r => new Date(r.timestamp).toDateString() === today)
      .map(r => r.userId)
  ).size;

  const lateCount = records.filter(r => 
    new Date(r.timestamp).toDateString() === today && r.status === 'Late'
  ).length;

  const cards = [
    { label: 'Total Students', value: totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Students Present', value: presentToday, icon: UserCheck, color: 'bg-green-500' },
    { label: 'Late Arrivals', value: lateCount, icon: Clock, color: 'bg-orange-500' },
    { label: 'System Alerts', value: 0, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-zinc-50">Dashboard Overview</h1>
          <p className="text-zinc-400 text-lg">Welcome to the KereO Attendance System.</p>
        </div>
        <div className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Analysis Engine: Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-lg hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color} bg-opacity-10`}>
                <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="text-3xl font-bold text-zinc-100">{card.value}</span>
            </div>
            <h3 className="text-zinc-400 font-medium text-sm">{card.label}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-zinc-200">Recent Registrations</h3>
              {onNavigate && (
                <button 
                  onClick={() => onNavigate(AppMode.STUDENTS)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1 group"
                >
                  <span>View All Directory</span>
                  <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
            <div className="space-y-4 flex-1">
                {users.slice(-5).reverse().map(user => (
                    <div key={user.id} className="flex items-center space-x-4 p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-800/50 hover:bg-zinc-800/60 transition-colors group">
                        <img src={user.photoBase64} alt={user.name} className="w-11 h-11 rounded-lg object-cover border border-zinc-700 shadow-sm group-hover:border-blue-500/30 transition-colors" />
                        <div>
                            <p className="font-bold text-zinc-100 leading-tight">{user.name}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{user.department}</p>
                        </div>
                        <span className="ml-auto text-[10px] text-zinc-600 font-mono bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                            {user.id}
                        </span>
                    </div>
                ))}
                {users.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
                    <Users className="w-10 h-10 mb-2" />
                    <p className="text-zinc-500 text-sm italic">No students registered yet.</p>
                  </div>
                )}
            </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-zinc-200">System Information</h3>
            <div className="space-y-4 text-sm text-zinc-300">
                <div className="flex justify-between py-2 border-b border-zinc-800">
                    <span className="text-zinc-400">Core Engine</span>
                    <span className="font-mono text-blue-400">Gemini 3 Flash Preview</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                    <span className="text-zinc-400">Vision Capability</span>
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      Face Embedding Matcher
                    </span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                    <span className="text-zinc-400">Database Context</span>
                    <span className="text-zinc-500 font-mono">{users.length} Embeddings</span>
                </div>
                <div className="p-4 bg-blue-900/10 rounded-xl mt-6 text-blue-300/70 text-xs leading-relaxed border border-blue-900/20">
                    <p className="font-bold mb-1 text-blue-400">Privacy Notice:</p>
                    All facial embeddings and profile data are stored strictly within your browser's Local Storage. 
                    Images are only transmitted to the Gemini API for temporary reasoning and comparison.
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
