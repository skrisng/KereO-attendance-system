// Backup of original App.tsx
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { UserRegistry } from './components/UserRegistry';
import { UserList } from './components/UserList';
import { LiveScanner } from './components/LiveScanner';
import { AttendanceHistory } from './components/AttendanceHistory';
import { Dashboard } from './components/Dashboard';
import { AppMode, UserProfile, AttendanceRecord } from './types';
import { userAPI, attendanceAPI } from './services/api';

export default function App() {
  const [mode, setMode] = useState(AppMode.DASHBOARD);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Django backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, recordsData] = await Promise.all([
          userAPI.getAll(),
          attendanceAPI.getAll(),
        ]);
        setUsers(usersData);
        setRecords(recordsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRegister = async (u: UserProfile) => {
    try {
      const newUser = await userAPI.create(u);
      setUsers(prev => [...prev, newUser]);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const handleAttendance = async (rec: AttendanceRecord) => {
    try {
      const newRecord = await attendanceAPI.create(rec);
      setRecords(prev => [newRecord, ...prev]);
    } catch (error) {
      console.error('Attendance marking failed:', error);
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm("Permanently remove this student biometric profile?")) {
      try {
        await userAPI.delete(id);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <Layout currentMode={mode} setMode={setMode}>
      {mode === AppMode.DASHBOARD && (
        <Dashboard users={users} records={records} onNavigate={setMode} />
      )}
      {mode === AppMode.REGISTER && (
        <UserRegistry onRegister={handleRegister} />
      )}
      {mode === AppMode.SCANNER && (
        <LiveScanner knownUsers={users} onAttendanceMarked={handleAttendance} />
      )}
      {mode === AppMode.STUDENTS && (
        <UserList users={users} onDeleteUser={deleteUser} />
      )}
      {mode === AppMode.HISTORY && (
        <AttendanceHistory records={records} />
      )}
    </Layout>
  );
}
