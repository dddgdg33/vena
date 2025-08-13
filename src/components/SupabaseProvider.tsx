import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useProfile } from '../hooks/useSupabase';
import { User, Profile } from '../types';

interface SupabaseContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabaseContext = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabaseContext must be used within a SupabaseProvider');
  }
  return context;
};

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();

  const loading = authLoading || profileLoading;

  const value: SupabaseContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};