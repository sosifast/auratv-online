# Streaming Form - Field Mapping

## ✅ Database Schema vs Form Fields

| Database Column | Form Field | Type | Required | Description |
|----------------|------------|------|----------|-------------|
| `id` | - | UUID | Auto | Primary key |
| `id_category` | ✅ Kategori | Select | Yes | Foreign key ke category |
| `slug` | ✅ Slug | Text | Yes | URL-friendly identifier |
| `name` | ✅ Nama | Text | Yes | Judul streaming |
| `description` | ✅ Deskripsi | Textarea | No | Deskripsi konten |
| `title_seo` | ✅ SEO Title | Text (60) | No | Meta title untuk SEO |
| `desc_seo` | ✅ SEO Description | Textarea (160) | No | Meta description untuk SEO |
| `url_banner` | ✅ URL Banner | Text | No | URL gambar poster |
| `view_count` | - | Integer | Auto | Counter otomatis |
| `status` | ✅ Status | Select | Yes | Active / Not-Active |
| `created_at` | - | Timestamp | Auto | Waktu dibuat |
| `updated_at` | - | Timestamp | Auto | Waktu terakhir diupdate |

---

## 📝 Form Structure

### 1. Basic Information
- **Nama** - Judul film/series
- **Slug** - URL identifier (contoh: `dark-knight`)
- **Kategori** - Pilih dari dropdown

### 2. Content Description
- **Deskripsi** - Deskripsi singkat untuk ditampilkan di card/detail page
  - Max length: Unlimited (TEXT)
  - Opsional tapi recommended

### 3. SEO Optimization ⚡ NEW!
Section terpisah dengan border untuk SEO fields:

#### **SEO Title** 
- Max: 60 karakter
- Opsional
- Digunakan untuk `<title>` tag
- Best practice: Include keyword utama
- Example: `"The Dark Knight (2008) - Streaming HD | AuraTV"`

#### **SEO Description**
- Max: 160 karakter
- Opsional
- Digunakan untuk `<meta name="description">`
- Muncul di hasil pencarian Google
- Example: `"Nonton The Dark Knight subtitle Indonesia. Batman menghadapi Joker dalam pertarungan epik. Streaming HD gratis di AuraTV."`

### 4. Media Assets
- **URL Banner** - Link ke poster/thumbnail image
- Format: `https://cdn.example.com/banners/dark-knight.jpg`

### 5. Visibility
- **Status** - Active / Not-Active
- Hanya Active yang muncul di front-end

---

## 🎯 Best Practices

### SEO Title Best Practices
```
✅ Good:
"The Dark Knight (2008) - Nonton HD | AuraTV"
"Inception Full Movie Indonesia Subtitle | AuraTV"

❌ Bad:
"The Dark Knight" (terlalu pendek)
"Watch The Dark Knight 2008 Full Movie HD Streaming Online Free Download" (terlalu panjang)
```

### SEO Description Best Practices
```
✅ Good:
"Nonton The Dark Knight (2008) subtitle Indonesia. Christian Bale sebagai Batman menghadapi Heath Ledger sebagai Joker. Streaming HD gratis tanpa iklan di AuraTV."

❌ Bad:
"Movie" (terlalu pendek)
"The Dark Knight is a 2008 superhero film directed by Christopher Nolan..." (terlalu panjang, > 160 char)
```

### Slug Guidelines
```
✅ Good slugs:
dark-knight
inception-2010
breaking-bad-s01e01

❌ Bad slugs:
The Dark Knight (spasi)
dark_knight (underscore)
DarkKnight (case sensitive)
```

---

## 🔍 SEO Impact

### With SEO Fields:
```html
<title>The Dark Knight (2008) - Streaming HD | AuraTV</title>
<meta name="description" content="Nonton The Dark Knight subtitle Indonesia...">
```

### Without SEO Fields (fallback):
```html
<title>The Dark Knight | AuraTV</title>
<meta name="description" content="The Dark Knight - Nonton streaming di AuraTV">
```

---

## 💡 Tips & Tricks

### Auto-generate Slug
```javascript
// From streaming name
const name = "The Dark Knight";
const slug = name.toLowerCase()
                 .replace(/[^a-z0-9]+/g, '-')
                 .replace(/^-|-$/g, '');
// Result: "the-dark-knight"
```

### SEO Title Formula
```
[Movie Name] ([Year]) - [Action Verb] [Quality] | [Brand]

Examples:
- "Inception (2010) - Nonton HD | AuraTV"
- "Breaking Bad S01E01 - Streaming Subtitle Indonesia | AuraTV"
```

### Description Formula
```
Nonton [Name] ([Year]) [language]. [Short plot summary]. [Unique selling point].

Example:
"Nonton The Dark Knight (2008) subtitle Indonesia. Batman menghadapi ancaman terbesar dari Joker. Streaming HD gratis tanpa iklan di AuraTV."
```

---

## 🚀 Future Enhancements

Possible additions:
- [ ] Auto-slug generator dari nama
- [ ] Character counter untuk SEO fields
- [ ] SEO preview (Google SERP preview)
- [ ] Keyword suggestions
- [ ] Image upload untuk banner (instead of URL)
- [ ] Multiple banners (landscape, portrait, thumbnail)

---

## ⚠️ Important Notes

1. **SEO fields are OPTIONAL** - App will work without them
2. **Max length enforced** on frontend (60 for title, 160 for description)
3. **Database allows NULL** - No backend error if empty
4. **Auto-fallback** - Front-end will use default if SEO fields empty
5. **Update existing data** - Perlu manual update untuk data lama
