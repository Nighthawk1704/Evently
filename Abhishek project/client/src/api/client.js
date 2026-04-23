import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'evently_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: t => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

api.interceptors.request.use(config => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Register handlers so context/ProtectedRoute can react to global auth failures
let onUnauthorized = null;
export const setUnauthorizedHandler = fn => { onUnauthorized = fn; };

api.interceptors.response.use(
  r => r,
  err => {
    const status = err.response?.status;
    if (status === 401 && onUnauthorized) onUnauthorized();
    return Promise.reject(err);
  }
);

/** Extract the server's error message into a plain string for toasts. */
export function errorMessage(err) {
  const data = err?.response?.data;
  if (!data) return err?.message || 'Network error';
  if (typeof data === 'string') return data;
  if (data.error) {
    if (data.fields && typeof data.fields === 'object') {
      const first = Object.entries(data.fields)[0];
      if (first) return `${data.error}: ${first[1]}`;
    }
    return data.error;
  }
  return 'Something went wrong';
}
