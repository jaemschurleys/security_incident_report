import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import ProfileSetup from './components/ProfileSetup';
import Header from './components/Header';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import { SecurityReport, ReportFormData, AuthUser } from './types';
import { submitReport, fetchReports } from './services/supabase';
import { getCurrentUser, signOut } from './services/auth';
import { supabase } from './services/supabase';
import { exportToCSV } from './utils/csvExport';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'report' | 'dashboard' | 'admin'>('report');
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAuthSuccess = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setReports([]);
      setCurrentView('report');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileComplete = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const handleSubmitReport = async (formData: ReportFormData) => {
    setIsSubmitting(true);
    try {
      const newReport = await submitReport(formData);
      
      // Only update reports if user can view them
      if (user?.profile?.role === 'region_manager' || user?.profile?.role === 'executive') {
        setReports(prev => [newReport, ...prev]);
        setCurrentView('dashboard');
      }
      
      showNotification('success', 'Security report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      showNotification('error', error instanceof Error ? error.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshReports = async () => {
    if (!user?.profile || user.profile.role === 'staff') {
      return;
    }

    try {
      const fetchedReports = await fetchReports();
      setReports(fetchedReports);
      showNotification('success', 'Reports refreshed successfully!');
    } catch (error) {
      console.error('Error fetching reports:', error);
      showNotification('error', 'Failed to refresh reports');
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(reports);
      showNotification('success', 'Reports exported to CSV successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showNotification('error', 'Failed to export reports');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser?.profile?.role === 'region_manager' || currentUser?.profile?.role === 'executive') {
          await handleRefreshReports();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setReports([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  if (!user.profile) {
    return <ProfileSetup onProfileComplete={handleProfileComplete} />;
  }

  const canViewDashboard = user.profile.role === 'region_manager' || user.profile.role === 'executive';
  const canViewAdmin = user.profile.role === 'executive';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView}
        user={user}
        onSignOut={handleSignOut}
      />
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <main className="py-8">
        {currentView === 'report' || (!canViewDashboard && !canViewAdmin) ? (
          <ReportForm 
            onSubmit={handleSubmitReport}
            isSubmitting={isSubmitting}
          />
        ) : currentView === 'dashboard' ? (
          <Dashboard 
            reports={reports}
            onRefresh={handleRefreshReports}
            onExportCSV={handleExportCSV}
          />
        ) : currentView === 'admin' && canViewAdmin ? (
          <AdminPanel 
            onRefresh={handleRefreshReports}
          />
        ) : (
          <ReportForm 
            onSubmit={handleSubmitReport}
            isSubmitting={isSubmitting}
          />
        )}
      </main>
    </div>
  );
}

export default App;