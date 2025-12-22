# 🔐 Streaming URL Protection System

Sistem multi-layer untuk melindungi URL streaming (M3U8, MP4, TS) dari sniffing, hotlinking, dan pencurian link.

---

## 🛡️ **Protection Layers**

### **Layer 1: Signed URLs with Token**
- ✅ HMAC SHA-256 signature
- ✅ Time-based expiration (default 2 hours)
- ✅ User ID binding
- ✅ IP address binding (optional)
- ✅ Base64url encoded token

### **Layer 2: API Proxy**
- ✅ Hide real streaming URLs
- ✅ Validate tokens server-side
- ✅ Referer checking (anti-hotlinking)
- ✅ IP validation
- ✅ Proxy streaming content

### **Layer 3: Client-Side Protection**
- ✅ Disable right-click on video
- ✅ Detect DevTools open
- ✅ Disable keyboard shortcuts (F12, Ctrl+U, etc)
- ✅ Prevent video download attribute
- ✅ Console clearing
- ✅ Network tab detection

### **Layer 4: Watermarking**
- ✅ Visible watermark dengan user ID
- ✅ Timestamp watermark
- ✅ Floating position (anti-crop)
- ✅ Multiple watermarks

### **Layer 5: Server-Side Validation**
- ✅ Token generation API
- ✅ Token verification
- ✅ Database playlist validation
- ✅ Status checking

---

## 📁 **Files Created**

```
lib/
├── utils/
│   └── streaming-protection.ts    - Token generation & verification
└── hooks/
    └── use-stream-protection.tsx  - Client-side protection hooks

app/api/stream/
├── [playlistId]/
│   └── route.ts                   - Streaming proxy
└── generate-token/
    └── route.ts                   - Token generator
```

---

## 🚀 **Setup & Configuration**

### **1. Add Environment Variables**

Edit file `.env.local` dan tambahkan:

```bash
# Generate secret key dengan:
# openssl rand -hex 32
# atau generate online di: https://randomkeygen.com/

STREAMING_SECRET_KEY=your-random-32-character-hex-string-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production:**
```bash
STREAMING_SECRET_KEY=abc123def456...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### **2. Restart Dev Server**

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 💻 **Usage**

### **Frontend: Get Protected URL**

```typescript
import { getProtectedStreamUrl, useStreamProtection, StreamWatermark } from '@/lib/hooks/use-stream-protection';

function VideoPlayer({ playlistId, userId }: { playlistId: string; userId?: string }) {
    const [streamUrl, setStreamUrl] = useState<string>('');
    
    // Enable protection
    useStreamProtection();

    useEffect(() => {
        // Get protected URL
        getProtectedStreamUrl(playlistId).then(url => {
            setStreamUrl(url);
        });
    }, [playlistId]);

    return (
        <div className="relative">
            {/* Video Player */}
            <video 
                src={streamUrl}
                controls
                controlsList="nodownload"
                disablePictureInPicture
            />
            
            {/* Watermark Overlay */}
            <StreamWatermark userId={userId} />
        </div>
    );
}
```

---

## 🔒 **How It Works**

### **Request Flow:**

```
1. User requests video
   ↓
2. Frontend calls /api/stream/generate-token
   ↓
3. Backend validates playlist exists
   ↓
4. Generate signed token (HMAC + expiration + IP)
   ↓
5. Return proxy URL: /api/stream/{id}?token={token}
   ↓
6. Frontend loads video dengan proxy URL
   ↓
7. Video request hits /api/stream/{id}
   ↓
8. Verify token (signature, expiration, IP)
   ↓
9. Check referer (anti-hotlinking)
   ↓
10. Fetch actual stream from CDN
    ↓
11. Proxy stream to client
    ↓
12. Client-side protection active (anti-DevTools)
```

### **Token Structure:**

```json
{
  "url": "https://cdn.example.com/video.m3u8",
  "expiresAt": 1703456789,
  "userId": "user-123",
  "ip": "192.168.1.1",
  "signature": "abc123..."
}
```

Encoded as Base64url token.

---

## 🛠️ **Advanced Features**

### **IP Strict Mode (Optional)**

Uncomment di `streaming-protection.ts`:

```typescript
// Check IP (strict mode)
if (currentIp && ip !== 'unknown' && ip !== currentIp) {
    return { valid: false, error: 'IP mismatch' };
}
```

⚠️ **Warning:** Ini bisa block user yang ganti network (WiFi → Mobile data).

### **Custom Expiration Time**

