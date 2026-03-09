"use client"

import Link from "next/link"
import { useState } from "react"
import { FiChevronDown } from "react-icons/fi"

export function ProductsDropdown({ onTrustInnClick }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTrustInnClick = (e) => {
    setIsOpen(false);
    if (onTrustInnClick) {
      onTrustInnClick(e);
    }
  };

  return (
    <div className="relative group">
      
      <button
        className="flex items-center gap-1 text-gray-700 font-bold hover:text-black transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
      >
        Products
        <FiChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <a
            href="#"
            onClick={handleTrustInnClick}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            TrustInn
          </a>
          <Link
            href="/verisol"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            VeriSol
          </Link>
        </div>
      )}
    </div>
  )
}
