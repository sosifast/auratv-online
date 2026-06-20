'use client';

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation } from './I18nProvider';

const languages = [
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'th', name: 'ไทย (Thai)', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(l => l.code === locale) || languages.find(l => l.code === 'en') || languages[1];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-white/20 transition-colors"
      >
        <span className="text-lg leading-none">{currentLang.flag}</span>
        <ChevronDown size={14} className={`text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-[#1F2833] rounded-xl border border-white/10 shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${
                locale === lang.code 
                  ? 'bg-[#E50914]/10 text-[#E50914]' 
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {locale === lang.code && <Check size={16} className="text-[#E50914]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
