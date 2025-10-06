import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, Eye, MapPin } from 'lucide-react';
import { SecurityReport, UNITS, REGIONS, CATEGORIES } from '../types';

interface DashboardProps {
  reports: SecurityReport[];
  onRefresh: () => void;
  onExportCSV: () => void;
}

export default function Dashboard({ reports, onRefresh, onExportCSV }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedReport, setSelectedReport] = useState<SecurityReport | null>(null);

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.supervisor_phone.includes(searchTerm) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUnit = !filterUnit || report.unit === filterUnit;
    const matchesRegion = !filterRegion || report.region === filterRegion;
    const matchesCategory = !filterCategory || report.category === filterCategory;

    return matchesSearch && matchesUnit && matchesRegion && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Pencerobohan': 'bg-red-100 text-red-800',
      'Kecurian': 'bg-orange-100 text-orange-800',
      'Kerosakan': 'bg-yellow-100 text-yellow-800',
      'Kebakaran': 'bg-red-100 text-red-800',
      'Sabotaj': 'bg-purple-100 text-purple-800',
      'Gangguan': 'bg-blue-100 text-blue-800',
      'Lain-lain': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Security Reports Dashboard</h2>
              <p className="text-gray-600">Total Reports: {filteredReports.length}</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={onExportCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Units</option>
              {UNITS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>

            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Regions</option>
              {REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit/Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loss (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(report.incident_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">{report.incident_time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.unit}</div>
                    <div className="text-sm text-gray-500">{report.region}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(report.category)}`}>
                      {report.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.loss_estimation_kg} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.latitude && report.longitude ? (
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No location</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No reports found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Report Details</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Report ID</label>
                  <p className="text-sm text-gray-900">{selectedReport.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Unit</label>
                  <p className="text-sm text-gray-900">{selectedReport.unit}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Region</label>
                  <p className="text-sm text-gray-900">{selectedReport.region}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Category</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedReport.category)}`}>
                    {selectedReport.category}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Date & Time</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedReport.incident_date).toLocaleDateString()} at {selectedReport.incident_time}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Loss Estimation</label>
                  <p className="text-sm text-gray-900">{selectedReport.loss_estimation_kg} kg</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Supervisor Phone</label>
                  <p className="text-sm text-gray-900">{selectedReport.supervisor_phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Location</label>
                  {selectedReport.latitude && selectedReport.longitude ? (
                    <p className="text-sm text-gray-900">
                      {selectedReport.latitude}, {selectedReport.longitude}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">No location data</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Summary</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                {selectedReport.summary}
              </p>
            </div>

            {selectedReport.photos && selectedReport.photos.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photos</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedReport.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}