-- =============================================
-- CONTOH DATA SEO UNTUK STREAMING
-- File ini berisi contoh-contoh pengisian field title_seo dan desc_seo
-- untuk meningkatkan SEO di halaman streaming
-- =============================================

-- CONTOH 1: Drama Korea
UPDATE streaming 
SET 
  title_seo = 'Nonton Crash Landing on You Full Episode - Subtitle Indonesia HD',
  desc_seo = 'Tonton Crash Landing on You (CLOY) series lengkap dengan subtitle Indonesia. Drama Korea romantis tentang cinta lintas batas Korea Utara dan Selatan. Kualitas HD, streaming lancar di AuraTV.'
WHERE slug = 'crash-landing-on-you';

-- CONTOH 2: Film Action
UPDATE streaming 
SET 
  title_seo = 'Nonton Fast & Furious 9 (2021) - Streaming Film Action Terbaik',
  desc_seo = 'Streaming Fast & Furious 9 (F9) sub Indo dengan kualitas HD di AuraTV. Film action balap mobil penuh aksi spektakuler. Gratis tanpa iklan mengganggu.'
WHERE slug = 'fast-furious-9';

-- CONTOH 3: Anime
UPDATE streaming 
SET 
  title_seo = 'Nonton Demon Slayer Season 1-3 - Anime Sub Indo Lengkap',
  desc_seo = 'Tonton Kimetsu no Yaiba (Demon Slayer) sub Indonesia lengkap semua season. Anime action dengan animasi terbaik. Streaming gratis HD di AuraTV.'
WHERE slug = 'demon-slayer';

-- CONTOH 4: Series Western
UPDATE streaming 
SET 
  title_seo = 'Breaking Bad Complete Series - Nonton Sub Indo HD',
  desc_seo = 'Streaming Breaking Bad series lengkap 5 season dengan subtitle Indonesia. Drama crime thriller terbaik sepanjang masa dengan rating 9.5/10 IMDb. Gratis di AuraTV.'
WHERE slug = 'breaking-bad';

-- CONTOH 5: Film Horror
UPDATE streaming 
SET 
  title_seo = 'Nonton The Conjuring (2013) - Film Horor Terseram Sub Indo',
  desc_seo = 'Streaming The Conjuring sub Indonesia dengan kualitas HD. Film horor berdasarkan kisah nyata keluarga Perron. Rating 7.5/10 IMDb. Tonton sekarang di AuraTV.'
WHERE slug = 'the-conjuring';

-- CONTOH 6: Film Comedy
UPDATE streaming 
SET 
  title_seo = 'Nonton Home Alone (1990) - Film Komedi Keluarga Klasik',
  desc_seo = 'Streaming Home Alone sub Indo, film komedi keluarga klasik yang menghibur. Cocok ditonton bersama keluarga. Kualitas HD di AuraTV.'
WHERE slug = 'home-alone';

-- CONTOH 7: Documentary
UPDATE streaming 
SET 
  title_seo = 'Planet Earth II - Dokumenter Alam Terbaik BBC',
  desc_seo = 'Tonton Planet Earth II dokumenter alam dengan sinematografi memukau dari BBC. Narasi David Attenborough. Streaming HD gratis di AuraTV.'
WHERE slug = 'planet-earth-2';

-- CONTOH 8: Romance
UPDATE streaming 
SET 
  title_seo = 'Nonton The Notebook (2004) - Film Romantis Paling Menyentuh',
  desc_seo = 'Streaming The Notebook sub Indonesia, film romance klasik yang menyentuh hati. Kisah cinta abadi Ryan Gosling dan Rachel McAdams. HD di AuraTV.'
WHERE slug = 'the-notebook';

-- =============================================
-- TIPS MENULIS SEO YANG BAIK:
-- =============================================

