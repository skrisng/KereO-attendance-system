import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { UserRegistry } from './components/UserRegistry';
import { UserList } from './components/UserList';
import { LiveScanner } from './components/LiveScanner';
import { AttendanceHistory } from './components/AttendanceHistory';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { StudentRegister } from './components/StudentRegister';
import { AppMode, UserProfile, AttendanceRecord } from './types';
import { userAPI, attendanceAPI } from './services/api';
import { authService } from './services/auth';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(authService.isLoggedIn());
  const [mode, setMode] = useState(AppMode.DASHBOARD);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRegisterPage = window.location.pathname === '/register';

  useEffect(() => {
    if (!loggedIn || isRegisterPage) { setLoading(false); return; }
    const fetchData = async () => {
      try {
        const [usersData, recordsData] = await Promise.all([
          userAPI.getAll(),
          attendanceAPI.getAll(),
        ]);
        setUsers(usersData);
        setRecords(recordsData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Could not connect to backend. Make sure Django is running on port 8000.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [loggedIn]);

  // Public student registration page - no login needed
  if (isRegisterPage) return <StudentRegister />;

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#09090b', color: '#f4f4f5', fontSize: '20px' }}>
        Loading KereO...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#09090b', color: '#f4f4f5', fontSize: '20px', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444', fontSize: '28px' }}>⚠️ Backend Connection Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
          Retry
        </button>
      </div>
    );
  }

  const handleRegister = async (u: UserProfile) => {
    try {
      const newUser = await userAPI.create(u);
      setUsers(prev => [...prev, newUser]);
      return true;
    } catch (err) {
      console.error('Registration failed:', err);
      return false;
    }
  };

  const handleAttendance = async (rec: AttendanceRecord) => {
    try {
      const newRecord = await attendanceAPI.create(rec);
      setRecords(prev => [newRecord, ...prev]);
    } catch (err) {
      console.error('Attendance marking failed:', err);
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm('Permanently remove this student biometric profile?')) {
      try {
        await userAPI.delete(id);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  return (
    <Layout currentMode={mode} setMode={setMode}>
      {mode === AppMode.DASHBOARD && <Dashboard users={users} records={records} onNavigate={setMode} />}
      {mode === AppMode.REGISTER && <UserRegistry onRegister={handleRegister} />}
      {mode === AppMode.SCANNER && <LiveScanner knownUsers={users} onAttendanceMarked={handleAttendance} />}
      {mode === AppMode.STUDENTS && <UserList users={users} onDeleteUser={deleteUser} />}
      {mode === AppMode.HISTORY && <AttendanceHistory records={records} />}
    </Layout>
  );
}
