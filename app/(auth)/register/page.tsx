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
    User,
    Chrome,
    Check,
    X
} from 'lucide-react';
import { userService } from '@/lib/services/users';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Password strength checker
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const passwordStrengthLabel = ['Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'][passwordStrength - 1] || '';
    const passwordStrengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'][passwordStrength - 1] || 'bg-zinc-700';

    const passwordChecks = [
        { label: 'Minimal 8 karakter', valid: formData.password.length >= 8 },
        { label: 'Huruf besar', valid: /[A-Z]/.test(formData.password) },
        { label: 'Huruf kecil', valid: /[a-z]/.test(formData.password) },
        { label: 'Angka', valid: /[0-9]/.test(formData.password) },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Semua field harus diisi');
            setIsLoading(false);
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Format email tidak valid');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password minimal 8 karakter');
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok');
            setIsLoading(false);
            return;
        }

        if (!agreeTerms) {
            setError('Anda harus menyetujui syarat dan ketentuan');
            setIsLoading(false);
            return;
        }

        // Check if Supabase is configured
        const isConfigured = isSupabaseConfigured();
        const supabase = createClient();

        try {
            // 1. Create user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Gagal membuat akun auth');

            // 2. Create user in our custom users table
            await userService.create({
                id: authData.user.id, // Direct link to Auth ID
                full_name: formData.name,
                email: formData.email,
                password: formData.password, // Still sync for legacy if needed, but Auth handles it now
                level: 'Member',
                status: 'Active'
            });

            setSuccess('Akun berhasil dibuat! Mengalihkan ke login...');

            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (err: any) {
            console.error('Registration error:', err);
            // Handle specific errors
            if (err.message?.includes('duplicate key') || err.message?.includes('already exists') || err.code === '23505') {
                setError('Email sudah terdaftar. Silakan gunakan email lain atau login.');
            } else {
                setError(err.message || 'Gagal membuat akun. Silakan coba lagi.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setError('Google signup belum dikonfigurasi. Silakan setup Supabase OAuth.');
        setIsLoading(false);
    };

    return (
        <div className="w-full max-w-md">
            {/* Card Container */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800/50 p-8 md:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Buat Akun</h2>
                    <p className="text-gray-400">Daftar untuk mulai menonton</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Nama Lengkap</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
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
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
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

                        {/* Password Strength */}
                        {formData.password && (
                            <div className="space-y-2 mt-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full transition-all ${level <= passwordStrength ? passwordStrengthColor : 'bg-zinc-700'}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400">
                                    Kekuatan: <span className={passwordStrength >= 4 ? 'text-green-400' : passwordStrength >= 3 ? 'text-yellow-400' : 'text-red-400'}>{passwordStrengthLabel}</span>
                                </p>
                                <div className="grid grid-cols-2 gap-1">
                                    {passwordChecks.map((check, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 text-xs">
                                            {check.valid ? (
                                                <Check className="w-3 h-3 text-green-400" />
                                            ) : (
                                                <X className="w-3 h-3 text-gray-500" />
                                            )}
                                            <span className={check.valid ? 'text-green-400' : 'text-gray-500'}>{check.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Konfirmasi Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={`w-full bg-zinc-800/50 border rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all ${formData.confirmPassword && formData.confirmPassword !== formData.password ? 'border-red-500' : 'border-zinc-700'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                            <p className="text-xs text-red-400">Password tidak cocok</p>
                        )}
                    </div>

                    {/* Terms & Conditions */}
                    <label className="flex items-start gap-3 cursor-pointer group mt-4">
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border-2 transition-all ${agreeTerms ? 'bg-red-600 border-red-600' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                {agreeTerms && (
                                    <svg className="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-gray-300">
                            Saya menyetujui{' '}
                            <Link href="/terms" className="text-red-500 hover:text-red-400">Syarat & Ketentuan</Link>
                            {' '}dan{' '}
                            <Link href="/privacy" className="text-red-500 hover:text-red-400">Kebijakan Privasi</Link>
                        </span>
                    </label>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 mt-6"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            'Daftar'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-zinc-900/80 text-gray-500">atau daftar dengan</span>
                    </div>
                </div>

                {/* Social Signup */}
                <button
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 border border-zinc-700 hover:border-zinc-600 disabled:opacity-50"
                >
                    <Chrome className="w-5 h-5" />
                    Google
                </button>

                {/* Login Link */}
                <p className="text-center mt-6 text-gray-400">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-red-500 hover:text-red-400 font-medium transition">
                        Masuk
                    </Link>
                </p>
            </div>
        </div>
    );
}
