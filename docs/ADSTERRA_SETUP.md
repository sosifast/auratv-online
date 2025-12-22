# 🎯 Adsterra Ads Integration Guide

Complete guide untuk mengintegrasikan Adsterra ads di AuraTV aplikasi Anda.

---

## 📋 **Setup Overview**

Ads telah ditambahkan ke 3 halaman utama:
1. **Homepage** (`app/page.tsx`) 
2. **Play Page** (`app/play/[slug]/page.tsx`)
3. **Category Page** (`app/category/[slug]/page.tsx`)

---

## 🔑 **Ad Types Integrated**

### **1. Banner Ad** (728x90)
- Top banner ads
- Responsive
- Lokasi: After hero section

### **2. Native Banner** (In-Feed)
- Blend with content
- Non-intrusive
- Lokasi: Between sections

### **3. Social Bar** (Sticky Bottom)
- Always visible at bottom
- Mobile-friendly
- Persistent across pages

### **4. Popunder**
- Opens in background
- Once per session
- Non-disruptive

### **5. Smartlink** (Interstitial)
- Full-page ad
- Triggered on page load
- High CPM

---

## 🚀 **Quick Setup (3 Steps)**

### **Step 1: Get Adsterra Keys**

1. **Login** to Adsterra Dashboard: https://publishers.adsterra.com/
2. **Create Ad Zones**:
   - Banner 728x90
   - Native Banner 300x250
   - Social Bar
   - Popunder
   - Smartlink
3. **Copy** each ad zone KEY

### **Step 2: Update Ad Keys**

Edit: `components/ads/AdsterraAds.tsx`

Replace placeholders:

```typescript
// Banner
key: 'YOUR_BANNER_KEY_HERE'
// Replace with: 'a1b2c3d4e5f6g7h8'

// Native
key: 'YOUR_NATIVE_KEY_HERE'
// Replace with: 'x9y8z7w6v5u4t3s2'

// Social Bar
YOUR_SOCIAL_BAR_KEY_HERE
// Replace with actual key

// Popunder
YOUR_POPUNDER_KEY_HERE
// Replace with actual key

// Smartlink
YOUR_SMARTLINK_KEY_HERE
// Replace with actual key
```

### **Step 3: Test**

```bash
npm run dev
```

Open browser → Check console for errors → Verify ads load

---

## 📍 **Ad Placements**

### **Homepage** (`app/page.tsx`)

```
┌─────────────────────────────────┐
│ Navbar                          │
├─────────────────────────────────┤
│ Hero Section                    │
├─────────────────────────────────┤
│ 📢 BANNER AD                    │ ← After Hero
├─────────────────────────────────┤
│ 🔥 Populer Content              │
├─────────────────────────────────┤
│ 📢 NATIVE BANNER #1             │ ← After Popular
├─────────────────────────────────┤
│ 📁 Category 1                   │
│ 📁 Category 2                   │
├─────────────────────────────────┤
│ 📢 NATIVE BANNER #2             │ ← Every 2 categories
├─────────────────────────────────┤
│ 📁 Category 3                   │
│ 📁 Category 4                   │
├─────────────────────────────────┤
│ 🆕 Recent Content               │
├─────────────────────────────────┤
│ Footer                          │
├─────────────────────────────────┤
│ 📌 SOCIAL BAR (Sticky)          │ ← Bottom Sticky
└─────────────────────────────────┘

💡 Popunder: Triggers on page load
💡 Smartlink: Interstitial on entry
```

### **Play Page** (`app/play/[slug]/page.tsx`)

```
┌─────────────────────────────────┐
│ 🎬 Video Player                 │
├─────────────────────────────────┤
│ 📢 BANNER AD                    │ ← Before Info
├─────────────────────────────────┤
│ ℹ️ Video Info + Playlist        │
├─────────────────────────────────┤
│ 📢 NATIVE BANNER                │ ← Before Recommendations
├─────────────────────────────────┤
│ 📺 Channel yang Sama            │
├─────────────────────────────────┤
│ 📢 NATIVE BANNER                │
├─────────────────────────────────┤
│ ⭐ Rekomendasi                  │
├─────────────────────────────────┤
│ 📢 NATIVE BANNER                │
├─────────────────────────────────┤
│ 🔥 Trending                     │
├─────────────────────────────────┤
│ 📌 SOCIAL BAR                   │
└─────────────────────────────────┘
```

### **Category Page** (`app/category/[slug]/page.tsx`)

```
┌─────────────────────────────────┐
│ Category Header                 │
├─────────────────────────────────┤
│ 📢 BANNER AD                    │
├─────────────────────────────────┤
│ Grid Content (12 items)         │
├─────────────────────────────────┤
│ 📢 NATIVE BANNER                │ ← Mid-page
├─────────────────────────────────┤
│ Grid Content (12 items)         │
├─────────────────────────────────┤
│ 📌 SOCIAL BAR                   │
└─────────────────────────────────┘
```

---

## 💰 **Expected Revenue**

### **Traffic-Based Estimates**

| Daily Visitors | Estimated CPM | Monthly Revenue |
|----------------|---------------|-----------------|
| 1,000          | $2-5          | $60-150         |
| 5,000          | $2-5          | $300-750        |
| 10,000         | $2-5          | $600-1,500      |
| 50,000         | $2-5          | $3,000-7,500    |
| 100,000        | $2-5          | $6,000-15,000   |

