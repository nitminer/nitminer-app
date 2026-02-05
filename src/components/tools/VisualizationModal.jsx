'use client';

import React from 'react';
import { X, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VisualizationModal = ({ isOpen, chartData, onClose, onDownload }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 rounded-xl border border-slate-700/50 max-w-xl w-full shadow-2xl">
        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-gradient-to-r from-slate-800/50 to-slate-800/30">
          <h2 className="text-lg font-bold text-slate-200">Execution Visualization</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors hover:scale-110"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center mb-4 w-full" id="visualization-chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: '5px', fontSize: '11px' }} verticalAlign="bottom" height={30} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-br from-slate-800/30 to-slate-800/10 rounded-lg border border-slate-700/50">
            <h3 className="font-semibold text-slate-200 mb-3 text-sm flex items-center gap-2">
              <i className="fas fa-info-circle text-blue-400"></i>
              Chart Data
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-slate-900/50 rounded hover:bg-slate-900/70 transition-colors">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="text-xs text-slate-300">
                    {item.name}: <strong className="text-slate-100">{item.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={onDownload}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg transition-all font-medium text-sm hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <Download size={16} className="inline mr-2" />Download
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-4 py-2 rounded-lg transition-all font-medium text-sm hover:scale-105 hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationModal;
