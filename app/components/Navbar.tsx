'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Compass, 
  Flame, 
  Library, 
  MonitorPlay,
  Globe,
  ChevronDown,
  Check,
  Heart
} from 'lucide-react';
import { useTranslation } from './I18nProvider';

const NavItem = ({ icon: Icon, label, path, active }: { icon: any, label: string, path: string, active: boolean }) => (
  <Link 
    href={path}
    className={`flex items-center flex-col md:flex-row gap-1 md:gap-4 p-3 md:px-5 md:py-3.5 rounded-2xl w-full transition-all duration-300 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'
    }`}
  >
    <Icon size={22} className={active ? "text-white" : "text-gray-400"} strokeWidth={active ? 2.5 : 2} />
    <span className={`text-[10px] md:text-sm font-semibold ${active ? 'md:font-bold' : ''}`}>{label}</span>
  </Link>
);

export default function Navbar({ setup }: { setup: any }) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);

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

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  return (
    <nav className="order-2 md:order-1 w-full md:w-72 bg-white/60 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-white flex flex-row md:flex-col justify-around md:justify-start p-2 md:p-6 z-50 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      
      {/* Logo (Desktop Only) */}
      <div className="hidden md:flex items-center mb-10 px-2">
        <Link href="/" className="w-full h-16 flex items-center">
          {setup.logo_url ? (
            <img src={setup.logo_url} alt={setup.sitename} className="w-full h-full object-contain object-left" />
          ) : (
            <div className="flex items-center gap-2">
              <MonitorPlay size={24} className="text-blue-600" />
              <span className="text-xl font-black text-gray-900">{setup.sitename}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Language Switcher (Desktop Top) */}
      <div className="hidden md:block relative mb-8 px-2">
        <button 
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="w-full flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{currentLang.flag}</span>
            <span className="text-sm font-bold text-gray-700">{currentLang.name.split(' ')[0]}</span>
          </div>
          <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
        </button>

        {isLangOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[1.5rem] border border-gray-100 shadow-2xl z-[100] py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code);
                  setIsLangOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${
                  locale === lang.code 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {locale === lang.code && <Check size={16} className="text-blue-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="flex flex-row md:flex-col w-full md:w-auto gap-2 md:gap-3">
        <NavItem icon={Home} label={t('common.home')} path="/" active={pathname === '/'} />
        <NavItem icon={Compass} label={t('common.browse')} path="/browse" active={pathname === '/browse'} />
        <NavItem icon={Flame} label={t('common.trending')} path="/trending" active={pathname === '/trending'} />
        <NavItem icon={Library} label={t('common.library')} path="/library" active={pathname === '/library'} />
      </div>

    </nav>
  );
}
