'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, MessageSquare, X } from 'lucide-react';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planDuration: string;
  numberOfTools: number;
  estimatedPrice: number;
  onSuccess?: () => void;
}

export default function QuotationModal({
  isOpen,
  onClose,
  planName,
  planDuration,
  numberOfTools,
  estimatedPrice,
  onSuccess,
}: QuotationModalProps) {
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/quotation/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planName,
          planDuration,
          numberOfTools,
          estimatedPrice,
          additionalRequirements: additionalRequirements.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Quotation request submitted successfully! Our team will review and get back to you soon.',
        });
        setAdditionalRequirements('');

        // Close modal after success
        setTimeout(() => {
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to submit quotation request.',
        });
      }
    } catch (error) {
      console.error('Error submitting quotation:', error);
      setMessage({
        type: 'error',
        text: 'Error submitting request. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Request Quotation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {message && (
            <div
              className={`p-4 rounded-lg flex gap-3 border ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm font-bold ${
                  message.type === 'success'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Plan Details */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Plan
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {planName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {planDuration}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Tools Count
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {numberOfTools}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Estimated Price
              </p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                ₹{(estimatedPrice / 100).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Additional Requirements */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Additional Requirements (Optional)
            </label>
            <textarea
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              placeholder="Tell us about any specific customizations or features you need..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition resize-none"
            />
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-right">
              {additionalRequirements.length}/1000
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-900 dark:text-white font-bold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Request Quotation</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Our sales team will get back to you with a personalized quotation within 24 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
