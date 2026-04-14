'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import id from '../../dictionaries/id.json';
import en from '../../dictionaries/en.json';
import zh from '../../dictionaries/zh.json';
import ko from '../../dictionaries/ko.json';
import th from '../../dictionaries/th.json';
import vi from '../../dictionaries/vi.json';
import af from '../../dictionaries/af.json';
import hi from '../../dictionaries/hi.json';

const dictionaries: any = { id, en, zh, ko, th, vi, af, hi };

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, initialLocale }: { children: React.ReactNode, initialLocale: string }) {
  const [locale, setLocale] = useState(initialLocale);
  const router = useRouter();

  const handleSetLocale = (newLocale: string) => {
    setLocale(newLocale);
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  const t = (path: string) => {
    const keys = path.split('.');
    let result = dictionaries[locale];
    for (const key of keys) {
      result = result?.[key];
    }
    return result || path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
}
