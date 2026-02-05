'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const applyTheme = (selectedTheme) => {
  console.log('Applying theme:', selectedTheme);
  const html = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const isDark = selectedTheme === 'dark' || (selectedTheme === 'system' && prefersDark);
  
  console.log('Is dark mode:', isDark);
  
  if (isDark) {
    html.classList.add('dark');
    html.style.colorScheme = 'dark';
    console.log('Added dark class');
  } else {
    html.classList.remove('dark');
    html.style.colorScheme = 'light';
    console.log('Removed dark class');
  }
  
  console.log('Current classes:', html.className);
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setThemeState(savedTheme);
    applyTheme(savedTheme);
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme: theme, setTheme: handleThemeChange, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
