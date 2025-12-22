"use client";

import { useEffect, useState } from 'react';
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
        const enabledAds = (data || []).filter(ad => ad.is_enabled === true);
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
    const [adHtml, setAdHtml] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAd() {
            console.log(`🚀 Loading ad: type=${type}, placement=${placement}`);
            setLoading(true);

            const config = await getAdByType(type, placement);

            if (config?.ad_script) {
                const cleanScript = config.ad_script.trim();
                console.log(`✅ Setting ad HTML for ${type}:`, cleanScript.substring(0, 100) + '...');
                setAdHtml(cleanScript);
            } else {
                console.log(`⚠️ No ad script found for ${type} on ${placement}`);
            }

            setLoading(false);
        }
        loadAd();
    }, [type, placement]);

    if (loading) {
        console.log(`⏳ ${type} ad still loading...`);
    }

    if (!adHtml) {
        console.log(`❌ ${type} ad - no HTML to render`);
        return null;
    }

    console.log(`🎨 Rendering ${type} ad with ${adHtml.length} characters`);

    return (
        <div
            className="adsterra-ad"
            dangerouslySetInnerHTML={{ __html: adHtml }}
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
        <div className={`ad-container bg-zinc-800/30 rounded-lg p-4 my-6 ${className}`}>
            <p className="text-gray-500 text-xs text-center mb-2">Advertisement</p>
            {children}
        </div>
    );
}
