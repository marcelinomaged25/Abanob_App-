import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser } from '@/types';
import * as authService from '@/services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (email: string, password: string) => Promise<AuthUser>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      // Check if token is expired
      try {
        const expirationDate = new Date(currentUser.expiration);
        if (expirationDate > new Date()) {
          setUser(currentUser);
        } else {
          authService.logout();
        }
      } catch {
        authService.logout();
      }
    }
    setIsLoading(false);
  }, []);

  const loginUser = async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data);
      setIsLoading(false);
      return data;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logoutUser = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
