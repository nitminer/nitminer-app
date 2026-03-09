'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import VeriSolComponent from '@/components/VeriSolComponent';

export default function VeriSolPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login message
  if (status === 'unauthenticated') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <style>{`
          header {
            display: none !important;
          }
        `}</style>
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">Please log in to access the VeriSol tool</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // If authenticated, show VeriSol component
  return (
    <>
      <style>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
        }
        header {
          display: none !important;
        }
        footer {
          display: none !important;
        }
        main {
          padding: 0 !important;
          flex-grow: 0 !important;
          height: 100vh !important;
        }
        .flex.flex-col.min-h-screen {
          height: 100vh !important;
          flex-direction: row !important;
        }
      `}</style>
      <VeriSolComponent />
    </>
  );
}
