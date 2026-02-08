'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface RefundRequest {
  _id: string;
  paymentId: {
    plan: string;
    amount: number;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

const statusConfig = {
  pending: {
    color: 'yellow',
    icon: Clock,
    label: 'Pending',
    bgLight: 'bg-yellow-50 dark:bg-yellow-900/20',
    bgDark: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-700',
  },
  approved: {
    color: 'green',
    icon: CheckCircle,
    label: 'Approved',
    bgLight: 'bg-green-50 dark:bg-green-900/20',
    bgDark: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-700',
  },
  rejected: {
    color: 'red',
    icon: XCircle,
    label: 'Rejected',
    bgLight: 'bg-red-50 dark:bg-red-900/20',
    bgDark: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-700',
  },
  completed: {
    color: 'blue',
    icon: CheckCircle,
    label: 'Completed',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    bgDark: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-700',
  },
};

export default function RefundRequestList() {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchRefundRequests();
  }, [page, filterStatus]);

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (filterStatus) {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/refund/requests?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setRefundRequests(data.refundRequests || []);
        setPagination(data.pagination || null);
      } else if (response.status === 401) {
        console.warn('Unauthorized - token may have expired. Please refresh the page.');
        setRefundRequests([]);
      } else {
        console.error('Failed to fetch refund requests:', response.status);
        setRefundRequests([]);
      }
    } catch (error) {
      console.error('Error fetching refund requests:', error);
      setRefundRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-900 dark:text-white font-bold text-sm">Loading refund requests...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="space-y-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'approved', 'rejected', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-600'
              }`}
            >
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {refundRequests.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-xl sm:rounded-2xl shadow-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-bold text-base">
              {filterStatus ? 'No refund requests found with this status.' : 'No refund requests yet.'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Submit a refund request above to see them here.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {refundRequests.map((request) => {
                const config = getStatusConfig(request.status);
                const IconComponent = config.icon;

                return (
                  <div
                    key={request._id}
                    className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-white dark:bg-zinc-800 ${config.border}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Left Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className={`${config.bgDark} p-2.5 rounded-lg mt-1 flex-shrink-0`}>
                            <IconComponent className={`w-5 h-5 ${config.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                              {request.paymentId?.plan || 'Payment'} Refund
                            </h4>
                            <p className={`text-sm font-bold ${config.text}`}>
                              {config.label}
                            </p>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-200 dark:border-zinc-700">
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mb-1">
                              Amount
                            </p>
                            <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                              ₹{request.paymentId?.amount || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mb-1">
                              Requested
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatDate(request.createdAt)}
                            </p>
                          </div>
                          {request.refundAmount && (
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mb-1">
                                Refund Amount
                              </p>
                              <p className="text-base font-black text-green-600 dark:text-green-400">
                                ₹{request.refundAmount}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Reason */}
                        {request.reason && (
                          <div className="pt-4 border-t border-gray-200 dark:border-zinc-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mb-2">
                              Reason
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {request.reason}
                            </p>
                          </div>
                        )}

                        {/* Admin Notes */}
                        {request.adminNotes && (
                          <div className={`p-4 rounded-lg border ${config.bgLight} ${config.border} mt-4`}>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold mb-1">
                              Admin Notes
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {request.adminNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6 border-t border-gray-200 dark:border-zinc-700">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-zinc-600 transition font-bold text-sm"
                >
                  Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300 font-bold">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-zinc-600 transition font-bold text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
