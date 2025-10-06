import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Camera, Clock, AlertTriangle } from 'lucide-react';
import { UNITS, REGIONS, CATEGORIES, type ReportFormData } from '../types';

interface ReportFormProps {
  onSubmit: (data: ReportFormData) => void;
  isSubmitting: boolean;
}

export default function ReportForm({ onSubmit, isSubmitting }: ReportFormProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    unit: '',
    region: '',
    category: '',
    incident_date: new Date().toISOString().split('T')[0],
    incident_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    loss_estimation_kg: 0,
    supervisor_phone: '',
    summary: '',
    latitude: null,
    longitude: null,
    photos: []
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string>('');

  const handleInputChange = (field: keyof ReportFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentLocation = () => {
    setGpsLoading(true);
    setGpsError('');

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setGpsLoading(false);
      },
      (error) => {
        setGpsError('Failed to get location: ' + error.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-8">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Security Incident Report</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Unit</option>
                {UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Region *
              </label>
              <select
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Region</option>
                {REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loss Estimation (kg)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.loss_estimation_kg}
                onChange={(e) => handleInputChange('loss_estimation_kg', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Incident Date *
              </label>
              <input
                type="date"
                value={formData.incident_date}
                onChange={(e) => handleInputChange('incident_date', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Incident Time *
              </label>
              <input
                type="time"
                value={formData.incident_time}
                onChange={(e) => handleInputChange('incident_time', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Supervisor Phone Number *
            </label>
            <input
              type="tel"
              value={formData.supervisor_phone}
              onChange={(e) => handleInputChange('supervisor_phone', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="+60123456789"
            />
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location Coordinates
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gpsLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
              >
                {gpsLoading ? 'Getting Location...' : 'Get Current Location'}
              </button>
            </div>

            {gpsError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {gpsError}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 3.1390"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 101.6869"
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Camera className="inline h-4 w-4 mr-1" />
              Attach Photos
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            
            {formData.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes / Summary *
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Provide detailed information about the incident..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              {isSubmitting ? 'Submitting Report...' : 'Submit Security Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}