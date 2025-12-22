import crypto from 'crypto';

/**
 * Generate signed URL untuk streaming yang expire
 * Prevents direct link sharing & sniffing
 */

const SECRET_KEY = process.env.STREAMING_SECRET_KEY || 'your-super-secret-key-change-this';

interface SignedUrlOptions {
    url: string;
    expiresIn?: number; // seconds, default 1 hour
    userId?: string;
    ipAddress?: string;
}

/**
 * Generate signed streaming URL
 */
export function generateSignedUrl(options: SignedUrlOptions): string {
    const {
        url,
        expiresIn = 3600, // 1 hour default
        userId,
        ipAddress,
    } = options;

    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    // Create signature data
    const signatureData = {
        url,
        expiresAt,
        userId: userId || 'anonymous',
        ip: ipAddress || 'unknown',
    };

    // Generate signature
    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(JSON.stringify(signatureData))
        .digest('hex');

    // Encode data
    const token = Buffer.from(JSON.stringify({
        ...signatureData,
        signature,
    })).toString('base64url');

    return token;
}

/**
 * Verify signed URL
 */
export function verifySignedUrl(token: string, currentIp?: string): {
    valid: boolean;
    url?: string;
    error?: string;
} {
    try {
        // Decode token
        const decoded = JSON.parse(
            Buffer.from(token, 'base64url').toString('utf-8')
        );

        const { url, expiresAt, userId, ip, signature } = decoded;

        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (now > expiresAt) {
            return { valid: false, error: 'URL has expired' };
        }

        // Verify signature
        const signatureData = { url, expiresAt, userId, ip };
        const expectedSignature = crypto
            .createHmac('sha256', SECRET_KEY)
            .update(JSON.stringify(signatureData))
            .digest('hex');

        if (signature !== expectedSignature) {
            return { valid: false, error: 'Invalid signature' };
        }

        // Optional: Check IP (strict mode)
        // if (currentIp && ip !== 'unknown' && ip !== currentIp) {
        //     return { valid: false, error: 'IP mismatch' };
        // }

        return { valid: true, url };
    } catch (error) {
        return { valid: false, error: 'Invalid token format' };
    }
}

/**
 * Obfuscate URL - hide original URL from client
 */
export function obfuscateStreamUrl(playlistId: string): string {
    // Return proxy URL instead of direct URL
    return `/api/stream/${playlistId}`;
}
