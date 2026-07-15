
import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { Users, Search, Trash2, X, Filter, ChevronDown } from './Icons';

export const UserList: React.FC<{ users: UserProfile[], onDeleteUser?: (id: string) => void }> = ({ users, onDeleteUser }) => {
  const [query, setQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  
  // Extract unique departments for the filter dropdown
  const departments = useMemo(() => {
    const depts = new Set(users.map(u => u.department || 'General Admission'));
    return ['All', ...Array.from(depts).sort()];
  }, [users]);

  const filtered = users.filter(u => {
    const dept = u.department || 'General Admission';
    const matchesQuery = u.name.toLowerCase().includes(query.toLowerCase()) || 
                         u.id.toLowerCase().includes(query.toLowerCase());
    const matchesDept = selectedDept === 'All' || dept === selectedDept;
    
    return matchesQuery && matchesDept;
  });

  return (
    <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black flex items-center space-x-3 tracking-tight">
            <div className="p-2.5 bg-purple-500/10 rounded-xl">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <span>Student Directory</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-2 font-medium">Manage and search registered biometric profiles.</p>
        </div>
        
        <div className="flex flex-col space-y-3 w-full md:w-80">
          {/* Department Filter Dropdown */}
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-zinc-950 p-3 pl-12 pr-10 rounded-2xl border border-zinc-800 text-sm focus:border-purple-500/50 outline-none transition-all appearance-none cursor-pointer text-zinc-300 font-medium"
            >
              {departments.map(dept => (
                <option key={dept} value={dept} className="bg-zinc-900">
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
            <input 
              placeholder="Search by name or ID..." 
              className="w-full bg-zinc-950 p-3 pl-12 pr-12 rounded-2xl border border-zinc-800 text-sm focus:border-blue-500/50 outline-none transition-all focus:ring-4 focus:ring-blue-500/5 text-zinc-300" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-md transition-colors">
                <X className="w-3 h-3 text-zinc-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em] bg-zinc-950/50">
            <tr>
              <th className="px-8 py-6">Identity Profile</th>
              <th className="px-8 py-6">Student ID</th>
              <th className="px-8 py-6">Department</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-zinc-700 italic font-medium">
                  <div className="flex flex-col items-center opacity-20">
                    <Search className="w-12 h-12 mb-4" />
                    <p>No students found matching your filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-5">
                      <div className="relative">
                        <img src={u.photoBase64} className="w-12 h-12 rounded-2xl object-cover border-2 border-zinc-800 group-hover:border-blue-500/30 transition-all shadow-lg" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
                      </div>
                      <div>
                        <span className="block font-black text-zinc-100 text-base">{u.name}</span>
                        <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Verified Resident</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-mono text-xs text-blue-400 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10">
                      {u.id}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-zinc-400">{u.department || 'General Admission'}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {onDeleteUser && (
                      <button 
                        onClick={() => onDeleteUser(u.id)} 
                        className="text-zinc-600 hover:text-red-400 p-3 hover:bg-red-400/10 rounded-xl transition-all active:scale-90"
                      >
                        <Trash2 className="w-5 h-5"/>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
