"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Mail,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    KeyRound,
    Send
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Validation
            if (!email) {
                setError('Email harus diisi');
                setIsLoading(false);
                return;
            }

            if (!email.includes('@')) {
                setError('Format email tidak valid');
                setIsLoading(false);
                return;
            }

            const supabase = createClient();

            // Cek apakah email terdaftar di database
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .single();

            if (userError || !userData) {
                setError('Email tidak terdaftar di sistem');
                setIsLoading(false);
                return;
            }

            // Simulasi pengiriman email reset password
            // Dalam production, gunakan Supabase Auth atau service email
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess(true);
            setCountdown(60);
            setIsLoading(false);

            // Countdown timer
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err: any) {
            console.error('Reset password error:', err);
            setError('Terjadi kesalahan. Silakan coba lagi.');
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        setCountdown(60);

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="w-full max-w-md">
            {/* Card Container */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800/50 p-8 md:p-10">
                {!success ? (
                    <>
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/20">
                                <KeyRound className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Lupa Password?</h2>
                            <p className="text-gray-400">Masukkan email untuk reset password</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nama@email.com"
                                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Kirim Link Reset
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Back to Login */}
                        <div className="mt-8">
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Kembali ke Login
                            </Link>
                        </div>
                    </>
                ) : (
                    /* Success State */
                    <div className="text-center">
                        {/* Success Icon */}
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-600/20 animate-bounce-slow">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-3">Email Terkirim!</h2>
                        <p className="text-gray-400 mb-6">
                            Kami telah mengirim link reset password ke{' '}
                            <span className="text-white font-medium">{email}</span>
                        </p>

                        {/* Email Preview Card */}
                        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">A</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-medium text-sm">AuraTV</p>
                                    <p className="text-gray-500 text-xs">noreply@auratv.com</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="text-gray-400 text-sm font-medium mb-1">Reset Password Anda</p>
                                <p className="text-gray-500 text-xs">Klik link di bawah untuk mereset password...</p>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4 mb-6 text-left">
                            <p className="text-gray-400 text-sm mb-2">💡 Tips:</p>
                            <ul className="text-gray-500 text-xs space-y-1">
                                <li>• Cek folder spam jika email tidak ditemukan</li>
                                <li>• Link reset berlaku selama 24 jam</li>
                                <li>• Pastikan email yang dimasukkan benar</li>
                            </ul>
                        </div>

                        {/* Resend Button */}
                        <button
                            onClick={handleResend}
                            disabled={countdown > 0 || isLoading}
                            className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${countdown > 0
                                ? 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                                }`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : countdown > 0 ? (
                                `Kirim ulang dalam ${countdown}s`
                            ) : (
                                'Kirim Ulang Email'
                            )}
                        </button>

                        {/* Back to Login */}
                        <div className="mt-6">
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Kembali ke Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Help Text */}
            <p className="text-center mt-6 text-gray-600 text-xs">
                Butuh bantuan? <Link href="/help" className="text-red-500 hover:text-red-400">Hubungi Support</Link>
            </p>
        </div>
    );
}
