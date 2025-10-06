export interface SecurityReport {
  id: string;
  unit: string;
  region: string;
  category: string;
  incident_date: string;
  incident_time: string;
  loss_estimation_kg: number;
  supervisor_phone: string;
  summary: string;
  latitude: number | null;
  longitude: number | null;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface ReportFormData {
  unit: string;
  region: string;
  category: string;
  incident_date: string;
  incident_time: string;
  loss_estimation_kg: number;
  supervisor_phone: string;
  summary: string;
  latitude: number | null;
  longitude: number | null;
  photos: File[];
}

export const UNITS = ['ABM', 'KNR', 'SDM', 'SPGM', 'LKM', 'LMD'] as const;
export const REGIONS = ['TWU', 'LD', 'SDK', 'BFT', 'KDT'] as const;
export const CATEGORIES = [
  'Pencerobohan',
  'Kecurian', 
  'Kerosakan',
  'Kebakaran',
  'Sabotaj',
  'Gangguan',
  'Lain-lain'
] as const;

export type UserRole = 'staff' | 'region_manager' | 'executive';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
}