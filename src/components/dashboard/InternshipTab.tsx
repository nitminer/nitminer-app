'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiExternalLink, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';

interface InternshipData {
  title: string;
  amountPaid: number;
  paymentId: string;
  paymentStatus: string;
  receiptUrl: string;
  startDate: string;
  endDate: string;
  googleFormFilled: boolean;
}

export default function InternshipTab() {
  const [internshipData, setInternshipData] = useState<InternshipData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternshipData();
  }, []);

  const fetchInternshipData = async () => {
    try {
      const response = await fetch('/api/internship/user');
      if (response.ok) {
        const data = await response.json();
        if (data.hasInternship) {
          setInternshipData(data.internship);
        }
      }
    } catch (error) {
      console.error('Error fetching internship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (internshipData?.receiptUrl) {
      window.open(internshipData.receiptUrl, '_blank');
    }
  };

  const handleGoogleForm = () => {
    // Replace with actual Google Form link
    const googleFormUrl = 'https://forms.google.com/your-internship-form';
    window.open(googleFormUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!internshipData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Internship Enrollment
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't enrolled in any internship program yet.
          </p>
          <a
            href="/paid-internships"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Browse Internships
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Internship Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiCheckCircle className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {internshipData.title}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Details */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{internshipData.amountPaid / 100}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Payment ID:</span>
                <span className="font-medium text-gray-900 dark:text-white">{internshipData.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`font-medium ${internshipData.paymentStatus === 'Success' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {internshipData.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Program Details */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Program Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(internshipData.startDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(internshipData.endDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-medium text-gray-900 dark:text-white">2 Months</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <FiDownload size={16} />
            Download Receipt
          </button>

          <button
            onClick={handleGoogleForm}
            className={`flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
              internshipData.googleFormFilled
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
          >
            <FiExternalLink size={16} />
            {internshipData.googleFormFilled ? 'Google Form Submitted' : 'Fill Google Form'}
          </button>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <FiClock className="w-5 h-5" />
          Next Steps
        </h4>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <FiCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Complete the onboarding Google Form</span>
          </li>
          <li className="flex items-start gap-2">
            <FiClock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Wait for internship start date: {new Date(internshipData.startDate).toLocaleDateString('en-IN')}</span>
          </li>
          <li className="flex items-start gap-2">
            <FiClock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Receive welcome email and further instructions</span>
          </li>
        </ul>
      </div>
    </div>
  );
}