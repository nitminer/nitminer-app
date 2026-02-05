'use client';

import React from 'react';
import { Settings } from 'lucide-react';

const ToolConfiguration = ({
  currentTab,
  cTool,
  javaTool,
  pythonTool,
  solidityTool,
  solidityMode,
  cbmcBound,
  kleemaValue,
  gmcovVersion,
  gmcovTimebound,
  gmutantVersion,
  gmutantTimebound,
  onToolChange,
  onLoadSample,
  onParameterChange
}) => {
  return (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4 hover:bg-slate-800/40 transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
        <Settings size={16} className="text-purple-400" />
        Tool Configuration
      </h3>
      <div className="space-y-3">
        {/* Tool Selection */}
        <select
          value={currentTab === 'c' ? cTool : currentTab === 'java' ? javaTool : currentTab === 'python' ? pythonTool : solidityTool}
          onChange={(e) => onToolChange(currentTab, e.target.value)}
          className="w-full px-4 py-2 bg-slate-900/50 text-slate-100 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm hover:bg-slate-900/70 transition-colors"
        >
          <option value="">Select a tool</option>
          {currentTab === 'c' && (
            <>
              <option value="Condition Satisfiability Analysis">Condition Satisfiability Analysis</option>
              <option value="DSE based Mutation Analyser">DSE based Mutation Analyser</option>
              <option value="Dynamic Symbolic Execution">Dynamic Symbolic Execution</option>
              <option value="Dynamic Symbolic Execution with Pruning">Dynamic Symbolic Execution with Pruning</option>
              <option value="Advance Code Coverage Profiler">Advance Code Coverage Profiler</option>
              <option value="Mutation Testing Profiler">Mutation Testing Profiler</option>
            </>
          )}
          {currentTab === 'java' && (
            <option value="JBMC">JBMC - Java Bounded Model Checker</option>
          )}
          {currentTab === 'python' && (
            <option value="Condition Coverage Fuzzing">Condition Coverage Fuzzing</option>
          )}
          {currentTab === 'solidity' && (
            <option value="VeriSol">VeriSol - Smart Contract Verifier</option>
          )}
        </select>

        {/* Load Sample Button */}
        <button
          onClick={() => onLoadSample(currentTab)}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 text-sm font-medium"
        >
          <i className="fas fa-file-code mr-2"></i>Load Sample Code
        </button>

        {/* Tool-specific Parameters */}
        {currentTab === 'c' && cTool === 'Condition Satisfiability Analysis' && (
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-900/70 transition-colors">
            <label className="block text-xs font-medium text-slate-400 mb-2">Unwind Bound:</label>
            <input
              type="number"
              value={cbmcBound}
              onChange={(e) => onParameterChange('cbmcBound', e.target.value)}
              placeholder="Enter unwind bound value"
              className="w-full px-3 py-2 bg-slate-800/50 text-slate-100 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
            />
          </div>
        )}

        {currentTab === 'c' && cTool === 'DSE based Mutation Analyser' && (
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-900/70 transition-colors">
            <label className="block text-xs font-medium text-slate-400 mb-2">Tool Value:</label>
            <select
              value={kleemaValue}
              onChange={(e) => onParameterChange('kleemaValue', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 text-slate-100 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
        )}

        {currentTab === 'c' && (cTool === 'Advance Code Coverage Profiler' || cTool === 'Mutation Testing Profiler') && (
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 space-y-3 hover:bg-slate-900/70 transition-colors">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Version:</label>
              <select
                value={cTool === 'Advance Code Coverage Profiler' ? gmcovVersion : gmutantVersion}
                onChange={(e) => onParameterChange(
                  cTool === 'Advance Code Coverage Profiler' ? 'gmcovVersion' : 'gmutantVersion',
                  e.target.value
                )}
                className="w-full px-3 py-2 bg-slate-800/50 text-slate-100 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Time Bound (seconds):</label>
              <input
                type="number"
                value={cTool === 'Advance Code Coverage Profiler' ? gmcovTimebound : gmutantTimebound}
                onChange={(e) => onParameterChange(
                  cTool === 'Advance Code Coverage Profiler' ? 'gmcovTimebound' : 'gmutantTimebound',
                  e.target.value
                )}
                placeholder="Enter time bound"
                className="w-full px-3 py-2 bg-slate-800/50 text-slate-100 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
              />
            </div>
          </div>
        )}

        {currentTab === 'solidity' && solidityTool === 'VeriSol' && (
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-900/70 transition-colors">
            <label className="block text-xs font-medium text-slate-400 mb-2">Verification Mode:</label>
            <select
              value={solidityMode}
              onChange={(e) => onParameterChange('solidityMode', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 text-slate-100 border border-slate-700/50 rounded-lg focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
            >
              <option value="bmc">Bounded Model Checker</option>
              <option value="chc">Constrained Horn Clauses</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolConfiguration;
