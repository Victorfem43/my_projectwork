import axios from 'axios';

// Production (Vercel): set NEXT_PUBLIC_API_URL to full URL, e.g. https://myprojectwork-production.up.railway.app/api
// Must start with https:// or http:// so the browser does not treat it as a relative path.
const raw = (process.env.NEXT_PUBLIC_API_URL || '').trim();
const API_URL = (() => {
  if (!raw) return (typeof window !== 'undefined' ? '' : 'http://localhost:3000') + '/api';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw.replace(/\/$/, '');
  // If they forgot the protocol, prepend https:// so it's not treated as a relative path
  return 'https://' + raw.replace(/\/$/, '');
})();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration (don't redirect if this 401 was from a login attempt)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
