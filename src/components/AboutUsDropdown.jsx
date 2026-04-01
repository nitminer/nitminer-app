"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export function AboutUsDropdown() {
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

  return (
    <div ref={dropdownRef} className="relative group">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-2 transition hover:text-purple-300"
      >
        <span>About Us</span>
        <FiChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul className="absolute left-0 top-full z-50 mt-2 w-44 rounded bg-gray-800 py-2 shadow-lg">
          <li>
            <Link
              href="/team"
              onClick={() => setIsOpen(false)}
              className="block border-b border-gray-700 px-4 py-2 pb-2 transition hover:text-purple-300"
            >
              Our Team
            </Link>
          </li>
          <li>
            <Link
              href="/awards"
              onClick={() => setIsOpen(false)}
              className="block border-b border-gray-700 px-4 py-2 pb-2 transition hover:text-purple-300"
            >
              Awards
            </Link>
          </li>
          <li>
            <Link
              href="/publications"
              onClick={() => setIsOpen(false)}
              className="block border-b border-gray-700 px-4 py-2 pb-2 transition hover:text-purple-300"
            >
              Publications
            </Link>
          </li>
          <li>
            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 transition hover:text-purple-300"
            >
              Pricing
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
