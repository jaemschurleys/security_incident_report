import { SecurityReport } from '../types';

export const exportToCSV = (reports: SecurityReport[]) => {
  const headers = [
    'Report ID',
    'Unit',
    'Region', 
    'Category',
    'Incident Date',
    'Incident Time',
    'Loss Estimation (kg)',
    'Supervisor Phone',
    'Latitude',
    'Longitude',
    'Summary',
    'Created At'
  ];

  const csvData = reports.map(report => [
    report.id,
    report.unit,
    report.region,
    report.category,
    report.incident_date,
    report.incident_time,
    report.loss_estimation_kg,
    report.supervisor_phone,
    report.latitude || '',
    report.longitude || '',
    `"${report.summary.replace(/"/g, '""')}"`, // Escape quotes in summary
    new Date(report.created_at).toLocaleString()
  ]);

  const csvContent = [headers, ...csvData]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `security-reports-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};