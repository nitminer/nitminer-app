'use client';

import { useEffect, useState } from 'react';
import { File, Download, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Quotation {
  _id: string;
  planName: string;
  planDuration: string;
  numberOfTools: number;
  estimatedPrice: number;
  additionalRequirements: string;
  status: 'pending' | 'quotation_sent' | 'accepted' | 'rejected';
  quotationPdfUrl?: string;
  quotationFileName?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchQuotations();
  }, [filterStatus]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      console.log('[MyQuotations] Fetching quotations...');
      const response = await fetch('/api/quotation/my-quotations', {
        method: 'GET',
        credentials: 'include',
      });

      console.log('[MyQuotations] API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[MyQuotations] API Response data:', data);
        let quotations = data.data || [];
        console.log('[MyQuotations] Quotations count:', quotations.length);

        // Filter by status if needed
        if (filterStatus !== 'all') {
          quotations = quotations.filter(
            (q: Quotation) => q.status === filterStatus
          );
        }

        console.log('[MyQuotations] Filtered quotations count:', quotations.length);
        setQuotations(quotations);
      } else {
        const errorData = await response.json();
        console.error('[MyQuotations] API Error:', response.status, errorData);
      }
    } catch (error) {
      console.error('[MyQuotations] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700',
      quotation_sent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
      accepted: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700',
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      quotation_sent: <File className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
    };

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
          styles[status as keyof typeof styles]
        }`}
      >
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Quotation Requests
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View and download your quotation requests
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'quotation_sent', 'accepted', 'rejected'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-bold transition text-sm ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          )
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-900 dark:text-white font-bold">
              Loading quotations...
            </span>
          </div>
        </div>
      ) : quotations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800 rounded-xl">
          <File className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-bold">
            No quotation requests found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Request a quotation from the pricing page to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotations.map((quotation) => (
            <div
              key={quotation._id}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:scale-105 flex flex-col h-full"
            >
              {/* Plan Name - Header */}
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white capitalize">
                    {quotation.planName}
                  </h3>
                  {getStatusBadge(quotation.status)}
                </div>
              </div>

              {/* Plan Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-lg p-3">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1">
                    Duration
                  </p>
                  <p className="text-lg font-black text-gray-900 dark:text-white">
                    {quotation.planDuration}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-700/50 rounded-lg p-3">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1">
                    Tools
                  </p>
                  <p className="text-lg font-black text-gray-900 dark:text-white">
                    {quotation.numberOfTools}
                  </p>
                </div>
              </div>

              {/* Estimated Price - Highlighted */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700/50 rounded-lg p-4 mb-4">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
                  Estimated Price
                </p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-300">
                  ₹{(quotation.estimatedPrice / 100).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Requirements */}
              {quotation.additionalRequirements && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-2">
                    Your Requirements
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic px-3 py-2 bg-gray-50 dark:bg-zinc-700/50 rounded-lg border-l-2 border-blue-400">
                    &quot;{quotation.additionalRequirements}&quot;
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {quotation.adminNotes && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-2">
                    💬 Admin Notes
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    {quotation.adminNotes}
                  </p>
                </div>
              )}

              {/* PDF Download Section */}
              {quotation.quotationPdfUrl && (
                <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-lg p-4">
                  <p className="text-sm font-bold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                    <span className="text-lg">✓</span> Quotation Sent
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mb-3 truncate">
                    {quotation.quotationFileName || 'quotation.pdf'}
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={quotation.quotationPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </a>
                    <a
                      href={quotation.quotationPdfUrl}
                      download
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-2 hover:shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              )}

              {/* Requested Date - Footer */}
              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-zinc-700">
                <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                  📅 Requested on{' '}
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {new Date(quotation.createdAt).toLocaleDateString()}
                  </span>
                  {' '}at{' '}
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {new Date(quotation.createdAt).toLocaleTimeString()}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
