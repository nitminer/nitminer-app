'use client';

import { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'login' | 'payment' | 'tool_execution' | 'error' | 'success';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'error' | 'warning';
}

export default function ActivityTab() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/activity?limit=20');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case 'tool_execution':
        return status === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />;
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'login':
        return status === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400">Loading activity...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Activity className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-white">My Activity</h2>
      </div>

      {/* Activity Feed */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Recent Activity
          </h3>
        </div>

        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">No activity yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {activities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-slate-800 transition">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type, activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">{activity.title}</h4>
                      <span className="text-slate-400 text-sm">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{activity.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}