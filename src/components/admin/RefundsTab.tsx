'use client';

import { useState, useEffect } from 'react';
import RefundModal from './RefundModal';
import { AlertCircle, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

interface RefundRequest {
  _id: string;
  userEmail: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  refundAmount?: number;
  refundTransactionId?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  userId: { name: string; email: string };
  paymentId: { amount: number; plan: string; createdAt: string };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function RefundsTab() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'rejected'>('all');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRefunds = async (page = 1) => {
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const response = await fetch(`/api/admin/refunds?page=${page}&limit=10${statusParam}`);

      if (!response.ok) throw new Error('Failed to fetch refunds');

      const data = await response.json();
      setRefunds(data.refunds);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds(1);
  }, [filter]);

  const handleOpenModal = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setShowModal(true);
  };

  const handleProcessRefund = async (refundRequestId: string, percentage: number, notes: string) => {
    try {
      setProcessing(true);
      const response = await fetch('/api/admin/refunds/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundRequestId,
          refundPercentage: percentage,
          adminNotes: notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process refund');
      }

      const result = await response.json();
      setSuccessMessage(`✅ Refund processed successfully! Amount: ₹${result.refund.refundAmount}`);
      setShowModal(false);
      await fetchRefunds(pagination.page);

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('Error processing refund:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'approved':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Refund Requests</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Total: <span className="font-semibold">{pagination.total}</span> refund requests
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'completed', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {status === 'all' ? 'All Refunds' : status}
          </button>
        ))}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      {/* Refunds Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : refunds.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No refund requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Refund Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((refund) => (
                  <tr
                    key={refund._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{refund.userId.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{refund.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹{(refund.amount / 100).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-xs">
                        {refund.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(refund.status)}`}>
                        {getStatusIcon(refund.status)}
                        <span className="text-sm font-semibold capitalize">{refund.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {refund.refundAmount ? (
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ₹{(refund.refundAmount / 100).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {refund.status === 'pending' ? (
                        <button
                          onClick={() => handleOpenModal(refund)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          Review & Process
                        </button>
                      ) : refund.status === 'approved' ? (
                        <button
                          onClick={() => handleOpenModal(refund)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          Process Refund
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => fetchRefunds(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-400 font-semibold">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => fetchRefunds(Math.min(pagination.pages, pagination.page + 1))}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Refund Modal */}
      <RefundModal
        isOpen={showModal}
        refundRequest={selectedRefund}
        onClose={() => {
          setShowModal(false);
          setSelectedRefund(null);
        }}
        onProcessRefund={handleProcessRefund}
        isProcessing={processing}
      />
    </div>
  );
}
