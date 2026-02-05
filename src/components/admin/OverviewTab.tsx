'use client';

import { useState, useEffect } from 'react';

interface OverviewData {
  totalUsers: number;
  premiumUsers: number;
  freeTrialUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  revenueByPlan: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
}

export default function OverviewTab() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await fetch('/api/admin/overview');
      if (response.ok) {
        const overviewData = await response.json();
        setData(overviewData);
      }
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!data) {
    return <div className="text-red-400">Failed to load data</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Total Users</p>
          <p className="text-3xl font-bold text-blue-400">{data.totalUsers}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Premium Users</p>
          <p className="text-3xl font-bold text-green-400">{data.premiumUsers}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Free Trial Users</p>
          <p className="text-3xl font-bold text-yellow-400">{data.freeTrialUsers}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-purple-400">₹{(data.totalRevenue / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Monthly Revenue (Last 30 Days)</p>
          <p className="text-4xl font-bold text-blue-400">₹{(data.monthlyRevenue / 100).toFixed(2)}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Plan</h3>
          <div className="space-y-2">
            {data.revenueByPlan.map((plan) => (
              <div key={plan._id} className="flex justify-between">
                <span className="text-slate-400 capitalize">{plan._id.replace('_', ' ')}</span>
                <span className="text-white">₹{(plan.total / 100).toFixed(2)} ({plan.count} sales)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
