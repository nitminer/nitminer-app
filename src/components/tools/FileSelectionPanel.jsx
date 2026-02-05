'use client';

import React from 'react';
import { Eye } from 'lucide-react';

const FileSelectionPanel = ({ currentTab, currentFile, onBrowse, onView, fileInputRef, onFileSelect }) => {
  const handleBrowseClick = () => {
    if (fileInputRef?.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4 hover:bg-slate-800/40 transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
        <i className="fas fa-file-upload text-blue-400"></i>
        File Selection
      </h3>
      <div className="space-y-3">
        <input
          type="text"
          value={currentFile?.type === currentTab ? currentFile.file.name : ''}
          readOnly
          placeholder={`Select ${currentTab} file...`}
          className="w-full px-4 py-2 bg-slate-900/50 text-slate-100 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm placeholder:text-slate-600"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={
            currentTab === 'solidity' 
              ? '.sol' 
              : currentTab === 'java' 
              ? '.java' 
              : currentTab === 'python' 
              ? '.py' 
              : '.c'
          }
          onChange={(e) => onFileSelect(e, currentTab)}
          className="hidden"
        />
        <div className="flex gap-2">
          <button
            onClick={handleBrowseClick}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 text-sm font-medium"
          >
            <i className="fas fa-folder-open mr-2"></i>Browse
          </button>
          <button
            onClick={() => onView(currentTab)}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 text-sm font-medium"
          >
            <Eye size={16} className="inline mr-2" />View
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileSelectionPanel;

