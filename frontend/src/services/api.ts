import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (username: string, password: string) => api.post('/auth/login', { username, password }),
  getMe: () => api.get('/auth/me'),
};

// Dashboard APIs
export const dashboardAPI = {
  getRecentPackets: (limit: number = 5) => api.get(`/dashboard/recent-packets?limit=${limit}`),
  getRecentEvents: (limit: number = 5) => api.get(`/dashboard/recent-events?limit=${limit}`),
  getAlerts: () => api.get('/dashboard/alerts'),
};

// Live Packets APIs
export const packetsAPI = {
  getAllPackets: () => api.get('/traffic-features'),
};

// Ports APIs
export const portsAPI = {
  getAllPorts: () => api.get('/ports'),
  getPort: (portId: string) => api.get(`/ports/${portId}`),
  isolatePort: (portId: string, data: { reason: string; isolated_by?: string }) =>
    api.post(`/ports/${portId}/isolate`, data),
  liftIsolation: (portId: string) =>
    api.post(`/ports/${portId}/lift-isolation`),
  seedPorts: () => api.post('/ports/seed/sample'),
};

export default api;