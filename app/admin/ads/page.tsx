"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Save, Eye, EyeOff, Copy, RefreshCw, Code } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { clearAdsCache } from '@/components/ads/AdsterraAds';

interface AdConfig {
    id: string;
    ad_type: string;
    ad_script: string;
    is_enabled: boolean;
    placement: string[];
    description: string;
    ad_notes: string;
}

export default function AdsConfigPage() {
    const [ads, setAds] = useState<AdConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const supabase = createClient();
            const { data, error } = await supabase
                .from('ads_config')
                .select('*')
                .order('ad_type');

            if (error) throw error;
            setAds(data || []);
        } catch (err) {
            console.error('Error fetching ads:', err);
            alert('Failed to fetch ads configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string, currentState: boolean) => {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('ads_config')
                .update({ is_enabled: !currentState })
                .eq('id', id);

            if (error) throw error;

            setAds(ads.map(ad =>
                ad.id === id ? { ...ad, is_enabled: !currentState } : ad
            ));

            clearAdsCache();
        } catch (err) {
            console.error('Error toggling ad:', err);
            alert('Failed to toggle ad');
        }
    };

    const handleSave = async (ad: AdConfig) => {
        try {
            setSaving(true);
            const supabase = createClient();
            const { error } = await supabase
                .from('ads_config')
                .update({
                    ad_script: ad.ad_script,
                    placement: ad.placement,
                    ad_notes: ad.ad_notes
                })
                .eq('id', ad.id);

            if (error) throw error;

            clearAdsCache();
            alert('✅ Ad script saved successfully!');
        } catch (err) {
            console.error('Error saving ad:', err);
            alert('❌ Failed to save ad script');
        } finally {
            setSaving(false);
        }
    };

    const updateAd = (id: string, field: keyof AdConfig, value: any) => {
        setAds(ads.map(ad =>
            ad.id === id ? { ...ad, [field]: value } : ad
        ));
    };

    const togglePlacement = (id: string, place: string) => {
        setAds(ads.map(ad => {
            if (ad.id !== id) return ad;
            const placements = ad.placement.includes(place)
                ? ad.placement.filter(p => p !== place)
                : [...ad.placement, place];
            return { ...ad, placement: placements };
        }));
    };

    const copyExample = (type: string) => {
        const examples: Record<string, string> = {
            banner: `<script async="async" data-cfasync="false" src="https://pl28309557.effectivegatecpm.com/YOUR_KEY_HERE/invoke.js"></script>
<div id="container-YOUR_KEY_HERE"></div>`,
            native: `<script async="async" data-cfasync="false" src="https://pl28309557.effectivegatecpm.com/YOUR_KEY_HERE/invoke.js"></script>
<div id="container-YOUR_KEY_HERE"></div>`,
            social_bar: `<script async="async" data-cfasync="false" src="https://pl28309557.effectivegatecpm.com/YOUR_KEY_HERE/invoke.js"></script>`,
            popunder: `<script type="text/javascript">
    atOptions = {
        'key' : 'YOUR_KEY_HERE',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
    };
</script>
<script type="text/javascript" src="//www.topcreativeformat.com/YOUR_KEY_HERE/invoke.js"></script>`,
            smartlink: `<script async="async" data-cfasync="false" src="https://pl28309557.effectivegatecpm.com/YOUR_KEY_HERE/invoke.js"></script>`
        };

        navigator.clipboard.writeText(examples[type] || '');
        alert('📋 Example copied to clipboard!');
    };

    const getAdIcon = (type: string) => {
        switch (type) {
            case 'banner': return '🎯';
            case 'native': return '📱';
            case 'social_bar': return '📌';
            case 'popunder': return '🪟';
            case 'smartlink': return '🔗';
            default: return '📢';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Settings className="w-7 h-7" />
                        Ads Configuration
                    </h1>
                    <p className="text-gray-400 mt-1">Paste full HTML script dari Adsterra</p>
                </div>
                <button
                    onClick={fetchAds}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                >
                    <RefreshCw className="w-5 h-5" />
                    Refresh
                </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Code className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-blue-300 font-medium mb-2">Cara Pakai:</p>
                        <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
                            <li>Login ke <a href="https://publishers.adsterra.com/" target="_blank" rel="noopener" className="underline">Adsterra Dashboard</a></li>
                            <li>Buat Ad Zone → Copy <strong>seluruh HTML script</strong></li>
                            <li>Paste di textarea di bawah</li>
                            <li>Pilih halaman (Homepage/Play/Category)</li>
                            <li>Enable & Save!</li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Ads List */}
            <div className="grid gap-6">
                {ads.map(ad => (
                    <div key={ad.id} className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>{getAdIcon(ad.ad_type)}</span>
                                    {ad.description}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">Type: {ad.ad_type}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyExample(ad.ad_type)}
                                    className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm transition"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Example
                                </button>
                                <button
                                    onClick={() => handleToggle(ad.id, ad.is_enabled)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${ad.is_enabled
                                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                        }`}
                                >
                                    {ad.is_enabled ? (
                                        <><Eye className="w-4 h-4" /> ON</>
                                    ) : (
                                        <><EyeOff className="w-4 h-4" /> OFF</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Ad Script HTML */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                HTML Script dari Adsterra <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={ad.ad_script}
                                onChange={(e) => updateAd(ad.id, 'ad_script', e.target.value)}
                                placeholder={`Paste HTML dari Adsterra di sini:\n<script async="async" data-cfasync="false" src="https://..."></script>\n<div id="container-..."></div>`}
                                rows={6}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Copy & paste seluruh script HTML dari Adsterra (include &lt;script&gt; dan &lt;div&gt;)
                            </p>
                        </div>

                        {/* Notes */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Notes (Optional)
                            </label>
                            <input
                                type="text"
                                value={ad.ad_notes || ''}
                                onChange={(e) => updateAd(ad.id, 'ad_notes', e.target.value)}
                                placeholder="e.g., High CPM, Test Campaign, etc."
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                        </div>

                        {/* Placements */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tampilkan di Halaman
                            </label>
                            <div className="flex gap-2">
                                {['homepage', 'play', 'category'].map(place => (
                                    <button
                                        key={place}
                                        onClick={() => togglePlacement(ad.id, place)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition ${ad.placement.includes(place)
                                                ? 'bg-red-600 text-white'
                                                : 'bg-zinc-700 text-gray-400 hover:bg-zinc-600'
                                            }`}
                                    >
                                        {place.charAt(0).toUpperCase() + place.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={() => handleSave(ad)}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer Tip */}
            <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
                <p className="text-gray-400 text-sm">
                    💡 <strong>Tip:</strong> Script akan otomatis load di halaman yang dipilih.
                    Refresh halaman jika perubahan belum muncul.
                </p>
            </div>
        </div>
    );
}
