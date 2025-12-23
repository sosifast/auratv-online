# Multi-Language Implementation Guide

## ✅ Apa yang Sudah Diimplementasikan

### 1. Infrastruktur Dasar
- ✅ **Translation File** (`lib/translations.ts`): File translasi lengkap dengan 5 bahasa
  - 🇮🇩 Indonesia (id)
  - 🇬🇧 English (en)
  - 🇳🇱 Nederlands/Dutch (nl)
  - 🇮🇳 Hindi (hi)
  - 🇵🇹 Português/Portuguese (pt)

- ✅ **Language Context** (`lib/language-context.tsx`): Provider dan hook untuk mengelola bahasa
  - useLanguage() hook untuk akses translasi
  - Auto-save bahasa ke localStorage
  - Dinamis switch tanpa reload

- ✅ **Language Switcher Component** (`components/LanguageSwitcher.tsx`): Dropdown untuk ganti bahasa
  - Icon Globe
  - Dropdown dengan bendera dan nama bahasa
  - Checkmark untuk bahasa aktif

- ✅ **Root Layout** (`app/layout.tsx`): Wrapper LanguageProvider di seluruh aplikasi

### 2. Halaman yang Sudah Terintegrasi (Sebagian)

#### **Halaman Utama (`app/page.tsx`)**
- ✅ Navbar menu: Home, TV Series, Movies, New & Popular, My List
- ✅ Language Switcher ter-install di navbar
- ✅ Dropdown user: Settings, Favorites, Logout, Member status
- ⏳ Hero section: Masih perlu ditambahkan
- ⏳ Section titles: "Popular on AuraTV", "Newly Added", dst

## 🚀 Cara Menggunakan (untuk Developer)

### Menambahkan Translasi ke Komponen

1. **Import hook useLanguage:**
```tsx
import { useLanguage } from '@/lib/language-context';
```

2. **Gunakan hook di komponen:**
```tsx
function MyComponent() {
  const { t } = useLanguage();  // t berisi semua translasi
  
  return <h1>{t.home}</h1>;  // Otomatis sesuai bahasa yang dipilih
}
```

3. **Contoh penggunaan lengkap:**
```tsx
const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <nav>
      <h1>{t.home}</h1>
      <button>{t.settings}</button>
      <p>Current: {language}</p>
    </nav>
  );
};
```

## 📝 Halaman yang Perlu Dilengkapi

### 1. **Halaman Utama (`app/page.tsx`)** - 50% Complete
**Yang sudah:**
- Navbar (100%)
- User dropdown (100%)

**Yang perlu:**
```tsx
// Hero Component
const Hero = ({ streaming, onPlay }: { ... }) => {
  const { t } = useLanguage();  // TAMBAHKAN INI
  
  return (
    <div>
      <span>{t.topToday}</span>  {/* Ganti "TOP 1 HARI INI" */}
      <h1>{streaming.name}</h1>
      <p>{streaming.description || t.watchNow}</p>
      <button>{t.play}</button>
      <button>{t.moreInfo}</button>
    </div>
  );
};

// StreamingRow Component
const StreamingRow = ({ title, ... }) => {
  const { t } = useLanguage();
  
  // Ganti judul hardcoded dengan:
  // title === "🔥 Populer di AuraTV" -> `🔥 ${t.popularAt}`
  // title === "🆕 Baru Ditambahkan" -> `🆕 ${t.newlyAdded}`
};
```

### 2. **Halaman Search (`app/search/page.tsx`)** - 0% Complete
**Langkah:**
1. Import `useLanguage` di SearchResults component
2. Ganti semua text:
   - "Cari channel..." → `{t.search}`
   - "Hasil pencarian untuk" → `{t.searchResults}`
   - "hasil ditemukan" → `{t.resultsFound}`
   - "Tidak ada hasil" → `{t.noResults}`
   - etc.

3. Tambahkan LanguageSwitcher ke header search

### 3. **Halaman Play (`app/play/[slug]/page.tsx`)** - 0% Complete
**Text yang perlu ditranslate:**
- "Kembali" → `{t.back}`
- "Pilih Kualitas" → `{t.selectQuality}`
- "opsi tersedia" → `{t.optionsAvailable}`
- "Suka" / "Disukai" → `{t.like}` / `{t.liked}`
- "Bagikan" → `{t.share}`
- "Daftar Saya" → `{t.addToList}`
- "Streaming tidak ditemukan" → `{t.streamingNotFound}`
- "Video belum tersedia" → `{t.videoNotAvailable}`
- "Channel yang Sama" → `{t.sameChannel}`
- "Rekomendasi" → `{t.recommendations}`
- "Trending" → `{t.trending}`

