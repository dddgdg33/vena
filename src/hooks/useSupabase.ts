import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Client, Project, TeamMember, Transaction, Package, AddOn, 
  Card, FinancialPocket, Lead, Asset, Contract, ClientFeedback,
  SocialMediaPost, PromoCode, SOP, Notification, User, Profile
} from '../types';

// Generic hook for CRUD operations
export function useSupabaseTable<T extends { id: string }>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const insert = async (item: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      setData(prev => [result, ...prev]);
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Insert failed');
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setData(prev => prev.map(item => item.id === id ? result : item));
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableName]);

  return {
    data,
    loading,
    error,
    insert,
    update,
    remove,
    refetch: fetchData
  };
}

// Specific hooks for each entity
export const useClients = () => useSupabaseTable<Client>('clients');
export const useProjects = () => useSupabaseTable<Project>('projects');
export const useTeamMembers = () => useSupabaseTable<TeamMember>('team_members');
export const useTransactions = () => useSupabaseTable<Transaction>('transactions');
export const usePackages = () => useSupabaseTable<Package>('packages');
export const useAddOns = () => useSupabaseTable<AddOn>('add_ons');
export const useCards = () => useSupabaseTable<Card>('cards');
export const useFinancialPockets = () => useSupabaseTable<FinancialPocket>('financial_pockets');
export const useLeads = () => useSupabaseTable<Lead>('leads');
export const useAssets = () => useSupabaseTable<Asset>('assets');
export const useContracts = () => useSupabaseTable<Contract>('contracts');
export const useClientFeedback = () => useSupabaseTable<ClientFeedback>('client_feedback');
export const useSocialMediaPosts = () => useSupabaseTable<SocialMediaPost>('social_media_posts');
export const usePromoCodes = () => useSupabaseTable<PromoCode>('promo_codes');
export const useSOPs = () => useSupabaseTable<SOP>('sops');
export const useNotifications = () => useSupabaseTable<Notification>('notifications');

// Authentication hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.email!);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.email!);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // First check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      // For demo purposes, we'll use a simple password check
      // In production, you'd use proper password hashing
      if (password === 'password123' && email === 'admin@venapictures.com') {
        setUser(userData);
        return { user: userData, error: null };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      return { user: null, error: err instanceof Error ? err.message : 'Sign in failed' };
    }
  };

  const signOut = async () => {
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    signOut
  };
}

// Profile hook
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (error) throw error;
      
      // Transform database format to app format
      const transformedProfile: Profile = {
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        companyName: data.company_name,
        website: data.website || '',
        address: data.address,
        bankAccount: data.bank_account,
        authorizedSigner: data.authorized_signer,
        idNumber: data.id_number || '',
        bio: data.bio || '',
        incomeCategories: data.income_categories || [],
        expenseCategories: data.expense_categories || [],
        projectTypes: data.project_types || [],
        eventTypes: data.event_types || [],
        assetCategories: data.asset_categories || [],
        sopCategories: data.sop_categories || [],
        projectStatusConfig: data.project_status_config || [],
        notificationSettings: data.notification_settings || {
          newProject: true,
          paymentConfirmation: true,
          deadlineReminder: true
        },
        securitySettings: data.security_settings || {
          twoFactorEnabled: false
        },
        briefingTemplate: data.briefing_template || '',
        termsAndConditions: data.terms_and_conditions || ''
      };

      setProfile(transformedProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      // Transform app format to database format
      const dbUpdates: any = {};
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
      if (updates.website !== undefined) dbUpdates.website = updates.website;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.bankAccount !== undefined) dbUpdates.bank_account = updates.bankAccount;
      if (updates.authorizedSigner !== undefined) dbUpdates.authorized_signer = updates.authorizedSigner;
      if (updates.idNumber !== undefined) dbUpdates.id_number = updates.idNumber;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      if (updates.incomeCategories !== undefined) dbUpdates.income_categories = updates.incomeCategories;
      if (updates.expenseCategories !== undefined) dbUpdates.expense_categories = updates.expenseCategories;
      if (updates.projectTypes !== undefined) dbUpdates.project_types = updates.projectTypes;
      if (updates.eventTypes !== undefined) dbUpdates.event_types = updates.eventTypes;
      if (updates.assetCategories !== undefined) dbUpdates.asset_categories = updates.assetCategories;
      if (updates.sopCategories !== undefined) dbUpdates.sop_categories = updates.sopCategories;
      if (updates.projectStatusConfig !== undefined) dbUpdates.project_status_config = updates.projectStatusConfig;
      if (updates.notificationSettings !== undefined) dbUpdates.notification_settings = updates.notificationSettings;
      if (updates.securitySettings !== undefined) dbUpdates.security_settings = updates.securitySettings;
      if (updates.briefingTemplate !== undefined) dbUpdates.briefing_template = updates.briefingTemplate;
      if (updates.termsAndConditions !== undefined) dbUpdates.terms_and_conditions = updates.termsAndConditions;

      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', profile?.id || '');

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Profile update failed');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
}