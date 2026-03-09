'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-14 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center w-14 h-8 rounded-full transition-colors duration-300 bg-gray-300 dark:bg-indigo-600 hover:shadow-[0_0_16px_rgba(99,102,241,.3)] dark:hover:shadow-[0_0_16px_rgba(99,102,241,.4)]"
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label="Toggle theme"
    >
      {/* Toggle circle */}
      <span
        className={`absolute w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 ${
          isDark ? 'translate-x-7' : 'translate-x-1'
        }`}
      >
        {isDark ? (
          <FiMoon size={14} className="text-indigo-600" />
        ) : (
          <FiSun size={14} className="text-amber-500" />
        )}
      </span>
    </button>
  );
}
