import { NextRequest, NextResponse } from 'next/server';
import { generateSignedUrl } from '@/lib/utils/streaming-protection';
import { createClient } from '@/lib/supabase/server';

/**
 * Generate signed token for streaming
 * Route: POST /api/stream/generate-token
 */

export async function POST(request: NextRequest) {
    try {
        const { playlistId } = await request.json();

        if (!playlistId) {
            return NextResponse.json(
                { error: 'Playlist ID required' },
                { status: 400 }
            );
        }

        // Get user from session (if authenticated)
        const supabase = createClient();
        let userId = 'anonymous';

        // Try to get user from localStorage (if you have auth)
        // const { data: { user } } = await supabase.auth.getUser();
        // userId = user?.id || 'anonymous';

        // Get client IP
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Verify playlist exists
        const { data: playlist, error } = await supabase
            .from('streaming_playlist')
            .select('id, url_streaming')
            .eq('id', playlistId)
            .eq('status', 'Active')
            .single();

        if (error || !playlist) {
            return NextResponse.json(
                { error: 'Playlist not found or inactive' },
                { status: 404 }
            );
        }

        // Generate signed URL (expires in 2 hours)
        const token = generateSignedUrl({
            url: playlist.url_streaming,
            expiresIn: 7200, // 2 hours
            userId,
            ipAddress,
        });

        // Return proxy URL with token
        const proxyUrl = `/api/stream/${playlistId}?token=${token}`;

        return NextResponse.json({
            url: proxyUrl,
            expiresIn: 7200,
        });

    } catch (error) {
        console.error('Token generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        );
    }
}
