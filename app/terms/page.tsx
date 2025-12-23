'use client';

import { useLanguage } from '@/lib/language-context';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import {
    AdsterraBanner,
    AdsterraNativeBanner,
    AdsterraSocialBar,
    AdsterraPopunder,
    AdsterraSmartlink,
    AdContainer
} from '@/components/ads/AdsterraAds';

export default function TermsPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
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
                                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                                    <FileText className="w-5 h-5 text-purple-400" />
                                </div>
                                <h1 className="text-xl font-bold text-white">{t.termsOfService}</h1>
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
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {t.termsTitle}
                        </h2>
                        <p className="text-white/60 text-sm">
                            {t.lastUpdated}: 23 Desember 2025
                        </p>
                    </div>

                    {/* Introduction */}
                    <div className="mb-10">
                        <p className="text-white/80 leading-relaxed text-lg">
                            {t.termsIntro}
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-8">
                        {/* Section 1 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    1
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                                    {t.termsAcceptance}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.termsAcceptanceDesc}
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    2
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                                    {t.termsUse}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.termsUseDesc}
                            </p>
                        </section>

                        {/* Section 3 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    3
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                                    {t.termsContent}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.termsContentDesc}
                            </p>
                        </section>

                        {/* Section 4 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    4
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                                    {t.termsAccount}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.termsAccountDesc}
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    5
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                                    {t.termsProhibited}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.termsProhibitedDesc}
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    6
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                                    {t.termsTermination}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.termsTerminationDesc}
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    7
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                                    {t.termsChanges}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.termsChangesDesc}
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                    8
                                </div>
                                <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                                    {t.termsContact}
                                </h3>
                            </div>
                            <p className="text-white/70 leading-relaxed ml-12">
                                {t.termsContactDesc}
                            </p>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                href="/privacy"
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-white/80 hover:text-white transition-all"
                            >
                                {t.privacyPolicy}
                            </Link>
                            <Link
                                href="/help"
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-white/80 hover:text-white transition-all"
                            >
                                {t.helpCenter}
                            </Link>
                            <Link
                                href="/faq"
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-white/80 hover:text-white transition-all"
                            >
                                {t.faq}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Banner Ad */}
                <AdContainer className="my-8">
                    <AdsterraBanner placement="terms" />
                </AdContainer>
            </main>

            {/* Popunder & Smartlink & SocialBar */}
            <AdsterraPopunder placement="terms" />
            <AdsterraSmartlink placement="terms" />
            <AdsterraSocialBar placement="terms" />
        </div>
    );
}