### 4. **Halaman Favorit (`app/favorite/page.tsx`)** - 0% Complete
**Text yang perlu:**
- "Favorit Saya" → `{t.myFavorites}`
- "streaming yang Anda sukai" → `{t.streamingsLiked}`
- "Belum ada favorit" → `{t.noFavorites}`
- "Hapus dari favorit" → `{t.removeFromFavorites}`

### 5. **Halaman Category (`app/category/[slug]/page.tsx`)** - Navbar Done
**Navbar sudah terintegrasi**, perlu tambah di:
- "Kategori" → `{t.category}`
- "Temukan koleksi ... terbaik" → `${t.findBest} ... ${t.bestOnly}`
- "Populer", "Terbaru", "Rating", "A-Z" → `{t.popular}`, `{t.newest}`, etc.
- "hasil ditemukan" → `{t.resultsFound}`

## 🔧 Template Implementasi Cepat

### Untuk Navbar di Halaman Lain
```tsx
import { useLanguage } from '@/lib/language-context';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Navbar = () => {
  const { t } = useLanguage();
  
  return (
    <nav>
      <div>
        <LanguageSwitcher />  {/* Tambah ini di sebelah search */}
        <Link href="/search"><Search /></Link>
        {/* ... */}
      </div>
    </nav>
  );
};
```

### Untuk Page Component
```tsx
const MyPage = () => {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t.pageTitle}</h1>
      <p>{t.description}</p>
    </div>
  );
};
```

## 🎨 Available Translation Keys

### Navigation
- `t.home`, `t.tvSeries`, `t.movies`, `t.newPopular`, `t.myList`
- `t.settings`, `t.favorites`, `t.logout`, `t.member`

### Actions
- `t.play`, `t.like`, `t.liked`, `t.share`, `t.addToList`
- `t.moreInfo`, `t.back`, `t.search`

### Pages
- `t.topToday`, `t.popularAt`, `t.newlyAdded`
- `t.sameChannel`, `t.recommendations`, `t.trending`
- `t.myFavorites`, `t.category`

### Search
- `t.search`, `t.searchResults`, `t.resultsFound`
- `t.noResults`, `t.noResultsDesc`, `t.clearSearch`

### Messages
- `t.loading`, `t.error`
- `t.noFavorites`, `t.noFavoritesDesc`
- `t.videoNotAvailable`, `t.streamingNotFound`

**Lihat file `lib/translations.ts` untuk daftar lengkap!**

## 🐛 Troubleshooting

### Error: "useLanguage must be used within a LanguageProvider"
**Solusi**: Pastikan component dibungkus dengan LanguageProvider di layout.tsx

### Bahasa tidak tersimpan setelah reload
**Solusi**: Cek localStorage di browser console: `localStorage.getItem('language')`

### Translation key tidak ada
**Solusi**: Tambahkan key baru di `lib/translations.ts` untuk semua 5 bahasa

## 📊 Progress Tracker

| Halaman | Progress | Status |
|---------|----------|--------|
| app/layout.tsx | ✅ 100% | Provider installed |
| app/page.tsx | ⏳ 50% | Navbar done, need Hero & Sections |
| app/search/page.tsx | ❌ 0% | Not started |
| app/play/[slug]/page.tsx | ❌ 0% | Not started |
| app/favorite/page.tsx | ❌ 0% | Not started |
| app/category/[slug]/page.tsx | ⏳ 30% | Navbar done only |

## 🚀 Next Steps

1. **Lengkapi app/page.tsx** (Hero, StreamingRow, MovieCard)
2. **Implement app/search/page.tsx**
3. **Implement app/play/[slug]/page.tsx**
4. **Implement app/favorite/page.tsx**
5. **Lengkapi app/category/[slug]/page.tsx**
6. Test semua halaman di semua bahasa
7. (Optional) Tambah bahasa lain jika diperlukan

---

💡 **Tips**: Copy-paste pattern dari `app/page.tsx` yang sudah jadi untuk halaman lain!
