'use client';

import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, TrendingUp, Users, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Payment {
  _id: string;
  plan: string;
  amount: number;
  status: string;
  userId: string;
  createdAt: string;
}

interface AnalyticsData {
  paymentTrends: any[];
  dailyEarnings: any[];
  monthlyRevenue: any[];
  userGrowth: any[];
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    paymentTrends: [],
    dailyEarnings: [],
    monthlyRevenue: [],
    userGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    avgPayment: 0,
    activeUsers: 0,
    revenueByDay: [] as any[]
  });

  const formatNumber = (num: number): string => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(1)}Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    } else if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${num}`;
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/payments?limit=1000')
      ]);

      const analyticsData = await analyticsRes.json();
      const paymentsData = await paymentsRes.json();

      const successfulPayments = paymentsData.payments?.filter((p: Payment) => p.status === 'success') || [];
      const processedData = processAnalyticsData(analyticsData, successfulPayments);
      setAnalytics(processedData);

      const totalRevenue = successfulPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
      const totalPayments = successfulPayments.length;
      const avgPayment = totalPayments > 0 ? Math.round((totalRevenue / totalPayments) * 100) / 100 : 0;

      const usersRes = await fetch('/api/admin/users?limit=1');
      const usersData = await usersRes.json();
      const activeUsers = usersData.pagination?.totalUsers || 0;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      
      const revenueByDayMap = new Map();
      successfulPayments.forEach(payment => {
        const paymentDate = new Date(payment.createdAt);
        if (paymentDate >= sevenDaysAgo && payment.status === 'success') {
          const dayKey = paymentDate.toISOString().split('T')[0];
          revenueByDayMap.set(dayKey, (revenueByDayMap.get(dayKey) || 0) + payment.amount);
        }
      });

      const revenueByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayKey = date.toISOString().split('T')[0];
        const amount = revenueByDayMap.get(dayKey) || 0;
        revenueByDay.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount
        });
      }

      setStats({
        totalRevenue,
        totalPayments,
        avgPayment,
        activeUsers,
        revenueByDay
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (analyticsData: any, payments: Payment[]): AnalyticsData => {
    const paymentTrends = analyticsData.revenueData?.map((item: any) => ({
      date: item._id,
      amount: item.revenue
    })) || [];

    const dailyEarnings = analyticsData.dailyActivity?.map((item: any) => ({
      date: new Date(item._id).toLocaleDateString(),
      amount: item.count
    })) || [];

    const monthlyMap = new Map();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

    payments.forEach(payment => {
      const paymentDate = new Date(payment.createdAt);
      if (paymentDate >= twelveMonthsAgo && payment.status === 'success') {
        const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + payment.amount);
      }
    });

    const monthlyRevenue = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    const userGrowth = analyticsData.userGrowth?.map((item: any) => ({
      month: new Date(item._id).toLocaleDateString('en-US', { month: 'short' }),
      users: item.count
    })) || [];

    return {
      paymentTrends,
      dailyEarnings,
      monthlyRevenue,
      userGrowth
    };
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading">{formatNumber(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading">{stats.totalPayments.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Payment</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading">₹{stats.avgPayment.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading">{stats.activeUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue Growth</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                {analytics.paymentTrends.length >= 2
                  ? `${(((analytics.paymentTrends[analytics.paymentTrends.length - 1]?.amount || 0) - (analytics.paymentTrends[analytics.paymentTrends.length - 2]?.amount || 0)) / Math.max(analytics.paymentTrends[analytics.paymentTrends.length - 2]?.amount || 1, 1) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User Growth</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                {analytics.userGrowth.length >= 2
                  ? `${(((analytics.userGrowth[analytics.userGrowth.length - 1]?.count || 0) - (analytics.userGrowth[analytics.userGrowth.length - 2]?.count || 0)) / Math.max(analytics.userGrowth[analytics.userGrowth.length - 2]?.count || 1, 1) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total period</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ARPU</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                ₹{(stats.activeUsers > 0 ? stats.totalRevenue / stats.activeUsers : 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Revenue per user</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activity Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                {stats.activeUsers > 0 ? ((analytics.dailyEarnings.reduce((sum, day) => sum + day.amount, 0) / 7 / stats.activeUsers) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Daily active users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis Charts */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 font-heading">
          <Activity className="w-5 h-5" />
          Trend Analysis
        </h3>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend (Last 7 Days) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-heading">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Revenue Trend (Last 7 Days)
            </h4>
            {stats.revenueByDay && stats.revenueByDay.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenueByDay}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => value.toLocaleString()} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>No revenue data available for the last 7 days</p>
              </div>
            )}
          </div>

          {/* User Growth */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-heading">
              <Users className="w-4 h-4 text-blue-600" />
              User Growth Trend
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => value.toLocaleString()} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    formatter={(value: any) => [value.toLocaleString(), 'Users']}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#2563EB', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}