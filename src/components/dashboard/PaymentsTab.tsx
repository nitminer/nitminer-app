'use client';

import { useState, useEffect } from 'react';
import { Download, DollarSign, CreditCard, Calendar, Receipt } from 'lucide-react';

interface Payment {
  _id: string;
  plan: string;
  amount: number;
  status: string;
  invoiceUrl?: string;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [userPaymentStats, setUserPaymentStats] = useState({
    totalSpent: 0,
    totalPayments: 0,
    currentPlan: 'Free',
    nextBilling: '',
    avgPayment: 0
  });

  useEffect(() => {
    fetchPayments();
  }, [page]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/user/payments?page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        const paymentsData = data.payments || [];

        setPayments(paymentsData);
        setPagination(data.pagination || { page: 1, limit: 10, total: paymentsData.length, pages: 1 });

        calculateUserPaymentStats(paymentsData);
      } else {
        console.error('Failed to fetch payments:', response.status);
        setPayments([]);
        setPagination(null);
        calculateUserPaymentStats([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
      setPagination(null);
      calculateUserPaymentStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateUserPaymentStats = (paymentsData: Payment[]) => {
    const totalSpent = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPayments = paymentsData.length;
    const avgPayment = totalPayments > 0 ? Math.round(totalSpent / totalPayments) : 0;

    const currentPlan = paymentsData.length > 0 ? paymentsData[0].plan : 'Free';

    const nextBilling = paymentsData.length > 0
      ? new Date(new Date(paymentsData[0].createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : '';

    setUserPaymentStats({
      totalSpent,
      totalPayments,
      currentPlan,
      nextBilling,
      avgPayment
    });
  };

  const downloadInvoice = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank');
  };

  if (loading) {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        `}</style>
        <div className="text-gray-900 dark:text-white font-bold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Loading payments...</div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <div className="space-y-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>My Payments</h2>
        </div>

        {/* Personal Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">Total Spent</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>₹{userPaymentStats.totalSpent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">Total Payments</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{userPaymentStats.totalPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">Current Plan</p>
                <p className="text-lg font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{userPaymentStats.currentPlan}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-bold">Next Billing</p>
                <p className="text-lg font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {userPaymentStats.nextBilling ? new Date(userPaymentStats.nextBilling).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Payment History
            </h3>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 font-bold">No payments yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                    <tr>
                      <th className="px-6 py-4 font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Plan</th>
                      <th className="px-6 py-4 font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Amount</th>
                      <th className="px-6 py-4 font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Status</th>
                      <th className="px-6 py-4 font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Date</th>
                      <th className="px-6 py-4 font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id} className="border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition">
                        <td className="px-6 py-4 font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{payment.plan}</td>
                        <td className="px-6 py-4 font-bold">₹{payment.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-black ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">{new Date(payment.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          {payment.invoiceUrl ? (
                            <button
                              onClick={() => downloadInvoice(payment.invoiceUrl!)}
                              className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition text-sm font-black shadow-lg"
                              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-500 font-medium">N/A</span>
                          )}
                        </td>
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