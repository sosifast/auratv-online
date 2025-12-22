"use client";

import React, { useState, useEffect } from 'react';
import { settingsService } from '@/lib/services/settings';
import type { Settings } from '@/lib/types/database';

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await settingsService.get();
            setSettings(data);
        } catch (err: any) {
            setError(err.message || 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;

        setSaving(true);
        setError('');

        try {
            const formData = new FormData(e.target as HTMLFormElement);
            await settingsService.update(settings.id, {
                name_site: formData.get('name_site') as string,
                favicon_url: formData.get('favicon_url') as string || null,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan data');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 mt-1">Konfigurasi pengaturan website</p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">{error}</div>
            )}

            {saved && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Settings berhasil disimpan!
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800">
                        <h2 className="text-lg font-semibold text-white">Pengaturan Umum</h2>
                        <p className="text-sm text-gray-500 mt-1">Konfigurasi dasar website</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Nama Website</label>
                                <input type="text" name="name_site" defaultValue={settings?.name_site || ''}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-red-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Favicon URL</label>
                                <input type="text" name="favicon_url" defaultValue={settings?.favicon_url || ''}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800">
                        <h2 className="text-lg font-semibold text-white">Informasi Database</h2>
                        <p className="text-sm text-gray-500 mt-1">Data dari Supabase</p>
                    </div>
                    <div className="p-6 space-y-3">
                        <div className="flex justify-between py-2 border-b border-zinc-800">
                            <span className="text-gray-400">ID</span>
                            <code className="text-gray-300 text-sm">{settings?.id}</code>
                        </div>
                        <div className="flex justify-between py-2 border-b border-zinc-800">
                            <span className="text-gray-400">Created At</span>
                            <span className="text-gray-300">{settings?.created_at ? new Date(settings.created_at).toLocaleString('id-ID') : '-'}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-400">Updated At</span>
                            <span className="text-gray-300">{settings?.updated_at ? new Date(settings.updated_at).toLocaleString('id-ID') : '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={fetchSettings} className="px-6 py-2.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition">Reset</button>
                    <button type="submit" disabled={saving} className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50">
                        {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Simpan Settings
                    </button>
                </div>
            </form>
        </div>
    );
}
