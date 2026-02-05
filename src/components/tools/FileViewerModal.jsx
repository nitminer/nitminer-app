'use client';

import React from 'react';
import { X } from 'lucide-react';

const FileViewerModal = ({ isOpen, fileContent, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 rounded-xl border border-slate-700/50 max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-gradient-to-r from-slate-800/50 to-slate-800/30">
          <h3 className="text-lg font-semibold text-slate-200">File Content</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors hover:scale-110"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-auto max-h-[calc(80vh-80px)] bg-slate-950">
          <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
            {fileContent}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
