'use client';

import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import Link from 'next/link';

export default function LoginTypeSelector() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      
      
      <div className="relative" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-green-500  bg-white dark:bg-zinc-800 rounded-xl text-gray-900 dark:text-white font-bold hover:shadow-lg transition-all"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <span className="text-sm">Login As</span>
          <FiChevronDown
            size={18}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full mt-3 right-0 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl z-50 min-w-64 overflow-hidden">
            {/* User Login Option */}
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 w-full px-6 py-4 text-left text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
            >
              <div className="flex-shrink-0 w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-black text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>User Login</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Access your account</p>
              </div>
            </Link>


            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 w-full px-6 py-4 text-left text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
            >
              <div className="flex-shrink-0 w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-black text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Admin Login</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Access your account</p>
              </div>
            </Link>


          </div>
        )}

        {/* Close on outside click */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </>
  );
}