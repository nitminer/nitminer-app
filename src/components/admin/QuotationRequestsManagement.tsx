'use client';

import { useState, useEffect } from 'react';
import { File, Upload, AlertCircle, CheckCircle, Download, Eye } from 'lucide-react';

interface Quotation {
  _id: string;
  userEmail: string;
  customerName: string;
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

export default function QuotationRequestsManagement() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchQuotations();
  }, [filterStatus]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'all'
        ? '/api/admin/quotations'
        : `/api/admin/quotations?status=${filterStatus}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setQuotations(data.data || []);
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to load quotation requests',
        });
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setMessage({
        type: 'error',
        text: 'Error loading quotation requests',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setAdminNotes(quotation.adminNotes || '');
    setUploadFile(null);
    setShowUploadModal(true);
  };

  const handleUploadPDF = async () => {
    if (!uploadFile || !selectedQuotation) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      // For demo purposes, use a public URL
      // In production, upload to Cloudinary or similar
      console.log('Starting Cloudinary upload for file:', uploadFile.name);
      const fileUrl = await uploadToCloudinary(uploadFile);
      console.log('Cloudinary upload successful, URL:', fileUrl);

      if (!fileUrl) {
        throw new Error('No URL returned from Cloudinary upload');
      }

      console.log('Sending POST request to API with:', {
        quotationId: selectedQuotation._id,
        pdfUrl: fileUrl,
        fileName: uploadFile.name,
        adminNotes: adminNotes.trim(),
      });

      const response = await fetch('/api/admin/quotations/' + selectedQuotation._id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          quotationId: selectedQuotation._id,
          pdfUrl: fileUrl,
          fileName: uploadFile.name,
          adminNotes: adminNotes.trim(),
        }),
      });

      const data = await response.json();
      console.log('API response:', { status: response.status, data });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Quotation PDF uploaded successfully',
        });

        // Refresh quotations
        setTimeout(() => {
          fetchQuotations();
          setShowUploadModal(false);
          setSelectedQuotation(null);
          setUploadFile(null);
          setAdminNotes('');
        }, 1500);
      } else {
        let errorText = data.error || 'Failed to upload quotation';
        if (data.details) {
          errorText += ` - ${data.details}`;
        }
        if (data.missing) {
          errorText += ` - Missing: ${Object.entries(data.missing).filter(([, v]) => v).map(([k]) => k).join(', ')}`;
        }
        setMessage({
          type: 'error',
          text: errorText,
        });
      }
    } catch (error) {
      console.error('Error uploading quotation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error uploading quotation PDF';
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!file) {
      throw new Error('No file provided');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    console.log('Cloudinary config:', { uploadPreset, cloudName });
    
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }
    
    if (!uploadPreset) {
      throw new Error('Cloudinary upload preset not configured');
    }
    
    formData.append('upload_preset', uploadPreset);

    try {
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
      console.log('Uploading to:', url, 'with preset:', uploadPreset);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      console.log('Cloudinary response status:', response.status);
      
      const data = await response.json();
      console.log('Cloudinary response data:', data);
      
      if (!response.ok) {
        const errorMsg = data.error?.message || data.error || response.statusText;
        throw new Error(`Cloudinary upload failed: ${errorMsg}`);
      }
      
      if (!data.secure_url) {
        console.error('Cloudinary response missing secure_url:', data);
        throw new Error('Cloudinary did not return a file URL');
      }
      
      console.log('Cloudinary upload successful:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Cloudinary upload error:', errorMsg);
      throw new Error(`Failed to upload PDF: ${errorMsg}`);
    }
  };

  const handleStatusChange = async (
    quotationId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch('/api/admin/quotations/' + quotationId, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          quotationId,
          status: newStatus,
          adminNotes,
        }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Quotation status updated',
        });
        fetchQuotations();
      } else {
        setMessage({ type: 'error', text: 'Failed to update status' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ type: 'error', text: 'Error updating status' });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700',
      quotation_sent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
      accepted: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quotation Requests
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer quotation requests and send personalized offers
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'quotation_sent', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Message */}
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

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-900 dark:text-white font-bold">
              Loading quotation requests...
            </span>
          </div>
        </div>
      ) : quotations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800 rounded-xl">
          <File className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-bold">
            No quotation requests found
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {quotations.map((quotation) => (
            <div
              key={quotation._id}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 hover:shadow-lg transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Customer & Plan Info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {quotation.customerName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {quotation.userEmail}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Plan
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {quotation.planName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Duration
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {quotation.planDuration}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Tools
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {quotation.numberOfTools}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </p>
                      <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                        ₹{(quotation.estimatedPrice / 100).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {quotation.additionalRequirements && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Requirements
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                        &quot;{quotation.additionalRequirements}&quot;
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Status
                    </p>
                    {getStatusBadge(quotation.status)}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Submitted:{' '}
                    {new Date(quotation.createdAt).toLocaleDateString()} at{' '}
                    {new Date(quotation.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* Right: Actions & PDF */}
                <div className="space-y-4 flex flex-col">
                  {/* PDF Section */}
                  {quotation.quotationPdfUrl ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <File className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <p className="text-sm font-bold text-green-700 dark:text-green-300">
                          Quotation Sent
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        File: {quotation.quotationFileName}
                      </p>
                      <div className="flex gap-2">
                        <a
                          href={quotation.quotationPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </a>
                        <a
                          href={quotation.quotationPdfUrl}
                          download
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300 mb-3">
                        No quotation sent yet
                      </p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {quotation.adminNotes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">
                        Admin Notes
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {quotation.adminNotes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-auto space-y-2">
                    {!quotation.quotationPdfUrl && quotation.status === 'pending' && (
                      <button
                        onClick={() => handleUploadClick(quotation)}
                        className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Quotation PDF
                      </button>
                    )}

                    {quotation.status === 'quotation_sent' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(quotation._id, 'accepted')
                          }
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(quotation._id, 'rejected')
                          }
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 dark:border-zinc-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Upload Quotation PDF
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                For: {selectedQuotation.customerName}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Select PDF File
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-600 dark:hover:border-blue-400 transition">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="pdf-input"
                  />
                  <label htmlFor="pdf-input" className="cursor-pointer block">
                    <File className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {uploadFile ? uploadFile.name : 'Click to upload PDF'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      or drag and drop
                    </p>
                  </label>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes for internal reference..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 resize-none"
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 text-right mt-1">
                  {adminNotes.length}/500
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-900 dark:text-white font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadPDF}
                  disabled={!uploadFile || uploading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
