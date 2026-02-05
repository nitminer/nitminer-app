'use client';

import React from 'react';
import { Play } from 'lucide-react';

const ExecuteButton = ({ loading, onExecute }) => {
  return (
    <button
      onClick={onExecute}
      disabled={loading}
      className="w-full group/btn relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg blur opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300"></div>
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            <span>Running...</span>
          </>
        ) : (
          <>
            <Play size={18} />
            <span>Run Code</span>
          </>
        )}
      </span>
    </button>
  );
};

export default ExecuteButton;
