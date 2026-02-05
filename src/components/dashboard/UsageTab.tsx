'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Clock, Zap, Calendar, Target } from 'lucide-react';

interface UsageLog {
  _id: string;
  toolName: string;
  input: string;
  output: string;
  executionTime: number;
  timestamp: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function UsageTab() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [userStats, setUserStats] = useState({
    totalExecutions: 0,
    thisMonth: 0,
    avgTime: 0,
    favoriteTool: 'None'
  });

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/logs?page=${page}&limit=10`);
      
      if (!response.ok) {
        console.error('Failed to fetch logs:', response.status);
        setLogs([]);
        setPagination(null);
        calculateUserStats([]);
        return;
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
      setPagination(data.pagination || null);

      calculateUserStats(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
      setPagination(null);
      calculateUserStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateUserStats = (logsData: UsageLog[]) => {
    if (!logsData || !Array.isArray(logsData)) {
      setUserStats({
        totalExecutions: 0,
        thisMonth: 0,
        avgTime: 0,
        favoriteTool: 'None',
      });
      return;
    }

    const totalExecutions = logsData.length;

    const now = new Date();
    const thisMonth = logsData.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    }).length;

    const totalTime = logsData.reduce((sum, log) => sum + log.executionTime, 0);
    const avgTime = totalExecutions > 0 ? Math.round((totalTime / totalExecutions) / 1000 * 10) / 10 : 0;

    const toolCount: { [key: string]: number } = {};
    logsData.forEach(log => {
      toolCount[log.toolName] = (toolCount[log.toolName] || 0) + 1;
    });
    const favoriteTool = Object.keys(toolCount).length > 0
      ? Object.keys(toolCount).reduce((a, b) => toolCount[a] > toolCount[b] ? a : b)
      : 'None';

    setUserStats({
      totalExecutions,
      thisMonth,
      avgTime,
      favoriteTool
    });
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <div className="space-y-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>My Usage</h2>
        </div>

        {/* Personal Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">Total Executions</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{userStats.totalExecutions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">This Month</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{userStats.thisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">Avg Time</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{userStats.avgTime}s</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">Favorite Tool</p>
                <p className="text-lg font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{userStats.favoriteTool}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Logs Table */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Recent Executions
            </h3>
          </div>

          {(!logs || logs.length === 0) ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 font-bold">No tool usage yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                    <tr>
                      <th className="px-6 py-4 font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Tool</th>
                      <th className="px-6 py-4 font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Execution Time</th>
                      <th className="px-6 py-4 font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Date & Time</th>
                      <th className="px-6 py-4 font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Input Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id} className="border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition">
                        <td className="px-6 py-4 font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{log.toolName}</td>
                        <td className="px-6 py-4 font-bold">{log.executionTime}ms</td>
                        <td className="px-6 py-4 font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 truncate max-w-xs font-medium">{log.input.substring(0, 50)}...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="p-6 border-t border-gray-200 dark:border-zinc-700">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:bg-gray-50 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-gray-500 text-gray-900 dark:text-white rounded-xl transition font-black"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Previous
                    </button>

                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-4 py-2 rounded-xl transition font-black ${
                          page === p
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-900 dark:text-white'
                        }`}
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                      disabled={page === pagination.pages}
                      className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:bg-gray-50 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-gray-500 text-gray-900 dark:text-white rounded-xl transition font-black"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}