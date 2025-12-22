"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Adsterra Ads Components - Fixed for placement array handling
 */

interface AdConfig {
    ad_type: string;
    ad_script: string;
    is_enabled: boolean;
    placement: string[] | string; // Handle both array and string
}

// Cache for ad configs
let adsConfigCache: AdConfig[] | null = null;

// Fetch ads configuration from database
async function getAdsConfig(): Promise<AdConfig[]> {
    if (adsConfigCache) {
        console.log('📦 Using cached ads config:', adsConfigCache);
        return adsConfigCache;
    }

    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('ads_config')
            .select('*');  // Select ALL to see what we get

        if (error) {
            console.error('❌ Supabase error fetching ads:', error);
            throw error;
        }

        console.log('✅ RAW data from database:', data);

        // Filter enabled ads
        const enabledAds = (data as AdConfig[] || []).filter((ad: AdConfig) => ad.is_enabled === true);
        console.log('✅ Enabled ads after filter:', enabledAds);

        adsConfigCache = enabledAds;
        return adsConfigCache;
    } catch (error) {
        console.error('❌ Error fetching ads config:', error);
        return [];
    }
}

// Get specific ad config by type
async function getAdByType(type: string, placement: string): Promise<AdConfig | null> {
    const ads = await getAdsConfig();
    const ad = ads.find(ad => ad.ad_type === type);

    console.log(`🔍 Looking for ad type: ${type}, placement: ${placement}`);
    console.log(`   Found ad:`, ad);

    if (!ad) {
        console.log(`❌ No ad config found for type: ${type}`);
        return null;
    }

    // Check placement - handle both array and string
    let placementMatch = false;

    if (Array.isArray(ad.placement)) {
        placementMatch = ad.placement.includes(placement);
        console.log(`   Placement is array:`, ad.placement, `includes '${placement}':`, placementMatch);
    } else if (typeof ad.placement === 'string') {
        // If it's a string, try to parse or check contains
        try {
            const parsed = JSON.parse(ad.placement);
            if (Array.isArray(parsed)) {
                placementMatch = parsed.includes(placement);
                console.log(`   Placement was JSON string, parsed:`, parsed, `includes '${placement}':`, placementMatch);
            }
        } catch {
            // Not JSON, check if string contains the placement
            placementMatch = ad.placement.includes(placement);
            console.log(`   Placement is plain string:`, ad.placement, `contains '${placement}':`, placementMatch);
        }
    } else {
        console.log(`   Placement is undefined or null!`);
    }

    const hasScript = !!(ad.ad_script && ad.ad_script.trim().length > 0);
    console.log(`   Has script: ${hasScript}, Is enabled: ${ad.is_enabled}, Placement match: ${placementMatch}`);

    // Return if all conditions met
    if (ad.is_enabled && hasScript && placementMatch) {
        console.log(`✅ Ad ${type} WILL SHOW on ${placement}`);
        return ad;
    }

    console.log(`❌ Ad ${type} will NOT show - enabled: ${ad.is_enabled}, has script: ${hasScript}, placement match: ${placementMatch}`);
    return null;
}

// Clear cache
export function clearAdsCache() {
    console.log('🧹 Clearing ads cache');
    adsConfigCache = null;
}

