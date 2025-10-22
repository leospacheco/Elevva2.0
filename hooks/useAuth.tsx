import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';
import type { Credentials } from '../services/api';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient'; // FIX: Import supabase client for direct access

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
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Rely solely on onAuthStateChange. It fires immediately on load with the cached session.
    // This is the recommended approach to avoid race conditions.
    // FIX: Corrected destructuring. apiService.onAuthStateChange returns the subscription object directly.
    const subscription = apiService.onAuthStateChange(
      async (authedUser: SupabaseUser | null) => {
        // FIX: Only update profile if the user ID has changed. Prevents refetching on window focus.
        if (authedUser) {
          if (authedUser.id !== userIdRef.current) {
            const profile = await apiService.getProfile(authedUser);
            userIdRef.current = profile.id;
            setUser(profile);
          }
        } else {
          userIdRef.current = null;
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Keep dependency array empty to run only once

  const login = async (credentials: Credentials) => {
    // The onAuthStateChange listener will handle setting the user state.
    await apiService.login(credentials);
  };

  const register = async (userData: Omit<User, 'id' | 'role'> & { password: string }) => {
    // The onAuthStateChange listener will handle setting the user state.
    await apiService.register(userData);
  };
  
  const logout = async () => {
    // FIX: Explicitly remove all realtime channels *before* signing out.
    // This is a more robust way to prevent stale connections which can cause
    // CHANNEL_ERROR on subsequent logins.
    console.log("Removing all realtime channels before logout...");
    await supabase.removeAllChannels();
    console.log("Channels removed. Signing out...");
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