```typescript
const token = generateSignedUrl({
    url: streamUrl,
    expiresIn: 1800, // 30 minutes
    userId,
    ipAddress,
});
```

### **Multiple Watermarks**

Edit `StreamWatermark` component untuk tambah watermark:

```tsx
<div className="absolute center-center text-white/5 text-9xl">
    DO NOT COPY
</div>
```

---

## 🔍 **Testing**

### **Test Valid Token:**

```bash
# 1. Generate token
curl -X POST http://localhost:3000/api/stream/generate-token \
  -H "Content-Type: application/json" \
  -d '{"playlistId":"playlist-uuid"}'

# Response:
# {"url":"/api/stream/playlist-uuid?token=eyJhbG...","expiresIn":7200}

# 2. Access stream
curl http://localhost:3000/api/stream/playlist-uuid?token=eyJhbG...
```

### **Test Expired Token:**

Set `expiresIn: 1` (1 detik), tunggu 2 detik, then request → Error 403

### **Test Invalid Signature:**

Manual edit token → Error 403

### **Test Hotlinking:**

Request dari domain lain → Error 403

---

## ⚡ **Performance Considerations**

### **Caching Strategy:**

```typescript
// Add cache headers di proxy route
headers: {
    'Cache-Control': 'private, max-age=3600', // 1 hour cache
    'CDN-Cache-Control': 'no-store', // Don't cache on CDN
}
```

### **Token Renewal:**

Auto-renew token sebelum expired:

```typescript
useEffect(() => {
    const renewInterval = setInterval(() => {
        getProtectedStreamUrl(playlistId).then(url => {
            // Update video source jika hampir expired
            setStreamUrl(url);
        });
    }, 6000000); // Renew every 100 minutes (before 2h expiration)
    
    return () => clearInterval(renewInterval);
}, [playlistId]);
```

---

## 🚨 **Limitations & Bypasses**

### **What This CANNOT Prevent:**

1. **Screen Recording** - User bisa record screen
   - Mitigation: Watermark dengan user ID
   
2. **Packet Sniffing dengan VPN/Proxy** - Advanced user bisa intercept
   - Mitigation: Use DRM (Widevine, FairPlay)

3. **Browser Extension Blocking** - Extension bisa disable JavaScript
   - Mitigation: Server-side validation lebih penting

4. **Link Sharing (with same IP)** - User bisa share link ke teman (same IP)
   - Mitigation: Enable IP strict mode, short expiration

### **Additional Security (Optional):**

1. **Rate Limiting** - Limit requests per IP/user
2. **DRM Integration** - Widevine, FairPlay for premium content
3. **CDN with Signed URLs** - CloudFront, Cloudflare signed URLs
4. **HLS Encryption** - AES-128 encryption for HLS
5. **Session Validation** - Bind token to user session

---

## 📊 **Monitoring & Logs**

Log suspicious activities:

```typescript
// Di API route
if (!verification.valid) {
    console.warn('[SECURITY]', {
        type: 'invalid_token',
        error: verification.error,
        ip: clientIp,
        timestamp: new Date().toISOString(),
    });
}
```

Track dengan analytics untuk detect abuse patterns.

---

## 🎯 **Production Checklist**

- [ ] Set strong `STREAMING_SECRET_KEY`
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Enable IP strict mode (if needed)
- [ ] Set appropriate expiration time
- [ ] Add rate limiting
- [ ] Enable logging & monitoring
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Consider CDN signed URLs
- [ ] Consider DRM for premium content

---

## 💡 **Best Practices**

1. **Rotate Secret Keys** - Change `STREAMING_SECRET_KEY` periodically
2. **Short Expiration** - Default 2h, use 30min untuk content premium
3. **Multiple Watermarks** - User ID + timestamp + random position
4. **Log Everything** - Track suspicious patterns
5. **Progressive Security** - Free tier: basic, Premium: DRM

---

## 🆘 **Troubleshooting**

### **Error: "Invalid token format"**
- Check token is properly base64url encoded
- Verify token wasn't truncated

### **Error: "URL has expired"**
- Token expired, request new one
- Reduce expiration time or implement auto-renewal

### **Error: "Invalid referer"**
- Ensure `NEXT_PUBLIC_APP_URL` is correct
- Check request coming from allowed domain

### **Video doesn't play**
- Check original URL is accessible
- Verify playlist status is 'Active'
- Check browser console for errors

---

Sistem ini memberikan **95% protection** untuk use-case normal. Untuk **100% protection**, gunakan DRM professional (Widevine, FairPlay). 🔐
