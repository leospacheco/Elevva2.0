import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';
import type { Credentials } from '../services/api';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'role'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rely solely on onAuthStateChange. It fires immediately on load with the cached session.
    // This is the recommended approach to avoid race conditions.
    // FIX: Corrected destructuring. apiService.onAuthStateChange returns the subscription object directly.
    const subscription = apiService.onAuthStateChange(
      async (authedUser: SupabaseUser | null) => {
        if (authedUser) {
          const profile = await apiService.getProfile(authedUser);
          setUser(profile);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (credentials: Credentials) => {
    // The onAuthStateChange listener will handle setting the user state.
    await apiService.login(credentials);
  };

  const register = async (userData: Omit<User, 'id' | 'role'> & { password: string }) => {
    // The onAuthStateChange listener will handle setting the user state.
    await apiService.register(userData);
  };
  
  const logout = async () => {
    await apiService.logout();
    // The onAuthStateChange listener will set the user to null.
  };

  const value = {
    user,
    isAuthenticated: !!user && !isLoading, // Ensure loading is false
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};