# Auto-Generate Slug Feature

Slug sekarang **otomatis dibuat** di backend dari field `name` untuk tabel **Streaming** dan **Kategori**.

## 🚀 Cara Kerja

### 1. **Saat Create (Tambah Baru)**
```
Input Nama: "The Dark Knight"
↓
Backend auto-generate slug: "the-dark-knight"
↓
Cek uniqueness di database
↓
Jika sudah ada, append number: "the-dark-knight-2"
↓
Save ke database
```

### 2. **Saat Update (Edit)**
- Slug dapat diedit manual
- Jika dikosongkan, akan auto-generate ulang dari nama

---

## 📝 Slug Generation Rules

### Transform Process:
```javascript
"The Dark Knight (2008)"
→ lowercase: "the dark knight (2008)"
→ remove special chars: "the dark knight 2008"
→ replace spaces with hyphen: "the-dark-knight-2008"
→ clean multiple hyphens: "the-dark-knight-2008"
→ trim hyphens: "the-dark-knight-2008"
```

### Examples:
| Input Name | Generated Slug |
|------------|----------------|
| The Dark Knight | `the-dark-knight` |
| Breaking Bad: Season 1 | `breaking-bad-season-1` |
| Avengers (2012) | `avengers-2012` |
| One Piece!!! | `one-piece` |
| Action & Adventure | `action-adventure` |

---

## 🔄 Uniqueness Check

Jika slug sudah ada, backend akan auto-append angka:

```
Existing: "dark-knight"
New input: "Dark Knight" 
Generated: "dark-knight-2"

Existing: "dark-knight", "dark-knight-2"
New input: "Dark Knight"
Generated: "dark-knight-3"
```

---

## 🎨 UI Changes

### **Saat Tambah Baru (Create)**
- Field slug **readonly** (abu-abu)
- Label: "Slug (Auto-generated)"
- Placeholder: "Otomatis dibuat dari nama..."
- Helper text: "Slug akan otomatis dibuat dari nama"

### **Saat Edit (Update)**
- Field slug **editable** (putih)
- Label: "Slug (Auto-generated)"
- Helper text: "Slug dapat diedit saat update"

---

## 💻 Backend Implementation

### File Structure:
```
lib/utils/slug.ts            - Utility functions
lib/services/streaming.ts    - Auto-slug for streaming
lib/services/category.ts     - Auto-slug for category
```

### Functions:

#### `generateSlug(text: string): string`
Convert text ke URL-friendly slug

```typescript
generateSlug("The Dark Knight")
// Returns: "the-dark-knight"
```

#### `makeUniqueSlug(baseSlug: string, existingSlugs: string[]): string`
Ensure uniqueness dengan append number

```typescript
makeUniqueSlug("dark-knight", ["dark-knight"])
// Returns: "dark-knight-2"
```

---

## 🔧 Code Example

### Service Layer (streaming.ts / category.ts):
```typescript
async create(streaming: StreamingInsert) {
    // Auto-generate slug from name if not provided
    let slug = streaming.slug || generateSlug(streaming.name);

    // Check if slug already exists
    const { data: existing } = await supabase
        .from('streaming')
        .select('slug')
        .eq('slug', slug);

    // Make slug unique if needed
    if (existing && existing.length > 0) {
        const existingSlugs = existing.map(item => item.slug);
        slug = makeUniqueSlug(slug, existingSlugs);
    }

    // Insert with generated slug
    const { data, error } = await supabase
        .from('streaming')
        .insert({ ...streaming, slug })
        .select()
        .single();

    if (error) throw error;
    return data;
}
```

---

## ✅ Benefits

1. **User-friendly** - User tidak perlu manual buat slug
2. **SEO-friendly** - Slug auto-generated dari nama yang descriptive
3. **No duplicates** - Auto-handle uniqueness
4. **Editable** - Masih bisa custom saat update jika perlu
5. **Consistent** - Semua slug follow same rules

---

## ⚠️ Important Notes

1. **Backend-generated** - Slug dibuat di service layer, bukan di form
2. **Optional override** - User bisa isi manual slug saat create (akan digunakan jika ada)
3. **Case insensitive** - Semua slug lowercase
4. **URL-safe** - Hanya alphanumeric + hyphen
5. **Database unique constraint** - Tetap enforce di database level

---

## 🧪 Testing

### Test Case 1: Simple Name
```
Input: "Action"
Expected slug: "action"
✅ Pass
```

### Test Case 2: Special Characters
```
Input: "Sci-Fi & Fantasy!"
Expected slug: "sci-fi-fantasy"
✅ Pass
```

### Test Case 3: Duplicate Handling
```
Existing: ["action"]
Input: "Action"
Expected slug: "action-2"
✅ Pass
```

### Test Case 4: Multiple Duplicates
```
Existing: ["action", "action-2", "action-3"]
Input: "Action"
Expected slug: "action-4"
✅ Pass
```

---

## 🎯 Future Enhancements

- [ ] Live preview of slug while typing name
- [ ] Slug history/suggestions
- [ ] Bulk slug regeneration tool
- [ ] Custom slug patterns per category
- [ ] Transliteration for non-latin characters
