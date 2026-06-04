import axios from 'axios';
import type { AuthUser } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5102/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Authorization token
api.interceptors.request.use(
  (config) => {
    const authDataStr = localStorage.getItem('auth_user');
    if (authDataStr) {
      try {
        const authData: AuthUser = JSON.parse(authDataStr);
        if (authData.accessToken) {
          config.headers.Authorization = `Bearer ${authData.accessToken}`;
        }
      } catch (e) {
        console.error('Error parsing auth user from localStorage', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Auto Refresh Token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for login requests
    if (originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const authDataStr = localStorage.getItem('auth_user');
      if (authDataStr) {
        try {
          const authData: AuthUser = JSON.parse(authDataStr);
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
          });

          if (response.data) {
            const newAuthData: AuthUser = {
              ...authData,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              expiration: response.data.expiration,
            };

            localStorage.setItem('auth_user', JSON.stringify(newAuthData));
            api.defaults.headers.common.Authorization = `Bearer ${newAuthData.accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAuthData.accessToken}`;

            processQueue(null, newAuthData.accessToken);
            isRefreshing = false;

            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
