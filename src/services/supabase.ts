import { createClient } from '@supabase/supabase-js';
import type { SecurityReport, ReportFormData } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up Supabase connection.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const submitReport = async (reportData: ReportFormData): Promise<SecurityReport> => {
  // Upload photos if any
  const photoUrls: string[] = [];
  
  if (reportData.photos.length > 0) {
    for (let i = 0; i < reportData.photos.length; i++) {
      const photo = reportData.photos[i];
      const fileExt = photo.name.split('.').pop();
      const fileName = `${Date.now()}-${i}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('report-photos')
        .upload(fileName, photo);

      if (error) {
        throw new Error(`Failed to upload photo: ${error.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('report-photos')
        .getPublicUrl(fileName);

      photoUrls.push(publicUrl);
    }
  }

  // Insert report data
  const { data, error } = await supabase
    .from('security_reports')
    .insert({
      unit: reportData.unit,
      region: reportData.region,
      category: reportData.category,
      incident_date: reportData.incident_date,
      incident_time: reportData.incident_time,
      loss_estimation_kg: reportData.loss_estimation_kg,
      supervisor_phone: reportData.supervisor_phone,
      summary: reportData.summary,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      photos: photoUrls
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit report: ${error.message}`);
  }

  return data as SecurityReport;
};

export const fetchReports = async (): Promise<SecurityReport[]> => {
  const { data, error } = await supabase
    .from('security_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }

  return data as SecurityReport[];
};