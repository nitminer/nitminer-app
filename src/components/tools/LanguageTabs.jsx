'use client';

import React, { useState } from 'react';

const LanguageTabs = ({ languages, currentTab, onTabChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentLanguage = languages.find(lang => lang.id === currentTab);

  return (
    <div className="mb-6 animate-[slideDown_0.6s_ease-out] border">
      <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-xl p-4">
        {/* Desktop View - Horizontal Tabs */}
        <div className="hidden md:flex items-center justify-between gap-2 flex-wrap">
          {languages.map((lang, index) => (
            <button
              key={lang.id}
              onClick={() => onTabChange(lang.id)}
              className={`
                relative px-6 md:px-10 lg:px-40 py-2 md:py-3 lg:py-4 max-w-full rounded-lg font-medium text-base md:text-lg lg:text-xl transition-all duration-300
                hover:scale-105 hover:shadow-lg
                ${currentTab === lang.id 
                  ? 'text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }
              `}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {currentTab === lang.id && (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-r ${lang.color} rounded-lg opacity-90 blur-sm`}></div>
                  <div className={`absolute inset-0 bg-gradient-to-r ${lang.color} rounded-lg`}></div>
                </>
              )}
              <span className="relative z-10">{lang.name}</span>
            </button>
          ))}
        </div>

        {/* Mobile View - Dropdown */}
        <div className="md:hidden">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-base
                transition-all duration-300 border
                ${isDropdownOpen 
                  ? 'bg-slate-800 border-slate-600 text-white' 
                  : 'bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <i className="fas fa-code text-blue-400 mr-2"></i>
                {currentLanguage?.name || 'Select Language'}
              </span>
              <i className={`fas fa-chevron-down transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      onTabChange(lang.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`
                      w-full text-left px-4 py-3 transition-all duration-200
                      flex items-center gap-2
                      ${currentTab === lang.id 
                        ? `bg-gradient-to-r ${lang.color} text-white font-medium` 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }
                    `}
                  >
                    <i className="fas fa-check text-sm" style={{ opacity: currentTab === lang.id ? 1 : 0 }}></i>
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageTabs;
