'use client';

import { useLanguage } from '@/lib/language-context';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import { ArrowLeft, MessageCircleQuestion, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function FAQPage() {
    const { t } = useLanguage();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        { question: t.faqQ1, answer: t.faqA1 },
        { question: t.faqQ2, answer: t.faqA2 },
        { question: t.faqQ3, answer: t.faqA3 },
        { question: t.faqQ4, answer: t.faqA4 },
        { question: t.faqQ5, answer: t.faqA5 },
        { question: t.faqQ6, answer: t.faqA6 },
        { question: t.faqQ7, answer: t.faqA7 },
        { question: t.faqQ8, answer: t.faqA8 },
        { question: t.faqQ9, answer: t.faqA9 },
        { question: t.faqQ10, answer: t.faqA10 },
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span>{t.back}</span>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
                                    <MessageCircleQuestion className="w-5 h-5 text-violet-400" />
                                </div>
                                <h1 className="text-xl font-bold text-white">{t.faq}</h1>
                            </div>
                        </div>
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                        {t.faqTitle}
                    </h2>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto">
                        {t.faqIntro}
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`bg-white/5 backdrop-blur-xl rounded-2xl border transition-all ${openIndex === index
                                ? 'border-violet-500/50 shadow-lg shadow-violet-500/20'
                                : 'border-white/10 hover:border-violet-500/30'
                                }`}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between p-6 text-left group"
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center font-bold text-sm transition-all ${openIndex === index ? 'scale-110 text-violet-300' : 'text-violet-400'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <h3 className={`text-lg font-semibold transition-colors ${openIndex === index ? 'text-violet-300' : 'text-white group-hover:text-violet-400'
                                        }`}>
                                        {faq.question}
                                    </h3>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-violet-400 transition-transform flex-shrink-0 ml-4 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-6 pb-6 ml-12">
                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-white/70 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still Have Questions */}
                <div className="mt-12 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 backdrop-blur-xl rounded-3xl border border-violet-500/30 p-8 text-center">
                    <h3 className="text-2xl font-bold text-white mb-3">
                        {t.helpContactSupport}
                    </h3>
                    <p className="text-white/70 mb-6">
                        {t.helpContactSupportDesc}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/help"
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-medium transition-all hover:scale-105 shadow-lg shadow-violet-500/30"
                        >
                            {t.helpCenter}
                        </Link>
                        <a
                            href="mailto:support@auratv.com"
                            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 text-white/80 hover:text-white transition-all"
                        >
                            support@auratv.com
                        </a>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/terms"
                            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 text-white/80 hover:text-white transition-all"
                        >
                            {t.termsOfService}
                        </Link>
                        <Link
                            href="/privacy"
                            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 text-white/80 hover:text-white transition-all"
                        >
                            {t.privacyPolicy}
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
