import { supabase } from './supabase';
import type { UserProfile, AuthUser } from '../types';

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return {
      id: user.id,
      email: user.email || '',
      profile: null
    };
  }

  return {
    id: user.id,
    email: user.email || '',
    profile: profile as UserProfile
  };
};

export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
};