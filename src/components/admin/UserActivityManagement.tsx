'use client';

import { useEffect, useState, useRef } from 'react';
import {
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiGlobe,
  FiSmartphone,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

interface UserActivity {
  _id: string;
  email: string;
  lastLogin: string;
  lastActive: string;
  lastActivityAction: string;
  lastActivityPage?: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  activityCount: number;
  sessionDuration: number;
  isOnline: boolean;
  inactiveMinutes: number;
  onlineStatus: 'online' | 'offline';
  isSessionExpired: boolean;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UserActivityManagement({ refreshTrigger }: { refreshTrigger: number }) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [filterOnline, setFilterOnline] = useState<'all' | 'true' | 'false'>('all');
  const [sortBy, setSortBy] = useState('lastActive');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [debouncedSearchEmail, setDebouncedSearchEmail] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchEmail(searchEmail);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchEmail]);

  // Fetch activities
  const fetchActivities = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (debouncedSearchEmail) {
        params.append('email', debouncedSearchEmail);
      }

      if (filterOnline !== 'all') {
        params.append('online', filterOnline);
      }

      const response = await fetch(`/api/activity/admin?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch activities');
      }

      setActivities(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [debouncedSearchEmail, filterOnline, sortBy, sortOrder, pagination.page, refreshTrigger]);

  const handleExport = () => {
    const csv = [
      ['Email', 'Last Login', 'Last Active', 'Status', 'Inactive Minutes', 'Device', 'Browser', 'Activity Count'],
      ...activities.map((a) => [
        a.email,
        new Date(a.lastLogin).toLocaleString(),
        new Date(a.lastActive).toLocaleString(),
        a.onlineStatus,
        a.inactiveMinutes.toString(),
        a.device,
        a.browser,
        a.activityCount.toString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diff = now.getTime() - activityDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return activityDate.toLocaleDateString();
  };

  const formatInactiveTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              User Activity Monitor
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
              Track user login activity, session duration, and online status
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
          >
            <FiDownload /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <select
            value={filterOnline}
            onChange={(e) => setFilterOnline(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="all">All Users</option>
            <option value="true">Online</option>
            <option value="false">Offline</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="lastActive">Last Active</option>
            <option value="lastLogin">Last Login</option>
            <option value="activityCount">Activity Count</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all dark:border-gray-700 dark:text-white flex items-center justify-center gap-2"
          >
            <FiRefreshCw className={sortOrder === 'asc' ? 'rotate-180' : ''} /> {sortOrder.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400 font-bold">Loading activities...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3 text-red-600">
              <FiAlertCircle size={32} />
              <p className="font-bold">{error}</p>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500 dark:text-gray-400 font-bold">No user activities found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                      Inactive
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                      Activity Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                      Last Login
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {activities.map((activity) => (
                    <tr
                      key={activity._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{activity.email}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{activity.os}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {activity.onlineStatus === 'online' ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">
                                Online
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                                Offline
                              </span>
                            </>
                          )}
                          {activity.isSessionExpired && (
                            <span className="px-2 py-1 text-[10px] font-black bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md uppercase">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatTime(activity.lastActive)}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          {new Date(activity.lastActive).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <FiClock size={14} className="text-gray-400" />
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatInactiveTime(activity.inactiveMinutes)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <FiSmartphone size={14} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {activity.device}
                            </span>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">{activity.browser}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold text-xs rounded-lg">
                          {activity.activityCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {new Date(activity.lastLogin).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-bold">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-all"
                >
                  <FiChevronLeft />
                </button>
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => pagination.page - 2 + i
                )
                  .filter((p) => p > 0 && p <= pagination.totalPages)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPagination({ ...pagination, page: p })}
                      className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                        pagination.page === p
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-all"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
