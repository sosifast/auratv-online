import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return new Response('Missing url parameter', { status: 400 });
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': new URL(targetUrl).origin,
                'Origin': new URL(targetUrl).origin,
            },
        });

        if (!response.ok) {
            return new Response(`Failed to fetch: ${response.statusText}`, { status: response.status });
        }

        const contentType = response.headers.get('Content-Type') || '';
        const isM3U8 = targetUrl.toLowerCase().split('?')[0].endsWith('.m3u8') || contentType.includes('mpegurl') || contentType.includes('application/x-mpegURL');

        if (isM3U8) {
            let text = await response.text();
            const urlObj = new URL(targetUrl);
            const baseUrl = urlObj.origin + urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1);
            const origin = new URL(request.url).origin;

            // Rewrite relative and absolute URLs in M3U8 to go through proxy
            const rewrittenText = text.split('\n').map(line => {
                if (line.trim() && !line.startsWith('#')) {
                    let fullUrl = line.trim();
                    if (!fullUrl.startsWith('http')) {
                        // Convert relative to absolute first
                        fullUrl = new URL(fullUrl, baseUrl).href;
                    }
                    // Wrap with proxy
                    return `${origin}/api/proxy?url=${encodeURIComponent(fullUrl)}`;
                }
                return line;
            }).join('\n');

            return new Response(rewrittenText, {
                status: 200,
                headers: {
                    'Content-Type': 'application/vnd.apple.mpegurl',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache',
                },
            });
        }

        // For video segments (.ts) and other files
        const body = await response.arrayBuffer();
        return new Response(body, {
            status: 200,
            headers: {
                'Content-Type': contentType || 'video/MP2T',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
