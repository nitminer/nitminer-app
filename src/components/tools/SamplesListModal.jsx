'use client';

import React from 'react';
import { X } from 'lucide-react';

const SamplesListModal = ({ isOpen, samples, title, onSelect, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 rounded-xl border border-slate-700/50 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-gradient-to-r from-slate-800/50 to-slate-800/30">
          <h3 className="text-lg font-semibold text-slate-200">Select Sample Program - <span className="text-purple-400">{title}</span></h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors hover:scale-110"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-3">
            {samples.map((sample, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <span className="font-medium text-slate-200 flex items-center gap-2">
                  <i className="fas fa-file-code text-blue-400"></i>
                  {sample.name}
                </span>
                <button
                  onClick={() => onSelect(sample)}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg text-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 font-medium"
                >
                  <i className="fas fa-check mr-2"></i>Select
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SamplesListModal;
