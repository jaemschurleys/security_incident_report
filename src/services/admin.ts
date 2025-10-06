import { supabase } from './supabase';
import type { UserProfile, UserRole } from '../types';

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  region?: string;
}

export interface UpdateUserData {
  role: UserRole;
  region?: string;
}

export const createUser = async (userData: CreateUserData) => {
  const { data, error } = await supabase.rpc('create_user_with_profile', {
    user_email: userData.email,
    user_password: userData.password,
    user_role: userData.role,
    user_region: userData.region || null
  });

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to create user');
  }

  return data;
};

export const updateUserRole = async (userId: string, updateData: UpdateUserData) => {
  const { data, error } = await supabase.rpc('update_user_role_and_region', {
    target_user_id: userId,
    new_role: updateData.role,
    new_region: updateData.region || null
  });

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to update user');
  }

  return data;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data as UserProfile[];
};

export const deleteUser = async (userId: string) => {
  // First delete the user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Failed to delete user profile: ${profileError.message}`);
  }

  // Note: Deleting from auth.users requires admin privileges
  // This would typically be done through Supabase Admin API
  // For now, we'll just delete the profile and the auth user will remain
  
  return { success: true };
};