'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleSelect = (lang: 'id' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
      >
        <Globe size={16} />
        <span className="uppercase">{language}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => handleSelect('id')}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              language === 'id' 
                ? 'bg-blue-50 text-[#1A4B9F] dark:bg-blue-900/20 dark:text-blue-400 font-semibold' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Indonesia
          </button>
          <button
            onClick={() => handleSelect('en')}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              language === 'en' 
                ? 'bg-blue-50 text-[#1A4B9F] dark:bg-blue-900/20 dark:text-blue-400 font-semibold' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            English
          </button>
        </div>
      )}
    </div>
  );
}
