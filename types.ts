
export interface UserProfile {
  id: string;
  name: string;
  department: string;
  photoBase64: string;
  registeredAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  name: string;
  department?: string;
  timestamp: string;
  status: 'Present' | 'Late' | 'Check-out';
  confidence: number;
  snapshotBase64?: string;
}

export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  REGISTER = 'REGISTER',
  SCANNER = 'SCANNER',
  HISTORY = 'HISTORY',
  STUDENTS = 'STUDENTS',
}

export interface RecognitionResult {
  match: boolean;
  isHuman?: boolean;
  userId?: string;
  name?: string;
  confidence: number;
  reasoning?: string;
}
