"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export function ProductsDropdown({ onTrustInnClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const handleTrustInnClick = (event) => {
    setIsOpen(false);
    onTrustInnClick?.(event);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative group"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-2 transition hover:text-purple-300"
      >
        <span>Products</span>
        <FiChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul className="absolute left-0 top-full z-50 mt-2 w-44 rounded bg-gray-800 py-2 shadow-lg">
          <li>
            <button
              type="button"
              onClick={handleTrustInnClick}
              className="block w-full border-b border-gray-700 px-4 py-2 pb-2 text-left transition hover:text-purple-300"
            >
              TrustInn
            </button>
          </li>
          <li>
            <Link
              href="/verisol"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 transition hover:text-purple-300"
            >
              VeriSol
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
