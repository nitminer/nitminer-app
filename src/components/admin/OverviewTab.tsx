'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiStar, FiZap, FiCreditCard, FiTrendingUp, FiActivity } from 'react-icons/fi';

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
      setLoading(true);
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
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Syncing Metrics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 bg-red-500/10 border border-red-500/20 rounded-[32px] text-center">
        <p className="text-red-500 font-black uppercase tracking-tighter">Data Connection Failed</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Users", val: data.totalUsers, icon: FiUsers, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Premium Tier", val: data.premiumUsers, icon: FiStar, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Active Trials", val: data.freeTrialUsers, icon: FiActivity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Gross Revenue", val: `₹${(data.totalRevenue / 100).toLocaleString()}`, icon: FiZap, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ fontFamily: "'League Spartan', sans-serif" }}>
      
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-black text-[#3F3351] dark:text-white uppercase tracking-tighter leading-none">
            System <span className="text-indigo-600">Overview.</span>
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Real-time Platform Analytics</p>
        </div>
        <button onClick={fetchOverview} className="p-3 bg-white dark:bg-white/5 border border-white/10 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-xl">
           <FiTrendingUp />
        </button>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="group relative p-8 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[32px] shadow-2xl transition-all hover:-translate-y-2">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color} tracking-tighter leading-none`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* --- REVENUE VISUALIZATION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Card */}
        <div className="lg:col-span-2 p-10 bg-indigo-600 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Last 30 Days Performance</p>
            </div>
            <h3 className="text-6xl font-black tracking-tighter leading-none mb-4">
              ₹{(data.monthlyRevenue / 100).toLocaleString()}
            </h3>
            <p className="text-sm font-bold opacity-70 italic uppercase">Current Monthly Recurring Revenue (MRR)</p>
          </div>
          {/* Decorative Decal */}
          <FiZap className="absolute -bottom-10 -right-10 text-[200px] text-white/5 rotate-12" />
        </div>

        {/* Revenue by Plan Card */}
        <div className="p-8 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[40px] shadow-2xl">
          <h3 className="text-xl font-black text-[#3F3351] dark:text-white uppercase tracking-tighter mb-8 border-b border-indigo-50 dark:border-white/5 pb-4">
            Plan <span className="text-indigo-600">Distribution.</span>
          </h3>
          <div className="space-y-6">
            {(data.revenueByPlan || []).map((plan) => (
              <div key={plan._id} className="group">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{plan._id.replace('_', ' ')}</span>
                  <span className="text-sm font-black text-[#3F3351] dark:text-white">
                    ₹{(plan.total / 100).toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((plan.total / data.totalRevenue) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{plan.count} Verified Sales</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}