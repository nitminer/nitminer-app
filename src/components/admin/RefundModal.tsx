'use client';

import { useState } from 'react';
import { X, DollarSign, Percent, CheckCircle } from 'lucide-react';

interface RefundModalProps {
  isOpen: boolean;
  refundRequest: {
    _id: string;
    userEmail: string;
    amount: number; // in paise
    reason: string;
    userId: { name: string; email: string };
  } | null;
  onClose: () => void;
  onProcessRefund: (refundRequestId: string, percentage: number, notes: string) => void;
  isProcessing: boolean;
}

const REFUND_PERCENTAGES = [10, 25, 50, 75, 90, 100];

export default function RefundModal({ isOpen, refundRequest, onClose, onProcessRefund, isProcessing }: RefundModalProps) {
  const [selectedPercentage, setSelectedPercentage] = useState(100);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !refundRequest) return null;

  const originalAmount = refundRequest.amount / 100; // Convert from paise to rupees
  const refundAmount = (originalAmount * selectedPercentage) / 100;
  const remainingAmount = originalAmount - refundAmount;

  const handleProcessRefund = async () => {
    setIsSubmitting(true);
    try {
      await onProcessRefund(refundRequest._id, selectedPercentage, adminNotes);
      // Don't close modal here - let parent component handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Process Refund</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {refundRequest.userId.name} ({refundRequest.userId.email})
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Refund Request Details */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Refund Request Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Request ID:</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">{refundRequest._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Original Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{originalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reason:</span>
                  <span className="text-gray-900 dark:text-white max-w-xs text-right">{refundRequest.reason}</span>
                </div>
              </div>
            </div>

            {/* Refund Percentage Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Percent className="w-4 h-4 mr-2" />
                Refund Percentage
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {REFUND_PERCENTAGES.map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => setSelectedPercentage(percentage)}
                    disabled={isSubmitting}
                    className={`py-2 px-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                      selectedPercentage === percentage
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {percentage}%
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Percentage Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Or Enter Custom Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={selectedPercentage}
                  onChange={(e) => setSelectedPercentage(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
                <span className="absolute right-3 top-2.5 text-gray-500">%</span>
              </div>
            </div>

            {/* Refund Calculation Display */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-5 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Refund Calculation
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Original Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{originalAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Refund Percentage:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedPercentage}%</span>
                </div>

                <div className="border-t border-green-200 dark:border-green-800 my-2" />

                <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <span className="text-gray-900 dark:text-white font-semibold">Amount to Refund:</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">₹{refundAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Remaining Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{remainingAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                disabled={isSubmitting}
                placeholder="Add any notes about this refund..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ Important:</strong> This will immediately process a refund of <strong>₹{refundAmount.toFixed(2)}</strong> 
                ({selectedPercentage}%) using real Razorpay credentials. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessRefund}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Process Refund ₹{refundAmount.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
