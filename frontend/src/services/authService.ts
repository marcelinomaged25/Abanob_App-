import api from './api';
import type { AuthUser } from '@/types';

export const login = async (email: string, password: string): Promise<AuthUser> => {
  const response = await api.post<AuthUser>('/auth/login', { email, password });
  localStorage.setItem('auth_user', JSON.stringify(response.data));
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('auth_user');
};

export const getCurrentUser = (): AuthUser | null => {
  const authDataStr = localStorage.getItem('auth_user');
  if (!authDataStr) return null;
  try {
    return JSON.parse(authDataStr) as AuthUser;
  } catch {
    return null;
  }
};
