"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Adsterra Ads Components - Database Driven
 * Ads configuration stored in 'ads_config' table
 */

interface AdConfig {
    ad_type: string;
    ad_key: string;
    ad_script_url: string;
    is_enabled: boolean;
    placement: string[];
}

// Cache for ad configs to avoid repeated DB queries
let adsConfigCache: AdConfig[] | null = null;

// Fetch ads configuration from database
async function getAdsConfig(): Promise<AdConfig[]> {
    if (adsConfigCache) return adsConfigCache;

    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('ads_config')
            .select('*')
            .eq('is_enabled', true);

        if (error) throw error;

        adsConfigCache = data || [];
        return adsConfigCache;
    } catch (error) {
        console.error('Error fetching ads config:', error);
        return [];
    }
}

// Get specific ad config by type
async function getAdByType(type: string): Promise<AdConfig | null> {
    const ads = await getAdsConfig();
    return ads.find(ad => ad.ad_type === type) || null;
}

// Clear cache (call when ads updated in admin)
export function clearAdsCache() {
    adsConfigCache = null;
}

// Banner Ad (728x90 or responsive)
export function AdsterraBanner({ placement = 'homepage' }: { placement?: string }) {
    const [adConfig, setAdConfig] = useState<AdConfig | null>(null);

    useEffect(() => {
        async function loadAd() {
            const config = await getAdByType('banner');
            if (config && config.placement.includes(placement) && config.ad_key) {
                setAdConfig(config);
            }
        }
        loadAd();
    }, [placement]);

    useEffect(() => {
        if (!adConfig?.ad_key) return;

        try {
            // @ts-ignore
            (window.atOptions = window.atOptions || []).push({
                key: adConfig.ad_key,
                format: 'iframe',
                height: 90,
                width: 728,
                params: {}
            });
        } catch (e) {
            console.error('Adsterra Banner Error:', e);
        }
    }, [adConfig]);

    if (!adConfig?.ad_key) return null;

    const scriptUrl = adConfig.ad_script_url.replace('{KEY}', adConfig.ad_key);

    return (
        <div className="adsterra-banner my-4 flex justify-center">
            <script
                type="text/javascript"
                src={scriptUrl}
                async
            />
        </div>
    );
}

// Native Banner (in-feed ads)
export function AdsterraNativeBanner({ placement = 'homepage' }: { placement?: string }) {
    const [adConfig, setAdConfig] = useState<AdConfig | null>(null);

    useEffect(() => {
        async function loadAd() {
            const config = await getAdByType('native');
            if (config && config.placement.includes(placement) && config.ad_key) {
                setAdConfig(config);
            }
        }
        loadAd();
    }, [placement]);

    useEffect(() => {
        if (!adConfig?.ad_key) return;

        try {
            // @ts-ignore
            (window.atOptions = window.atOptions || []).push({
                key: adConfig.ad_key,
                format: 'iframe',
                height: 250,
                width: 300,
                params: {}
            });
        } catch (e) {
            console.error('Adsterra Native Error:', e);
        }
    }, [adConfig]);

    if (!adConfig?.ad_key) return null;

    const scriptUrl = adConfig.ad_script_url.replace('{KEY}', adConfig.ad_key);

    return (
        <div className="adsterra-native my-4">
            <script
                type="text/javascript"
                src={scriptUrl}
                async
            />
        </div>
    );
}

// Social Bar (bottom sticky)
export function AdsterraSocialBar({ placement = 'homepage' }: { placement?: string }) {
    const [adConfig, setAdConfig] = useState<AdConfig | null>(null);

    useEffect(() => {
        async function loadAd() {
            const config = await getAdByType('social_bar');
            if (config && config.placement.includes(placement) && config.ad_key) {
                setAdConfig(config);
            }
        }
        loadAd();
    }, [placement]);

    useEffect(() => {
        if (!adConfig?.ad_key) return;

        const scriptUrl = adConfig.ad_script_url.replace('{KEY}', adConfig.ad_key);
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [adConfig]);

    if (!adConfig?.ad_key) return null;

    return <div id={`container-${adConfig.ad_key}`}></div>;
}

// Popunder (opens in background)
export function AdsterraPopunder({ placement = 'homepage' }: { placement?: string }) {
    const [adConfig, setAdConfig] = useState<AdConfig | null>(null);

    useEffect(() => {
        async function loadAd() {
            const config = await getAdByType('popunder');
            if (config && config.placement.includes(placement) && config.ad_key) {
                setAdConfig(config);
            }
        }
        loadAd();
    }, [placement]);

    useEffect(() => {
        if (!adConfig?.ad_key) return;

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = `
            atOptions = {
                'key': '${adConfig.ad_key}',
                'format': 'iframe',
                'height': 60,
                'width': 468,
                'params': {}
            };
        `;
        document.body.appendChild(script);

        const scriptUrl = adConfig.ad_script_url.replace('{KEY}', adConfig.ad_key);
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = scriptUrl;
        invokeScript.async = true;
        document.body.appendChild(invokeScript);

        return () => {
            if (script.parentNode) script.parentNode.removeChild(script);
            if (invokeScript.parentNode) invokeScript.parentNode.removeChild(invokeScript);
        };
    }, [adConfig]);

    return null; // Popunder doesn't need visible element
}

// Smartlink (full page interstitial)
export function AdsterraSmartlink({ placement = 'homepage' }: { placement?: string }) {
    const [adConfig, setAdConfig] = useState<AdConfig | null>(null);

    useEffect(() => {
        async function loadAd() {
            const config = await getAdByType('smartlink');
            if (config && config.placement.includes(placement) && config.ad_key) {
                setAdConfig(config);
            }
        }
        loadAd();
    }, [placement]);

    useEffect(() => {
        if (!adConfig?.ad_key) return;

        const scriptUrl = adConfig.ad_script_url.replace('{KEY}', adConfig.ad_key);
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = scriptUrl;
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [adConfig]);

    return null;
}

// Ad Container Wrapper (responsive)
export function AdContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`ad-container bg-zinc-800/30 rounded-lg p-4 my-6 ${className}`}>
            <p className="text-gray-500 text-xs text-center mb-2">Advertisement</p>
            {children}
        </div>
    );
}
