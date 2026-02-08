'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { toast } from '@/lib/toast';

interface Payment {
  _id: string;
  userEmail: string;
  amount: number;
  paymentMethod: 'razorpay' | 'card' | 'upi';
  planName: string;
  planDuration: string;
  status: 'success' | 'pending' | 'failed';
  createdAt: string;
  completedAt?: string;
}

const REFUND_PERCENTAGES = [10, 20, 30, 50, 100];

export default function RefundManagement() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedRefundPercentage, setSelectedRefundPercentage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refundReason, setRefundReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/payments/my-payments?status=success', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }

        const data = await response.json();
        setPayments(data.data || []);
        setFilteredPayments(data.data || []);
        console.log('✅ Loaded user payments:', data.data);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email) {
      fetchPayments();
    }
  }, [session?.user?.email]);

  const handleSelectPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setSelectedRefundPercentage(null);
    setRefundReason('');
  };

  const calculateRefundAmount = (refundPercentage: number): number => {
    if (!selectedPayment) return 0;
    return Math.round((selectedPayment.amount * refundPercentage) / 100);
  };

  const handleProcessRefund = async (percentage: number) => {
    if (!selectedPayment) {
      toast.error('No payment selected');
      return;
    }

    setProcessingRefund(true);
    try {
      const refundAmount = calculateRefundAmount(percentage);

      const response = await fetch('/api/refund-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentId: selectedPayment._id,
          amount: refundAmount,
          reason: refundReason || `${percentage}% refund processed by admin`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process refund');
      }

      toast.success(`₹${refundAmount.toLocaleString()} refund request created!`);
      setSelectedPayment(null);
      setSelectedRefundPercentage(null);
      setRefundReason('');
    } catch (error) {
      console.error('Refund error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process refund');
    } finally {
      setProcessingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Refund Management</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Process refunds for user payments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payments List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Payment Method Filter */}
            <div className="flex gap-2">
              <FiFilter className="text-gray-400 mt-2" />
              <div className="flex flex-wrap gap-2">
                {(['all', 'card', 'upi', 'razorpay'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethodFilter(method)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      paymentMethodFilter === method
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {method === 'all' ? 'All Methods' : method.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payments List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading payments...
              </div>
            ) : filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <button
                  key={payment._id}
                  onClick={() => handleSelectPayment(payment)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedPayment?._id === payment._id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        ₹{(payment.amount / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{payment.userEmail}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                          {payment.paymentMethod.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs font-medium text-green-700 dark:text-green-400">
                          {payment.planName} - {payment.planDuration.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No payments found
              </div>
            )}
          </div>
        </div>

        {/* Refund Options Panel */}
        <div className="lg:col-span-1">
          {selectedPayment ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Refund Options</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedPayment.userEmail}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₹{(selectedPayment.amount / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Method:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedPayment.paymentMethod.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedPayment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Refund Percentage Options */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Refund %:</p>
                <div className="space-y-2">
                  {REFUND_PERCENTAGES.map((percentage) => (
                    <button
                      key={percentage}
                      onClick={() => setSelectedRefundPercentage(percentage)}
                      disabled={processingRefund}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedRefundPercentage === percentage
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${processingRefund ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {percentage}%
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{(calculateRefundAmount(percentage) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason (Optional):
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter refund reason..."
                  rows={3}
                  disabled={processingRefund}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Process Button */}
              <button
                onClick={() => selectedRefundPercentage && handleProcessRefund(selectedRefundPercentage)}
                disabled={!selectedRefundPercentage || processingRefund}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {processingRefund ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-center justify-center h-full">
              <p className="text-center text-gray-500 dark:text-gray-400">
                Select a payment to process refund
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
