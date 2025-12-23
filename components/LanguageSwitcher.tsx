"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { languages } from '@/lib/translations';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const currentLang = languages.find(l => l.code === language);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 rounded-lg transition"
                title="Change Language"
            >
                <Globe className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">{currentLang?.flag}</span>
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setShowDropdown(false);
                            }}
                            className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-zinc-800 transition text-left ${language === lang.code ? 'bg-zinc-800' : ''
                                }`}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <span className="text-sm">{lang.name}</span>
                            {language === lang.code && (
                                <span className="ml-auto text-red-500">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
