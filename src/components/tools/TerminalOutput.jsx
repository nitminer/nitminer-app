'use client';

import React from 'react';
import { Download } from 'lucide-react';

const TerminalOutput = ({ currentTab, output, onDownloadTerminal, onVisualize, onDownloadZip, onClearTerminal }) => {
  return (
    <div className="relative bg-slate-950/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-slate-400 text-xs font-mono">terminal output</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onDownloadTerminal()}
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-110"
              title="Download Output"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => onVisualize()}
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-110"
              title="Visualize"
            >
              <i className="fas fa-chart-pie"></i>
            </button>
            <button
              onClick={() => onDownloadZip()}
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-110"
              title="Download ZIP"
            >
              <i className="fas fa-file-archive"></i>
            </button>
            <button
              onClick={() => onClearTerminal()}
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-110"
              title="Clear Terminal"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-lg border border-slate-800/50 p-4 h-96 overflow-auto font-mono text-sm">
          {output ? (
            <pre className="text-emerald-400 whitespace-pre-wrap animate-[fadeIn_0.3s_ease-out]">
              {output}
            </pre>
          ) : (
            <div className="text-slate-600 italic">
              Output will appear here after running your code...
              <div className="mt-4 flex items-center gap-2 text-slate-700">
                <div className="w-1 h-4 bg-emerald-500/50 animate-pulse"></div>
                <span className="text-xs">Ready</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span>Connected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <span>Compiler ready</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            <span>Runtime active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalOutput;
