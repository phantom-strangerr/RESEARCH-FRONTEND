import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
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

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/api/v1/auth/login', { username, password }),

  getMe: () =>
    api.get('/api/v1/auth/me'),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getRecentPackets: (limit: number = 5) =>
    api.get('/api/v1/dashboard/recent-packets', { params: { limit } }),

  getRecentEvents: (limit: number = 5) =>
    api.get('/api/v1/dashboard/recent-events', { params: { limit } }),

  getAlerts: (limit = 50, offset = 0) =>
    api.get('/api/v1/dashboard/alerts', { params: { limit, offset } }),

  getAlertStats: () =>
    api.get('/api/v1/dashboard/alerts/stats'),

  getStats: () =>
    api.get('/api/v1/dashboard/stats'),

  getTrafficTimeline: (minutes: number = 10) =>
    api.get('/api/v1/dashboard/traffic-timeline', { params: { minutes } }),

  getLinkHealth: (minutes: number = 10) =>
    api.get('/api/v1/dashboard/link-health', { params: { minutes } }),

  getAttackDistribution: () =>
    api.get('/api/v1/dashboard/attack-distribution'),

  getExtractorHealth: (minutes: number = 10) =>
    api.get('/api/v1/dashboard/extractor-health', { params: { minutes } }),

  getModelHealth: () =>
    api.get('/api/v1/dashboard/model-health'),
};

// ─── Live Packets (traffic features) ──────────────────────────────────────────
export const packetsAPI = {
  getAllPackets: (limit: number = 100, offset: number = 0, classification?: string) =>
    api.get('/api/v1/traffic-features', { params: { limit, offset, ...(classification ? { classification } : {}) } }),
};

// ─── Device Health ────────────────────────────────────────────────────────────
export const deviceHealthAPI = {
  getLatest: () =>
    api.get('/api/v1/device-health-logs/latest'),
};

// ─── Ports ────────────────────────────────────────────────────────────────────
export const portsAPI = {
  getAllPorts: () =>
    api.get('/api/v1/ports'),

  getPort: (portId: string) =>
    api.get(`/api/v1/ports/${portId}`),

  isolatePort: (portId: string, data: { reason: string; isolated_by?: string }) =>
    api.post(`/api/v1/ports/${portId}/isolate`, data),

  liftIsolation: (portId: string) =>
    api.post(`/api/v1/ports/${portId}/lift-isolation`),

  seedPorts: () =>
    api.post('/api/v1/ports/seed/sample'),
};

// ─── System Logs ──────────────────────────────────────────────────────────────
export const systemLogsAPI = {
  getLogs: (limit: number = 100, offset: number = 0, source?: string) =>
    api.get('/api/v1/system-logs', { params: { limit, offset, ...(source ? { source } : {}) } }),
};

export default api;
