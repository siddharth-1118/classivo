import axios from 'axios';

const getBaseURL = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || '';
  if (!url) return '/api';
  return url.endsWith('/api') ? url : `${url}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

// Attach token and fix pathing for baseURL
api.interceptors.request.use((config) => {
  // Fix: Strip leading slash if baseURL is present to prevent path reset
  if (config.baseURL && config.url?.startsWith('/')) {
    config.url = config.url.substring(1);
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('classivo_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('classivo_token');
        localStorage.removeItem('classivo_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
