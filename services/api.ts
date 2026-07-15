import { UserProfile, AttendanceRecord, RecognitionResult } from '../types';
import { authService } from './auth';

const API_BASE_URL = '/api';

// Build headers with auth token
function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// Handle response, auto-refresh token on 401
async function handleResponse<T>(response: Response, retry?: () => Promise<Response>): Promise<T> {
  if (response.status === 401 && retry) {
    try {
      await authService.refresh();
      const retried = await retry();
      if (!retried.ok) throw new Error(`HTTP ${retried.status}`);
      return retried.json();
    } catch {
      authService.logout();
      window.location.reload();
      throw new Error('Session expired');
    }
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export const userAPI = {
  getAll: async (): Promise<UserProfile[]> => {
    const req = () => fetch(`${API_BASE_URL}/users/`, { headers: authHeaders() });
    const response = await req();
    const data = await handleResponse<any>(response, req);
    return Array.isArray(data) ? data : (data.results ?? []);
  },

  create: async (user: UserProfile): Promise<UserProfile> => {
    const req = () => fetch(`${API_BASE_URL}/users/`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(user),
    });
    const response = await req();
    return handleResponse<UserProfile>(response, req);
  },

  delete: async (id: string): Promise<void> => {
    const req = () => fetch(`${API_BASE_URL}/users/${id}/`, {
      method: 'DELETE', headers: authHeaders(),
    });
    const response = await req();
    if (response.status === 401) {
      await authService.refresh();
      const retried = await req();
      if (!retried.ok) throw new Error('Failed to delete user');
      return;
    }
    if (!response.ok) throw new Error('Failed to delete user');
  },
};

export const attendanceAPI = {
  getAll: async (): Promise<AttendanceRecord[]> => {
    const req = () => fetch(`${API_BASE_URL}/attendance/`, { headers: authHeaders() });
    const response = await req();
    const data = await handleResponse<any>(response, req);
    return Array.isArray(data) ? data : (data.results ?? []);
  },

  create: async (record: AttendanceRecord): Promise<AttendanceRecord> => {
    const req = () => fetch(`${API_BASE_URL}/attendance/`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(record),
    });
    const response = await req();
    return handleResponse<AttendanceRecord>(response, req);
  },

  recognize: async (targetImage: string, knownUsers: UserProfile[]): Promise<RecognitionResult> => {
    const req = () => fetch(`${API_BASE_URL}/attendance/recognize/`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ targetImage, knownUsers }),
    });
    const response = await req();
    return handleResponse<RecognitionResult>(response, req);
  },

  getStats: async (): Promise<{ total: number; today: number }> => {
    const req = () => fetch(`${API_BASE_URL}/attendance/stats/`, { headers: authHeaders() });
    const response = await req();
    return handleResponse<{ total: number; today: number }>(response, req);
  },
};
