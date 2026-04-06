import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextType, User, AuthSession } from '../types';
import {
  login as authLogin,
  signup as authSignup,
  logout as authLogout,
  getCurrentSession,
} from '../services/authService';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const existingSession = getCurrentSession();
      if (existingSession) {
        setSession(existingSession);
        setUser(existingSession.user);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const newSession = authLogin(email, password);
    setSession(newSession);
    setUser(newSession.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    const newSession = authSignup(name, email, password);
    setSession(newSession);
    setUser(newSession.user);
  }, []);

  const logout = useCallback((): void => {
    authLogout();
    setSession(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: user !== null && session !== null,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};