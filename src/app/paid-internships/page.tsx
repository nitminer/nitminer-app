'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FiCode, FiZap, FiCheckCircle, FiArrowRight, FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function PaidInternshipsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [visibleSections, setVisibleSections] = useState<{ [key: string]: boolean }>({});

  // Setup Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }));
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    });

    // Observe all animate sections
    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const domains = [
    {
      title: 'AI + Software Testing',
      description: 'Master artificial intelligence fundamentals and software testing methodologies.',
      icon: FiCode,
      color: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'Machine Learning',
      description: 'Deep dive into machine learning algorithms and practical implementations.',
      icon: FiZap,
      color: 'from-green-600 to-emerald-600',
    },
  ];

  const programDetails = [
    { field: 'Duration', value: '2 Months' },
    { field: 'Start Date', value: '1 May 2026' },
    { field: 'End Date', value: '30 June 2026' },
    { field: 'Mode', value: 'Hybrid' },
    { field: 'Daily Hours', value: '4 Hours' },
    { field: 'Accommodation', value: 'Not Provided' },
    { field: 'Certification', value: 'Yes' },
  ];

  const handleEnroll = async (isDemo = false) => {
    if (status === 'unauthenticated') {
      toast.error('Please login to enroll in the internship', {
        position: 'top-right',
        autoClose: 5000,
      });
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const amount = isDemo ? 500 : 50000; // ₹5 or ₹500 in paise

      console.log(`Creating ${isDemo ? 'demo' : 'internship'} order for ₹${amount / 100}`);

      // Create order
      const response = await fetch('/api/internship/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          isDemo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const data = await response.json();

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: 'NITMiner Technologies',
          description: isDemo ? 'Demo Internship Payment' : 'AI + ML Internship Program',
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/internship/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (!verifyResponse.ok) {
                throw new Error('Payment verification failed');
              }

              const verifyData = await verifyResponse.json();

              toast.success('Payment successful! Redirecting...', {
                position: 'top-right',
                autoClose: 3000,
              });

              // Redirect to success page
              setTimeout(() => {
                router.push('/internship-success');
              }, 2000);
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed. Please contact support.', {
                position: 'top-right',
                autoClose: 5000,
              });
            }
          },
          prefill: {
            name: session?.user?.name,
            email: session?.user?.email,
          },
          theme: {
            color: '#2563eb',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process enrollment', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          [data-animate].visible {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          [data-animate].visible [data-animate-card] {
            animation: fadeInScale 0.5s ease-out forwards;
          }
          
          [data-animate-card] {
            opacity: 0;
          }
          
          [data-animate-card]:nth-child(1) { animation-delay: 0.1s; }
          [data-animate-card]:nth-child(2) { animation-delay: 0.2s; }
          [data-animate-card]:nth-child(3) { animation-delay: 0.3s; }
        `}</style>
        {/* Top Header Banner */}
        <section id="banner" data-animate className={`px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 md:py-16 transition-all duration-700 ${visibleSections['banner'] ? 'visible opacity-100' : 'opacity-0'}`}>
          <div className="max-w-4xl mx-auto text-center">
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Want to Internship in NITMiner Technologies Pvt Ltd
            </h2>
            <p className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
              Promoted by NIT Warangal & IIT Bhilai
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
        
            </h1>
            <div className="border-t-2 border-gray-300 mb-4"></div>
          </div>
        </section>

        {/* Offering Domains */}
        <section id="domains" data-animate className={`px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 transition-all duration-700 ${visibleSections['domains'] ? 'visible' : ''}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-8 sm:mb-12">
              Offering Domains
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {domains.map((domain, index) => {
                const IconComponent = domain.icon;
                return (
                  <div
                    key={index}
                    data-animate-card
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r ${domain.color} rounded-full flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                      {domain.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                      {domain.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        <span>Duration: 2 Months</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <FiClock className="w-4 h-4" />
                        <span>Mode: Hybrid</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <FiClock className="w-4 h-4" />
                        <span>Daily Time: 4 Hours</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <FiMapPin className="w-4 h-4" />
                        <span>Accommodation: Not Provided</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Program Details */}
        <section id="details" data-animate className={`px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 bg-gray-50 dark:bg-gray-900 transition-all duration-700 ${visibleSections['details'] ? 'visible opacity-100' : 'opacity-0'}`}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-8 sm:mb-12">
              Program Details
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {programDetails.map((detail, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <span className="font-semibold text-gray-900 dark:text-white">{detail.field}:</span>
                    <span className="text-gray-600 dark:text-gray-400">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" data-animate className={`px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 transition-all duration-700 ${visibleSections['pricing'] ? 'visible opacity-100' : 'opacity-0'}`}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 sm:mb-12">
              Limited Time Offer
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
              <div className="mb-6">
                <span className="text-2xl sm:text-3xl line-through text-gray-500 mr-4">₹10,000</span>
                <span className="text-3xl sm:text-4xl font-bold text-green-600">₹5,000</span>
                <span className="ml-2 px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full text-sm font-bold">
                  50% OFF
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Enroll Button */}
        <section id="cta" data-animate className={`px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 transition-all duration-700 ${visibleSections['cta'] ? 'visible opacity-100' : 'opacity-0'}`}>
          <div className="max-w-4xl mx-auto text-center">
            <button
              onClick={() => handleEnroll(false)}
              disabled={loading}
              className="px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg sm:text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  Enroll Now - ₹5,000
                  <FiArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </>
              )}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Secure payment powered by Razorpay
            </p>
          </div>
        </section>
      </main>

    </>
  );
}
