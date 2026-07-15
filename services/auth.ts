const API = '/api/auth';

export const authService = {
  login: async (username: string, password: string) => {
    const res = await fetch(`${API}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    localStorage.setItem('kereo_token', data.access);
    localStorage.setItem('kereo_refresh', data.refresh);
    return data;
  },

  logout: () => {
    localStorage.removeItem('kereo_token');
    localStorage.removeItem('kereo_refresh');
  },

  getToken: () => localStorage.getItem('kereo_token'),

  isLoggedIn: () => !!localStorage.getItem('kereo_token'),

  refresh: async () => {
    const refresh = localStorage.getItem('kereo_refresh');
    if (!refresh) throw new Error('No refresh token');
    const res = await fetch(`${API}/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) { authService.logout(); throw new Error('Session expired'); }
    const data = await res.json();
    localStorage.setItem('kereo_token', data.access);
    return data.access;
  },
};
