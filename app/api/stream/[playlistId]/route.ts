import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySignedUrl } from '@/lib/utils/streaming-protection';

/**
 * API Proxy untuk streaming
 * Prevents direct URL exposure
 * Route: /api/stream/[playlistId]
 */

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ playlistId: string }> }
) {
    try {
        const params = await props.params;
        const { playlistId } = params;

        // Get token from query params
        const token = request.nextUrl.searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized: Missing token' },
                { status: 401 }
            );
        }

        // Get client IP
        const clientIp = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Verify token
        const verification = verifySignedUrl(token, clientIp);

        if (!verification.valid) {
            return NextResponse.json(
                { error: `Unauthorized: ${verification.error}` },
                { status: 403 }
            );
        }

        // Get playlist from database
        const supabase = await createClient();
        const { data: playlist, error } = await supabase
            .from('streaming_playlist')
            .select('url_streaming, type_streaming, status')
            .eq('id', playlistId)
            .eq('status', 'Active')
            .single();

        if (error || !playlist) {
            return NextResponse.json(
                { error: 'Playlist not found' },
                { status: 404 }
            );
        }

        // Check referer (anti-hotlinking)
        const referer = request.headers.get('referer');
        const allowedDomains = [
            process.env.NEXT_PUBLIC_APP_URL,
            'localhost:3000',
            '127.0.0.1:3000',
        ];

        const isValidReferer = referer && allowedDomains.some(domain =>
            domain && referer.includes(domain)
        );

        if (!isValidReferer && process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { error: 'Invalid referer' },
                { status: 403 }
            );
        }

        // Fetch actual streaming content
        const streamingResponse = await fetch(playlist.url_streaming, {
            headers: {
                'User-Agent': request.headers.get('user-agent') || 'AuraTV-Proxy',
            },
        });

        if (!streamingResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch stream' },
                { status: 500 }
            );
        }

        // Get content type
        const contentType = streamingResponse.headers.get('content-type') ||
            getContentType(playlist.type_streaming);

        // Stream the response
        const blob = await streamingResponse.blob();

        return new NextResponse(blob, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'SAMEORIGIN',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
            },
        });

    } catch (error) {
        console.error('Stream proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function getContentType(type: string): string {
    switch (type) {
        case 'mp4':
            return 'video/mp4';
        case 'm3u8':
            return 'application/vnd.apple.mpegurl';
        case 'ts':
            return 'video/mp2t';
        default:
            return 'application/octet-stream';
    }
}
