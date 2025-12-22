"use client";

import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop"
                    alt="Background"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/80" />
            </div>

            {/* Floating Particles Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Header */}
            <header className="relative z-50 px-6 md:px-12 py-6">
                <Link href="/">
                    <h1 className="text-red-600 text-3xl md:text-4xl font-bold tracking-tighter cursor-pointer hover:text-red-500 transition inline-block">
                        STREAMFLIX
                    </h1>
                </Link>
            </header>

            {/* Content */}
            <main className="relative z-10 flex items-center justify-center px-4 py-8 min-h-[calc(100vh-180px)]">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 px-6 md:px-12 py-6 text-gray-500 text-sm">
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <span className="hover:underline cursor-pointer hover:text-gray-300">FAQ</span>
                    <span className="hover:underline cursor-pointer hover:text-gray-300">Pusat Bantuan</span>
                    <span className="hover:underline cursor-pointer hover:text-gray-300">Ketentuan Penggunaan</span>
                    <span className="hover:underline cursor-pointer hover:text-gray-300">Privasi</span>
                    <span className="hover:underline cursor-pointer hover:text-gray-300">Preferensi Cookie</span>
                </div>
                <p className="mt-4 text-center md:text-left">© 2024 StreamFlix Indonesia</p>
            </footer>
        </div>
    );
}
