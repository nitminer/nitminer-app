'use client';

import React from 'react';
import { User } from 'lucide-react';

const ToolsHeader = ({ firstName, email, noOfTrails, hasPremium, onProfileClick, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <div className="text-white p-2 rounded-lg">
              <img src="/logo.png" alt="TrustInn Logo" className="h-8 w-auto"/>
            </div>
            <div className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity duration-200">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">TrustInn</h1>
              <p className="text-xs text-slate-400">NITMiner Technologies Private Limited</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onProfileClick}
              className="flex items-center space-x-2 bg-gradient-to-r from-slate-800/50 to-slate-800/30 hover:from-slate-700/50 hover:to-slate-700/30 px-4 py-2 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/10"
              title="View Profile"
            >
              <User className="w-5 h-5 text-blue-400" />
            </button>
            
            {!hasPremium && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500/10 to-orange-500/5 px-4 py-2 rounded-lg border border-orange-500/30 hover:border-orange-500/50 transition-colors">
                <i className="fas fa-zap text-orange-400"></i>
                <span className="text-orange-300 font-medium text-sm">
                  Trials: {noOfTrails !== null ? noOfTrails : '...'}
                </span>
              </div>
            )}
            
            {hasPremium && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-4 py-2 rounded-lg border-2 border-emerald-500/30 shadow-lg hover:shadow-emerald-500/20 transition-shadow">
                <i className="fas fa-crown text-emerald-400 animate-bounce" style={{ animationDuration: '2s' }}></i>
                <span className="text-emerald-300 font-bold text-sm">Premium Member ✓</span>
              </div>
            )}
            
            <button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-600/80 to-red-600/70 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/25 flex items-center space-x-2 hover:scale-105 font-medium text-sm"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ToolsHeader;
