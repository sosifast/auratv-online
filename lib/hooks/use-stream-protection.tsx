"use client";

import { useEffect, useRef } from 'react';

/**
 * Anti-DevTools & Anti-Sniffing Protection
 * Detects and prevents common sniffing techniques
 */

export function useStreamProtection() {
    const protectionActive = useRef(false);

    useEffect(() => {
        if (protectionActive.current) return;
        protectionActive.current = true;

        // 1. Disable right-click on video
        const disableContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'VIDEO' || target.closest('video')) {
                e.preventDefault();
                return false;
            }
        };

        // 2. Detect DevTools open
        let devtoolsOpen = false;
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    console.clear();
                    console.log('%c⛔ STOP!', 'color: red; font-size: 50px; font-weight: bold;');
                    console.log('%c⚠️ This is a browser feature intended for developers.', 'font-size: 16px;');
                    console.log('%c🚫 Copying streaming URLs is prohibited and may result in account suspension.', 'font-size: 14px; color: orange;');
                }
            } else {
                devtoolsOpen = false;
            }
        };

        // 3. Prevent video download attribute
        const preventDownload = () => {
            document.querySelectorAll('video').forEach(video => {
                video.removeAttribute('download');
                video.setAttribute('controlsList', 'nodownload');
                video.setAttribute('disablePictureInPicture', 'true');
            });
        };

        // 4. Disable common keyboard shortcuts
        const disableShortcuts = (e: KeyboardEvent) => {
            // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'U')
            ) {
                e.preventDefault();
                return false;
            }
        };

        // 5. Clear console periodically
        const consoleClearer = setInterval(() => {
            if (devtoolsOpen) {
                console.clear();
            }
        }, 1000);

        // 6. Detect network tab inspection
        const detectNetworkTab = () => {
            const img = new Image();
            Object.defineProperty(img, 'id', {
                get: function () {
                    // Someone is inspecting, clear sensitive data
                    console.clear();
                    throw new Error('Inspection detected');
                }
            });
            console.log('%c ', img);
        };

        // Attach listeners
        document.addEventListener('contextmenu', disableContextMenu);
        document.addEventListener('keydown', disableShortcuts);

        // Detection intervals
        const devToolsInterval = setInterval(detectDevTools, 500);
        const downloadInterval = setInterval(preventDownload, 1000);

        // Initial check
        detectDevTools();
        preventDownload();
        detectNetworkTab();

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', disableContextMenu);
            document.removeEventListener('keydown', disableShortcuts);
            clearInterval(devToolsInterval);
            clearInterval(downloadInterval);
            clearInterval(consoleClearer);
            protectionActive.current = false;
        };
    }, []);
}

/**
 * Watermark Component
 * Adds visible watermark to prevent screen recording
 */
export function StreamWatermark({ userId }: { userId?: string }) {
    return (
        <div className="absolute inset-0 pointer-events-none z-50">
            {/* Floating watermark */}
            <div className="absolute top-4 right-4 bg-black/50 text-white/60 px-3 py-1 rounded text-xs font-mono animate-pulse">
                AuraTV • {userId || 'Guest'} • {new Date().toLocaleTimeString()}
            </div>

            {/* Random positioned watermarks */}
            <div className="absolute top-1/4 left-1/4 text-white/10 text-6xl font-bold rotate-[-30deg]">
                AuraTV
            </div>
            <div className="absolute bottom-1/4 right-1/4 text-white/10 text-6xl font-bold rotate-[30deg]">
                AuraTV
            </div>
        </div>
    );
}

/**
 * Generate protected streaming URL
 */
export async function getProtectedStreamUrl(playlistId: string): Promise<string> {
    try {
        const response = await fetch('/api/stream/generate-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlistId }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate stream token');
        }

        const { url } = await response.json();
        return url;
    } catch (error) {
        console.error('Error generating protected URL:', error);
        throw error;
    }
}
