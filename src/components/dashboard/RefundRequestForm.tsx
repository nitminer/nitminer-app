'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';

interface Payment {
  _id: string;
  planName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function RefundRequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchSuccessfulPayments();
  }, []);

  const fetchSuccessfulPayments = async () => {
    try {
      const response = await fetch('/api/user/payments?limit=100', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const successfulPayments = data.payments || [];
        setPayments(successfulPayments);
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to load your payments.',
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setMessage({
        type: 'error',
        text: 'Error loading payments. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!selectedPaymentId) {
      setMessage({
        type: 'error',
        text: 'Please select a payment.',
      });
      return;
    }

    if (!reason.trim()) {
      setMessage({
        type: 'error',
        text: 'Please provide a reason for the refund.',
      });
      return;
    }

    if (reason.length < 10) {
      setMessage({
        type: 'error',
        text: 'Reason must be at least 10 characters.',
      });
      return;
    }

    if (reason.length > 1000) {
      setMessage({
        type: 'error',
        text: 'Reason cannot exceed 1000 characters.',
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/refund/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentId: selectedPaymentId,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Refund request submitted successfully! We will review it shortly.',
        });

        // Reset form
        setSelectedPaymentId('');
        setReason('');

        // Call onSuccess callback if provided
        if (onSuccess) {
          setTimeout(onSuccess, 2000);
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to submit refund request.',
        });
      }
    } catch (error) {
      console.error('Error submitting refund request:', error);
      setMessage({
        type: 'error',
        text: 'Error submitting request. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-900 dark:text-white font-bold text-sm">Loading payments...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="bg-white dark:bg-zinc-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="flex items-center gap-3 mb-6">
          <Send className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Request a Refund
          </h3>
        </div>

        {message && (
          <div className={`mb-6 p-4 sm:p-5 rounded-xl flex gap-3 border ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm sm:text-base font-bold ${
              message.type === 'success'
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        {payments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 font-bold">
              No completed payments found. You need to have at least one successful payment to request a refund.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Payment Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Select Payment
              </label>
              <select
                value={selectedPaymentId}
                onChange={(e) => setSelectedPaymentId(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition"
              >
                <option value="">-- Select a payment --</option>
                {payments.map((payment) => (
                  <option key={payment._id} value={payment._id}>
                    {payment.planName} - ₹{(payment.amount / 100).toLocaleString()} (
                    {new Date(payment.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Reason for Refund
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you want to request a refund (minimum 10 characters)..."
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition resize-none"
              />
              <div className="mt-2 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                <span>Minimum 10 characters required</span>
                <span>{reason.length}/1000</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedPaymentId || reason.length < 10}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Refund Request</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              Our team will review your request and respond within 3-5 business days.
            </p>
          </form>
        )}
      </div>
    </>
  );
}