/*
1. TITLE_SEO (50-60 karakter ideal):
   ✅ DO:
   - Mulai dengan action word: "Nonton", "Streaming", "Tonton"
   - Sertakan keyword utama (judul film/series)
   - Tambahkan informasi spesifik: "Sub Indo", "HD", "Full Episode"
   - Buat menarik dan natural
   
   ❌ DON'T:
   - Terlalu panjang (>70 karakter)
   - Keyword stuffing
   - Semua huruf kapital
   - Terlalu generik

2. DESC_SEO (150-160 karakter ideal):
   ✅ DO:
   - Deskripsikan konten secara singkat
   - Sertakan keyword penting natural
   - Tambahkan unique selling point (kualitas, gratis, lengkap)
   - Ajakan untuk menonton
   - Mention platform: "di AuraTV"
   
   ❌ DON'T:
   - Terlalu pendek (<120 karakter)
   - Terlalu panjang (>165 karakter)
   - Duplikasi dari title
   - Hanya keyword tanpa kalimat lengkap

3. KEYWORD RESEARCH:
   - Gunakan keyword yang sering dicari:
     * "nonton {judul}"
     * "streaming {judul}"
     * "download {judul}" (meski tidak support download)
     * "{judul} sub indo"
     * "{judul} subtitle indonesia"
     * "{genre} terbaik"
   
4. LOKALISASI:
   - Untuk audience Indonesia, selalu mention:
     * "Sub Indo" / "Subtitle Indonesia"
     * "Gratis" (jika applicable)
     * "HD" / "Kualitas HD"
     * Genre dalam Bahasa Indonesia

5. TESTING:
   - Cek preview di Google: google.com/search?q=(title seo anda)
   - Pastikan tidak terpotong
   - Baca ulang, apakah menarik untuk di-klik?
*/

-- =============================================
-- BATCH UPDATE UNTUK SEMUA STREAMING YANG BELUM PUNYA SEO
-- =============================================

-- Update otomatis dengan template default
-- (gunakan ini jika ingin cepat, tapi custom lebih baik)
UPDATE streaming 
SET 
  title_seo = CASE 
    WHEN title_seo IS NULL OR title_seo = '' 
    THEN 'Nonton ' || name || ' - Streaming Online HD Sub Indo'
    ELSE title_seo 
  END,
  desc_seo = CASE 
    WHEN desc_seo IS NULL OR desc_seo = '' 
    THEN 'Tonton ' || name || ' streaming online gratis di AuraTV. ' || 
         COALESCE(LEFT(description, 100), 'Nikmati konten berkualitas HD') || 
         '. Subtitle Indonesia tersedia.'
    ELSE desc_seo 
  END
WHERE status = 'Active';

-- =============================================
-- VERIFICATION QUERY
-- =============================================

-- Cek streaming yang sudah punya SEO
SELECT 
  name,
  slug,
  CASE 
    WHEN title_seo IS NOT NULL AND title_seo != '' THEN '✅ Ada'
    ELSE '❌ Kosong'
  END as title_seo_status,
  CASE 
    WHEN desc_seo IS NOT NULL AND desc_seo != '' THEN '✅ Ada'
    ELSE '❌ Kosong'
  END as desc_seo_status,
  LENGTH(title_seo) as title_length,
  LENGTH(desc_seo) as desc_length
FROM streaming
WHERE status = 'Active'
ORDER BY title_seo_status, name;

-- Cek streaming yang SEO-nya terlalu panjang atau pendek
SELECT 
  name,
  slug,
  LENGTH(title_seo) as title_length,
  LENGTH(desc_seo) as desc_length,
  CASE 
    WHEN LENGTH(title_seo) > 70 THEN '⚠️ Title terlalu panjang'
    WHEN LENGTH(title_seo) < 30 THEN '⚠️ Title terlalu pendek'
    ELSE '✅ OK'
  END as title_check,
  CASE 
    WHEN LENGTH(desc_seo) > 165 THEN '⚠️ Desc terlalu panjang'
    WHEN LENGTH(desc_seo) < 120 THEN '⚠️ Desc terlalu pendek'
    ELSE '✅ OK'
  END as desc_check
FROM streaming
WHERE status = 'Active' 
  AND title_seo IS NOT NULL 
  AND desc_seo IS NOT NULL;
