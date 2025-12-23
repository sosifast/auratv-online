'use client';

import { useLanguage } from '@/lib/language-context';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Rocket, User, Tv, CreditCard, Wrench, Mail } from 'lucide-react';
import {
    AdsterraBanner,
    AdsterraNativeBanner,
    AdsterraSocialBar,
    AdsterraPopunder,
    AdsterraSmartlink,
    AdContainer
} from '@/components/ads/AdsterraAds';

export default function HelpPage() {
    const { t } = useLanguage();

    const helpCategories = [
        {
            icon: Rocket,
            title: t.helpGettingStarted,
            description: t.helpGettingStartedDesc,
            color: 'from-green-500/20 to-emerald-500/20',
            borderColor: 'border-green-500/30',
            iconColor: 'text-green-400',
            hoverColor: 'hover:border-green-500/50'
        },
        {
            icon: User,
            title: t.helpAccount,
            description: t.helpAccountDesc,
            color: 'from-blue-500/20 to-cyan-500/20',
            borderColor: 'border-blue-500/30',
            iconColor: 'text-blue-400',
            hoverColor: 'hover:border-blue-500/50'
        },
        {
            icon: Tv,
            title: t.helpStreaming,
            description: t.helpStreamingDesc,
            color: 'from-purple-500/20 to-pink-500/20',
            borderColor: 'border-purple-500/30',
            iconColor: 'text-purple-400',
            hoverColor: 'hover:border-purple-500/50'
        },
        {
            icon: CreditCard,
            title: t.helpBilling,
            description: t.helpBillingDesc,
            color: 'from-yellow-500/20 to-orange-500/20',
            borderColor: 'border-yellow-500/30',
            iconColor: 'text-yellow-400',
            hoverColor: 'hover:border-yellow-500/50'
        },
        {
            icon: Wrench,
            title: t.helpTechnical,
            description: t.helpTechnicalDesc,
            color: 'from-red-500/20 to-rose-500/20',
            borderColor: 'border-red-500/30',
            iconColor: 'text-red-400',
            hoverColor: 'hover:border-red-500/50'
        },
        {
            icon: Mail,
            title: t.helpContactSupport,
            description: t.helpContactSupportDesc,
            color: 'from-indigo-500/20 to-violet-500/20',
            borderColor: 'border-indigo-500/30',
            iconColor: 'text-indigo-400',
            hoverColor: 'hover:border-indigo-500/50'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950">
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
                                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
                                    <HelpCircle className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h1 className="text-xl font-bold text-white">{t.helpCenter}</h1>
                            </div>
                        </div>
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                        {t.helpTitle}
                    </h2>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto">
                        {t.helpIntro}
                    </p>
                </div>

                {/* Help Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {helpCategories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <div
                                key={index}
                                className={`group bg-white/5 backdrop-blur-xl rounded-2xl border ${category.borderColor} ${category.hoverColor} p-6 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer`}
                            >
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} border ${category.borderColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-7 h-7 ${category.iconColor}`} />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                    {category.title}
                                </h3>
                                <p className="text-white/60 leading-relaxed">
                                    {category.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Links */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-green-400 rounded-full"></div>
                        Quick Links
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            href="/faq"
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 text-white/80 hover:text-white transition-all group"
                        >
                            <HelpCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">{t.faq}</span>
                        </Link>
                        <Link
                            href="/terms"
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 text-white/80 hover:text-white transition-all group"
                        >
                            <HelpCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">{t.termsOfService}</span>
                        </Link>
                        <Link
                            href="/privacy"
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 text-white/80 hover:text-white transition-all group"
                        >
                            <HelpCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">{t.privacyPolicy}</span>
                        </Link>
                        <a
                            href="mailto:support@auratv.com"
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 text-white/80 hover:text-white transition-all group"
                        >
                            <Mail className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">support@auratv.com</span>
                        </a>
                    </div>
                </div>

                {/* Banner Ad */}
                <AdContainer className="my-8">
                    <AdsterraBanner placement="help" />
                </AdContainer>
            </main>

            {/* Popunder & Smartlink & SocialBar */}
            <AdsterraPopunder placement="help" />
            <AdsterraSmartlink placement="help" />
            <AdsterraSocialBar placement="help" />
        </div>
    );
}
