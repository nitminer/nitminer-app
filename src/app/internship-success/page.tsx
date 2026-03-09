'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FiCheckCircle, FiDownload, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function InternshipSuccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [internshipData, setInternshipData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInternshipData();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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
    } else {
      toast.error('Receipt not available yet. Please try again later.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
        <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <FiCheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 dark:text-green-400" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6">
              🎉 Payment Successful
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">
              Welcome to NITMiner Technologies Internship
            </h2>

            {/* Internship Details */}
            {internshipData && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8 sm:mb-12">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {internshipData.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₹{internshipData.amountPaid / 100}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment ID:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{internshipData.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {new Date(internshipData.startDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {new Date(internshipData.endDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <button
                onClick={handleDownloadReceipt}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FiDownload className="w-5 h-5" />
                Download Receipt
              </button>
              <button
                onClick={handleGoToDashboard}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <FiArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 sm:mt-12 text-center">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                Check your email for payment confirmation and next steps.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Your internship journey begins soon! Stay tuned for updates.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}