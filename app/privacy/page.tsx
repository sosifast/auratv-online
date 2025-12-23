'use client';

import { useLanguage } from '@/lib/language-context';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
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
                                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                                    <Shield className="w-5 h-5 text-blue-400" />
                                </div>
                                <h1 className="text-xl font-bold text-white">{t.privacyPolicy}</h1>
                            </div>
                        </div>
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl">
                    {/* Title */}
                    <div className="mb-8 pb-8 border-b border-white/10">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            {t.privacyTitle}
                        </h2>
                        <p className="text-white/60 text-sm">
                            {t.lastUpdated}: 23 Desember 2025
                        </p>
                    </div>

                    {/* Introduction */}
                    <div className="mb-10">
                        <p className="text-white/80 leading-relaxed text-lg">
                            {t.privacyIntro}
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        {/* Section 1 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    1
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {t.privacyCollection}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.privacyCollectionDesc}
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    2
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {t.privacyUse}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.privacyUseDesc}
                            </p>
                        </section>

                        {/* Section 3 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    3
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {t.privacySharing}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.privacySharingDesc}
                            </p>
                        </section>

                        {/* Section 4 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    4
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {t.privacyCookies}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.privacyCookiesDesc}
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    5
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {t.privacySecurity}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.privacySecurityDesc}
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    6
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {t.privacyRights}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.privacyRightsDesc}
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    7
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {t.privacyChildren}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.privacyChildrenDesc}
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    8
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {t.privacyChanges}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.privacyChangesDesc}
                            </p>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                href="/terms"
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 text-white/80 hover:text-white transition-all"
                            >
                                {t.termsOfService}
                            </Link>
                            <Link
                                href="/help"
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 text-white/80 hover:text-white transition-all"
                            >
                                {t.helpCenter}
                            </Link>
                            <Link
                                href="/faq"
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 text-white/80 hover:text-white transition-all"
                            >
                                {t.faq}
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
