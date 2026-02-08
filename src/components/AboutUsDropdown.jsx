"use client"

import Link from "next/link"
import { useState } from "react"
import { FiChevronDown } from "react-icons/fi"

export function AboutUsDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative group">
      
      <button
        className="flex items-center font-bold gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
      >
        About Us
        <FiChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 mt-0 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <Link
            href="/team"
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Our Team
          </Link>
          <Link
            href="/awards"
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Awards
          </Link>
          <Link
            href="/publications"
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Publications
          </Link>
          <hr className="my-2 border-gray-200 dark:border-gray-700" />
          <Link
            href="/downloads"
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition-colors font-bold text-blue-600 dark:text-blue-400"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            📥 Download App
          </Link>
        </div>
      )}
    </div>
  )
}
