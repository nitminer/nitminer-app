'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiEye } from 'react-icons/fi';
import { toast } from '@/lib/toast';

interface Refund {
  _id: string;
  userId: string;
  userEmail: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: string;
  adminNotes: string;
  refundAmount: number;
  refundTransactionId: string;
  attachments: any[];
  createdAt: string;
  updatedAt: string;
}

export default function CompletedRefundsTab({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [filteredRefunds, setFilteredRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Fetch completed refunds
  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/refund-requests?role=admin&page=${page}&limit=${pageSize}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch refunds');
        }

        const data = await response.json();
        
        // Filter only completed refunds
        const completedRefunds = (data.data || []).filter(
          (refund: any) => refund.status === 'completed'
        );
        
        setRefunds(completedRefunds);
        setFilteredRefunds(completedRefunds);
        setTotalPages(Math.ceil((data.total || 0) / pageSize));
        
        console.log('✅ Loaded completed refunds:', completedRefunds);
      } catch (error) {
        console.error('Error fetching refunds:', error);
        toast.error('Failed to load refunds');
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, [page, pageSize, refreshTrigger]);

  // Handle search
  useEffect(() => {
    const filtered = refunds.filter(
      (refund) =>
        refund.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refund.refundTransactionId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRefunds(filtered);
  }, [searchTerm, refunds]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const downloadRefundData = () => {
    const csv = [
      ['ID', 'User Email', 'Payment ID', 'Original Amount', 'Refund Amount', 'Reason', 'Status', 'Transaction ID', 'Admin Notes', 'Created At'],
      ...filteredRefunds.map((refund) => [
        refund._id,
        refund.userEmail,
        refund.paymentId,
        refund.amount,
        refund.refundAmount,
        refund.reason,
        refund.status,
        refund.refundTransactionId,
        refund.adminNotes,
        formatDate(refund.createdAt),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `completed-refunds-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading refunds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Completed Refunds</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {filteredRefunds.length} refund{filteredRefunds.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={downloadRefundData}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
        >
          <FiDownload size={18} />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by email, ID, or transaction ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        {filteredRefunds.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No completed refunds found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Original Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Refund Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Reason</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Transaction ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Processed</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredRefunds.map((refund) => (
                <tr
                  key={refund._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium truncate max-w-xs">
                    {refund.userEmail}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    ₹{refund.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-semibold">
                      ₹{refund.refundAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                    {refund.reason}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono text-xs">
                    {refund.refundTransactionId}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs">
                    {formatDate(refund.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedRefund(refund);
                        setShowDetails(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition text-xs"
                    >
                      <FiEye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Refund Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">User Email</p>
                  <p className="text-gray-900 dark:text-white">{selectedRefund.userEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">User ID</p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedRefund.userId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Payment ID</p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedRefund.paymentId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Original Amount</p>
                  <p className="text-gray-900 dark:text-white">₹{selectedRefund.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Refund Amount</p>
                  <p className="text-green-600 dark:text-green-400 font-bold">₹{selectedRefund.refundAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Transaction ID</p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedRefund.refundTransactionId}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Reason</p>
                  <p className="text-gray-900 dark:text-white">{selectedRefund.reason}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Admin Notes</p>
                  <p className="text-gray-900 dark:text-white">{selectedRefund.adminNotes || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Status</p>
                  <p className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-semibold">
                    {selectedRefund.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Processed Date</p>
                  <p className="text-gray-900 dark:text-white text-sm">{formatDate(selectedRefund.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
