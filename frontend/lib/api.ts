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

// Handle 401: don't redirect on login failure (stay on page to show "Invalid credentials")
// When redirecting, keep admin flow on /admin/login, never send to user /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status !== 401) return Promise.reject(error);

    const config = error.config;
    const requestUrl = (config?.baseURL ?? '') + (config?.url ?? '');
    const isLoginRequest = requestUrl.includes('auth/login');
    const isAdminRequest = requestUrl.includes('/admin');
    const onAdminPage =
      typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

    // 401 from login attempt: do nothing (no redirect, no clear) so the form shows "Invalid credentials"
    if (isLoginRequest) return Promise.reject(error);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Never send admin flow to user /login – always use /admin/login
    const goToAdminLogin = onAdminPage || isAdminRequest;
    window.location.href = goToAdminLogin ? '/admin/login' : '/login';
    return Promise.reject(error);
  }
);

export default api;