// Generic Ad Component
function AdComponent({ type, placement }: { type: string; placement: string }) {
    const [config, setConfig] = useState<AdConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scriptError, setScriptError] = useState(false);

    // Reserved heights for common ad types to prevent CLS
    const minHeight = type === 'banner' ? '90px' : type === 'native' ? '250px' : '0px';

    useEffect(() => {
        let isMounted = true;
        async function loadAd() {
            try {
                // Clear previous state
                setLoading(true);
                setScriptError(false);
                const adConfig = await getAdByType(type, placement);
                if (isMounted) {
                    setConfig(adConfig);
                    setLoading(false);
                }
            } catch (err) {
                console.error(`❌ Error loading ad config for ${type}:`, err);
                if (isMounted) setLoading(false);
            }
        }
        loadAd();
        return () => { isMounted = false; };
    }, [type, placement]);

    useEffect(() => {
        if (!config?.ad_script || !containerRef.current) return;

        // Use a data attribute to prevent double-injection in Dev mode
        if (containerRef.current.dataset.lastScript === btoa(config.ad_script.substring(0, 100))) {
            return;
        }
        containerRef.current.dataset.lastScript = btoa(config.ad_script.substring(0, 100));

        console.log(`🎬 Injecting ${type} ad for ${placement}`);

        // Clear previous content
        containerRef.current.innerHTML = '';

        try {
            // Using Range handles script execution better in some contexts
            const range = document.createRange();
            range.selectNode(containerRef.current);
            const fragment = range.createContextualFragment(config.ad_script);

            // Extract scripts so we can execute them manually and reliably
            const scripts = Array.from(fragment.querySelectorAll('script'));
            scripts.forEach(s => s.remove()); // Remove from fragment

            // Append non-script elements
            containerRef.current.appendChild(fragment);

            // Execute scripts in order
            scripts.forEach((oldScript) => {
                const newScript = document.createElement('script');

                // Copy all attributes
                Array.from(oldScript.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });

                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;

                    // Special handling for atOptions to ensure global availability
                    if (oldScript.textContent?.includes('atOptions')) {
                        try {
                            const evalFn = new Function(oldScript.textContent);
                            evalFn();
                        } catch (e) {
                            console.warn("atOptions eval failed:", e);
                        }
                    }
                }

                // Append to container to run
                containerRef.current?.appendChild(newScript);
            });

            console.log(`✅ ${type} ad injected successfully`);
        } catch (err) {
            console.error(`❌ Error injecting ${type} ad:`, err);
            setScriptError(true);
        }
    }, [config, type, placement]);

    if (loading) {
        return (
            <div
                style={{ minHeight }}
                className="w-full flex flex-col items-center justify-center bg-zinc-900/10 rounded-lg border border-zinc-800/20"
            >
                <div className="w-8 h-8 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!config || scriptError) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className={`adsterra-ad adsterra-${type} w-full flex justify-center`}
            id={`adsterra-container-${type}-${placement}`}
            style={{ minHeight }}
        />
    );
}

// Banner Ad
export function AdsterraBanner({ placement = 'homepage' }: { placement?: string }) {
    return <AdComponent type="banner" placement={placement} />;
}

// Native Banner
export function AdsterraNativeBanner({ placement = 'homepage' }: { placement?: string }) {
    return <AdComponent type="native" placement={placement} />;
}

// Social Bar
export function AdsterraSocialBar({ placement = 'homepage' }: { placement?: string }) {
    return <AdComponent type="social_bar" placement={placement} />;
}

// Popunder
export function AdsterraPopunder({ placement = 'homepage' }: { placement?: string }) {
    return <AdComponent type="popunder" placement={placement} />;
}

// Smartlink
export function AdsterraSmartlink({ placement = 'homepage' }: { placement?: string }) {
    return <AdComponent type="smartlink" placement={placement} />;
}

// Ad Container Wrapper
export function AdContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`ad-container bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 my-8 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:border-red-600/30 ${className}`}>
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-red-600 to-transparent opacity-30 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-600/5 blur-3xl rounded-full"></div>

            <div className="flex items-center justify-center gap-2 mb-4 opacity-50 group-hover:opacity-80 transition-opacity">
                <div className="h-[1px] w-8 bg-zinc-700"></div>
                <p className="text-zinc-500 text-[9px] uppercase tracking-[0.2em] font-bold text-center">
                    Premium Sponsorship
                </p>
                <div className="h-[1px] w-8 bg-zinc-700"></div>
            </div>

            <div className="flex justify-center items-center w-full">
                {children}
            </div>
        </div>
    );
}
