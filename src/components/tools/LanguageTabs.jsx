'use client';

import React, { useState } from 'react';
import { Code2 } from 'lucide-react';
import { FaJava } from 'react-icons/fa';
import { SiPython, SiSolidity } from 'react-icons/si';

const LanguageTabs = ({ languages, currentTab, onTabChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentLanguage = languages.find(lang => lang.id === currentTab);
  const iconMap = {
    c: { Icon: Code2, color: '#1572B6' },
    java: { Icon: FaJava, color: '#F8981D' },
    python: { Icon: SiPython, color: '#3776ab' },
    solidity: { Icon: SiSolidity, color: '#363636' },
  };

  return (
    <div className="mb-4 animate-[slideDown_0.6s_ease-out]">
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        {/* Desktop View - Horizontal Tabs */}
        <div className="hidden md:flex items-center justify-between gap-2 flex-wrap">
          {languages.map((lang, index) => (
            (() => {
              const LangIcon = iconMap[lang.id]?.Icon || Code2;
              const iconColor = iconMap[lang.id]?.color || '#6b7280';
              return (
            <button
              key={lang.id}
              onClick={() => onTabChange(lang.id)}
              className={`
                relative px-5 md:px-8 lg:px-10 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300
                hover:shadow-md
                ${currentTab === lang.id
                  ? 'text-black shadow-md border border-blue-400 bg-blue-50'
                  : 'text-black hover:text-black bg-slate-50 border border-slate-200'
                }
              `}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <LangIcon size={17} color={iconColor} />
                {lang.name}
              </span>
            </button>
              );
            })()
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
                  ? 'bg-slate-50 border-slate-300 text-black' 
                  : 'bg-white border-slate-300 text-black hover:bg-slate-50'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <i className="fas fa-code text-indigo-500 mr-2"></i>
                {currentLanguage?.name || 'Select Language'}
              </span>
              <i className={`fas fa-chevron-down transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-50 overflow-hidden">
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
                        ? `bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium` 
                        : 'text-black hover:bg-slate-100 hover:text-black'
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
