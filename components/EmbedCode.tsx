"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface EmbedCode {
    id: string;
    name: string;
    code: string;
    placement: 'header' | 'body_start' | 'body_end' | 'footer';
    page_target: string;
    priority: number;
}

// Cache for embed codes
let embedCodesCache: EmbedCode[] | null = null;

async function getEmbedCodes(placement: string, pageTarget: string = 'all'): Promise<EmbedCode[]> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('embed_codes')
            .select('*')
            .eq('is_enabled', true)
            .eq('placement', placement)
            .or(`page_target.eq.all,page_target.eq.${pageTarget}`)
            .order('priority', { ascending: false });

        if (error) {
            console.error('Error fetching embed codes:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching embed codes:', error);
        return [];
    }
}

interface EmbedCodeInjectorProps {
    placement: 'header' | 'body_start' | 'body_end' | 'footer';
    pageTarget?: string;
}

export function EmbedCodeInjector({ placement, pageTarget = 'all' }: EmbedCodeInjectorProps) {
    const [embedCodes, setEmbedCodes] = useState<EmbedCode[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [injected, setInjected] = useState(false);

    useEffect(() => {
        async function loadEmbedCodes() {
            const codes = await getEmbedCodes(placement, pageTarget);
            setEmbedCodes(codes);
        }
        loadEmbedCodes();
    }, [placement, pageTarget]);

    useEffect(() => {
        if (!containerRef.current || embedCodes.length === 0 || injected) return;

        embedCodes.forEach((embedCode) => {
            try {
                // Create a temporary container
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = embedCode.code;

                // Process scripts specially
                const scripts = tempDiv.querySelectorAll('script');
                scripts.forEach((oldScript) => {
                    const newScript = document.createElement('script');
                    
                    // Copy attributes
                    Array.from(oldScript.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });

                    if (oldScript.src) {
                        newScript.src = oldScript.src;
                    } else {
                        newScript.textContent = oldScript.textContent;
                    }

                    // For header placement, append to head
                    if (placement === 'header') {
                        document.head.appendChild(newScript);
                    } else {
                        containerRef.current?.appendChild(newScript);
                    }
                    
                    oldScript.remove();
                });

                // Append non-script elements
                while (tempDiv.firstChild) {
                    if (placement === 'header') {
                        // For header, append styles/links/meta to head
                        const node = tempDiv.firstChild as Element;
                        if (node.tagName === 'STYLE' || node.tagName === 'LINK' || node.tagName === 'META') {
                            document.head.appendChild(node);
                        } else {
                            containerRef.current?.appendChild(node);
                        }
                    } else {
                        containerRef.current?.appendChild(tempDiv.firstChild);
                    }
                }

                console.log(`✅ Injected embed code: ${embedCode.name}`);
            } catch (error) {
                console.error(`❌ Error injecting embed code ${embedCode.name}:`, error);
            }
        });

        setInjected(true);
    }, [embedCodes, placement, injected]);

    return <div ref={containerRef} className="embed-code-container" style={{ display: 'contents' }} />;
}

// Header Embed Codes Component
export function HeaderEmbedCodes({ pageTarget = 'all' }: { pageTarget?: string }) {
    return <EmbedCodeInjector placement="header" pageTarget={pageTarget} />;
}

// Body Start Embed Codes Component
export function BodyStartEmbedCodes({ pageTarget = 'all' }: { pageTarget?: string }) {
    return <EmbedCodeInjector placement="body_start" pageTarget={pageTarget} />;
}

// Body End Embed Codes Component
export function BodyEndEmbedCodes({ pageTarget = 'all' }: { pageTarget?: string }) {
    return <EmbedCodeInjector placement="body_end" pageTarget={pageTarget} />;
}

// Footer Embed Codes Component
export function FooterEmbedCodes({ pageTarget = 'all' }: { pageTarget?: string }) {
    return <EmbedCodeInjector placement="footer" pageTarget={pageTarget} />;
}
