'use client';

import { Code, Play } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
  toolSelected?: boolean;
  onCompile?: () => void;
  isCompiling?: boolean;
}

export default function CodeEditor({
  code,
  language,
  onCodeChange,
  onExecute,
  isExecuting,
  toolSelected = true,
  onCompile,
  isCompiling = false,
}: CodeEditorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Code className="text-blue-600 mr-2" size={20} />
          Write Your Code ({language.toUpperCase()})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onExecute}
            disabled={isExecuting || !toolSelected}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {isExecuting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={16} />
                Execute
              </>
            )}
          </button>
          {onCompile && (
            <button
              onClick={onCompile}
              disabled={isCompiling}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isCompiling ? 'Compiling...' : 'Compile'}
            </button>
          )}
        </div>
      </div>

      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        spellCheck={false}
        className="w-full h-96 resize-y rounded-lg border border-slate-300 bg-slate-950 text-slate-100 p-4 font-mono text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={`Write your ${language} code here...`}
      />
    </div>
  );
}
