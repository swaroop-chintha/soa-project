import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor to inject JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aegis_jwt_token') || localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common error codes and 401s
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // If unauthorized, clear invalid token and redirect if not already on /login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('aegis_jwt_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a user-friendly error message from a backend Axios error.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === 'string' && data.length > 0) {
      return data;
    }
    if (data && typeof data === 'object') {
      const errObj = data as Record<string, any>;
      if (errObj.errors && typeof errObj.errors === 'object') {
        const errorList = Object.entries(errObj.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        if (errorList) return errorList;
      }
      if (errObj.message) return String(errObj.message);
      if (errObj.error) return String(errObj.error);
    }

    if (error.response?.status === 403) {
      return 'Access Denied: You do not have permission to perform this action (ROLE_ADMIN required).';
    }
    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.response?.status === 503) {
      return 'Service temporarily unavailable. Please retry shortly.';
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'An unexpected error occurred. Please try again.';
}
