import React from 'react';
import { Shield, Users, FileText, LogOut, Settings } from 'lucide-react';
import type { AuthUser } from '../types';

interface HeaderProps {
  currentView: 'report' | 'dashboard' | 'admin';
  onViewChange: (view: 'report' | 'dashboard' | 'admin') => void;
  user: AuthUser;
  onSignOut: () => void;
}

export default function Header({ currentView, onViewChange, user, onSignOut }: HeaderProps) {
  const canViewDashboard = user.profile?.role === 'region_manager' || user.profile?.role === 'executive';
  const canViewAdmin = user.profile?.role === 'executive';

  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Security Department</h1>
              <p className="text-blue-200 text-sm">Incident Reporting System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <p className="text-blue-200">{user.email}</p>
              <p className="text-blue-300 capitalize">{user.profile?.role?.replace('_', ' ')}</p>
            </div>
            
            <nav className="flex space-x-4">
            <button
              onClick={() => onViewChange('report')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'report'
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:text-white hover:bg-blue-800'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>New Report</span>
            </button>
            
            {canViewDashboard && (
              <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:text-white hover:bg-blue-800'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            )}
            
            {canViewAdmin && (
              <button
                onClick={() => onViewChange('admin')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'admin'
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-200 hover:text-white hover:bg-blue-800'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </button>
            )}
            
            <button
              onClick={onSignOut}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </nav>
          </div>
        </div>
      </div>
    </header>
  );
}