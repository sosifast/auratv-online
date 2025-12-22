"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Chrome
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // Validation
            if (!email || !password) {
                setError('Email dan password harus diisi');
                setIsLoading(false);
                return;
            }

            if (!email.includes('@')) {
                setError('Format email tidak valid');
                setIsLoading(false);
                return;
            }

            // Login dengan Supabase
            const supabase = createClient();

            // Cek apakah user ada di database
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('password', password) // Note: In production, use bcrypt hash comparison
                .single();

            if (userError || !userData) {
                setError('Email atau password salah');
                setIsLoading(false);
                return;
            }

            // Cek status user
            if (userData.status !== 'Active') {
                setError('Akun Anda tidak aktif. Hubungi administrator.');
                setIsLoading(false);
                return;
            }

            // Simpan session ke localStorage (untuk demo)
            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify({
                    id: userData.id,
                    email: userData.email,
                    name: userData.full_name,
                    level: userData.level
                }));
            }

            setSuccess('Login berhasil! Mengalihkan...');

            // Redirect berdasarkan role
            setTimeout(() => {
                if (userData.level === 'Admin') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            }, 1000);

        } catch (err: any) {
            console.error('Login error:', err);
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('Google login belum dikonfigurasi. Silakan setup Supabase OAuth.');
        setIsLoading(false);
    };

    return (
        <div className="w-full max-w-md">
            {/* Card Container */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800/50 p-8 md:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Selamat Datang</h2>
                    <p className="text-gray-400">Masuk untuk melanjutkan menonton</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 animate-shake">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3 text-green-400">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{success}</span>
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

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border-2 transition-all ${rememberMe ? 'bg-red-600 border-red-600' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                    {rememberMe && (
                                        <svg className="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm text-gray-400 group-hover:text-gray-300">Ingat saya</span>
                        </label>

                        <Link href="/forgot-password" className="text-sm text-red-500 hover:text-red-400 transition">
                            Lupa password?
                        </Link>
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
                                Memproses...
                            </>
                        ) : (
                            'Masuk'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-zinc-900/80 text-gray-500">atau lanjutkan dengan</span>
                    </div>
                </div>

                {/* Social Login */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 border border-zinc-700 hover:border-zinc-600 disabled:opacity-50"
                >
                    <Chrome className="w-5 h-5" />
                    Google
                </button>

                {/* Register Link */}
                <p className="text-center mt-8 text-gray-400">
                    Belum punya akun?{' '}
                    <Link href="/register" className="text-red-500 hover:text-red-400 font-medium transition">
                        Daftar sekarang
                    </Link>
                </p>
            </div>

            {/* Demo Hint */}
            <p className="text-center mt-6 text-gray-600 text-xs">
                Demo mode: Gunakan email dan password apapun untuk login
            </p>
        </div>
    );
}