**Notes:**
- Popunder & Smartlink = Highest CPM ($5-15)
- Banner = Medium CPM ($1-3)
- Native = Medium CPM ($2-5)
- Social Bar = Low but consistent ($0.5-2)

---

## 🛠️ **Customization**

### **Ad Container Styling**

Edit `components/ads/AdsterraAds.tsx`:

```typescript
export function AdContainer({ children, className = '' }) {
    return (
        <div className={`
            bg-zinc-800/30      // Background
            rounded-lg          // Border radius
            p-4                 // Padding
            my-6                // Margin vertical
            ${className}
        `}>
            <p className="text-gray-500 text-xs text-center mb-2">
                Advertisement  // Label
            </p>
            {children}
        </div>
    );
}
```

### **Disable Specific Apps**

**Remove Popunder:**
```typescript
// Delete this line:
<AdsterraPopunder />
```

**Remove Social Bar:**
```typescript
// Delete this line:
<AdsterraSocialBar />
```

### **Adjust Ad Frequency**

**Homepage - Native Banner Every X Categories:**
```typescript
// Current: Every 2 categories
{index % 2 === 1 && (...)  

// Change to every 3:
{index % 3 === 2 && (...)

// Change to every category:
{true && (...)
```

---

## 📊 **Tracking & Analytics**

### **Check Ad Performance**

1. **Adsterra Dashboard**:
   - Impressions
   - Clicks
   - Revenue
   - CTR
   - eCPM

2. **Browser DevTools**:
   ```javascript
   // Check if ads loaded
   console.log(window.atOptions);
   ```

3. **Google Analytics** (Optional):
   Track ad views as custom events

---

## 🐛 **Troubleshooting**

### **Ads Not Showing**

**1. Check Keys**
```typescript
// Verify keys are correct (no quotes, no spaces)
key: 'abc123def456'  ✅
key: 'YOUR_KEY_HERE' ❌
```

**2. Check Console**
```
F12 → Console → Look for errors
"Failed to load resource" = Wrong key
"AdBlock detected" = User has adblock
```

**3. Test in Incognito**
```
Right-click → New Incognito Window
AdBlockers often disabled here
```

**4. Verify Domain**
```
Adsterra Dashboard → Settings
Add your domain: auratv.com
Save changes
```

###  **Ads Blocked**

**User has AdBlock:**
- Expected behavior
- 20-40% users have adblockers
- Consider anti-adblock script (optional)

**Network Error:**
```typescript
// Add error handling
try {
    window.atOptions.push({...});
} catch (e) {
    console.log('Ad blocked or error');
}
```

---

## 🔒 **Best Practices**

### **1. User Experience**

✅ **DO:**
- Limit popunders to 1 per session
- Use native ads (blend with content)
- Make ads clearly labeled
- Test on mobile

❌ **DON'T:**
- Too many pop ads
- Auto-play video ads
- Intrusive overlays
- Break user flow

### **2. Performance**

✅ **DO:**
- Load ads after content
- Use async scripts
- Lazy load below fold
- Monitor page speed

❌ **DON'T:**
- Block page rendering
- Load all ads at once
- Use synchronous scripts

### **3. Revenue Optimization**

✅ **DO:**
- Test ad placements (A/B testing)
- Monitor CTR & eCPM
- Optimize for mobile
- Use multiple ad types

❌ **DON'T:**
- Overload with ads
- Hide ads (against TOS)
- Click own ads
- Fake traffic

---

## 📝 **Example Keys**

Replace these in `components/ads/AdsterraAds.tsx`:

```typescript
// ❌ BEFORE (Placeholders)
key: 'YOUR_BANNER_KEY_HERE'
key: 'YOUR_NATIVE_KEY_HERE'  
key: 'YOUR_SOCIAL_BAR_KEY_HERE'
key: 'YOUR_POPUNDER_KEY_HERE'
key: 'YOUR_SMARTLINK_KEY_HERE'

// ✅ AFTER (Your Actual Keys)
key: 'f8e7d6c5b4a39281' // Banner
key: '1a2b3c4d5e6f7g8h' // Native
key: 'x9y8z7w6v5u4t3s2' // Social Bar
key: 'q1w2e3r4t5y6u7i8' // Popunder
key: 'a9s8d7f6g5h4j3k2' // Smartlink
```

---

## 🚀 **Go Live Checklist**

- [ ] Get Adsterra account
- [ ] Create 5 ad zones
- [ ] Copy all keys
- [ ] Update `AdsterraAds.tsx`
- [ ] Test in development
- [ ] Verify ads load
- [ ] Check mobile responsive
- [ ] Test with AdBlock
- [ ] Monitor console errors
- [ ] Deploy to production
- [ ] Verify on live site
- [ ] Check Adsterra dashboard
- [ ] Monitor revenue

---

## 🆘 **Support**

**Adsterra Support:**
- Email: publishers@adsterra.com
- Live Chat: Dashboard
- Telegram: @AdsterraPub

**Code Issues:**
- Check `components/ads/AdsterraAds.tsx`
- Console errors
- Browser DevTools

---

**Semua ads sudah terintegrasi!** Tinggal update keys dari Adsterra dashboard Anda! 💰🚀
