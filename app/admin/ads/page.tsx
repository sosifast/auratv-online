"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Save, Eye, EyeOff, ExternalLink, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { clearAdsCache } from '@/components/ads/AdsterraAds';

interface AdConfig {
    id: string;
    ad_type: string;
    ad_key: string;
    ad_script_url: string;
    is_enabled: boolean;
    placement: string[];
    description: string;
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

            // Update local state
            setAds(ads.map(ad =>
                ad.id === id ? { ...ad, is_enabled: !currentState } : ad
            ));

            // Clear cache
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
                    ad_key: ad.ad_key,
                    ad_script_url: ad.ad_script_url,
                    placement: ad.placement
                })
                .eq('id', ad.id);

            if (error) throw error;

            // Clear cache
            clearAdsCache();
            alert('Ad configuration saved!');
        } catch (err) {
            console.error('Error saving ad:', err);
            alert('Failed to save ad configuration');
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
                    <p className="text-gray-400 mt-1">Kelola iklan Adsterra dari database</p>
                </div>
                <button
                    onClick={fetchAds}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                >
                    <RefreshCw className="w-5 h-5" />
                    Refresh
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-blue-300 font-medium">Get Adsterra Ad Keys</p>
                        <p className="text-blue-200 text-sm mt-1">
                            Login to <a href="https://publishers.adsterra.com/" target="_blank" rel="noopener" className="underline">Adsterra Dashboard</a> → Create Ad Zones → Copy Keys
                        </p>
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
                            <button
                                onClick={() => handleToggle(ad.id, ad.is_enabled)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${ad.is_enabled
                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    }`}
                            >
                                {ad.is_enabled ? (
                                    <><Eye className="w-4 h-4" /> Enabled</>
                                ) : (
                                    <><EyeOff className="w-4 h-4" /> Disabled</>
                                )}
                            </button>
                        </div>

                        {/* Ad Key */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Ad Key <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={ad.ad_key}
                                onChange={(e) => updateAd(ad.id, 'ad_key', e.target.value)}
                                placeholder="e.g., abc123def456ghi789"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                        </div>

                        {/* Script URL */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Script URL Template
                            </label>
                            <input
                                type="text"
                                value={ad.ad_script_url}
                                onChange={(e) => updateAd(ad.id, 'ad_script_url', e.target.value)}
                                placeholder="//www.example.com/{KEY}/invoke.js"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Use {'{KEY}'} as placeholder for ad key
                            </p>
                        </div>

                        {/* Placements */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Show On Pages
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

            {/* Footer Info */}
            <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
                <p className="text-gray-400 text-sm">
                    💡 <strong>Tip:</strong> Ads will automatically load on enabled pages once you save the configuration.
                    Clear browser cache if changes don't appear immediately.
                </p>
            </div>
        </div>
    );
}
