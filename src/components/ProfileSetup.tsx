import React, { useState } from 'react';
import { User, MapPin } from 'lucide-react';
import { updateUserProfile } from '../services/auth';
import { REGIONS, type UserRole } from '../types';

interface ProfileSetupProps {
  onProfileComplete: () => void;
}

export default function ProfileSetup({ onProfileComplete }: ProfileSetupProps) {
  const [role, setRole] = useState<UserRole>('staff');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateUserProfile({
        role,
        region: role === 'executive' ? null : region
      });
      onProfileComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <User className="h-12 w-12 text-blue-900 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="text-gray-600 mt-2">Set up your role and region access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="staff">Staff (Can submit reports)</option>
              <option value="region_manager">Region Manager (Can view region reports)</option>
              <option value="executive">Executive (Can view all reports)</option>
            </select>
          </div>

          {role !== 'executive' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Your Region *
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Region</option>
                {REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}