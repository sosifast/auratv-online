# Authentication Pages - AuraTV

Halaman autentikasi yang terintegrasi dengan **Supabase** untuk mengelola user registration, login, dan password recovery.

## 📁 Struktur Folder

```
app/(auth)/
├── layout.tsx              # Layout wrapper untuk halaman auth
├── login/
│   └── page.tsx           # Halaman login
├── register/
│   └── page.tsx           # Halaman pendaftaran
└── forgot-password/
    └── page.tsx           # Halaman lupa password
```

## ✨ Fitur

### 1. **Register (Pendaftaran)**
- ✅ Validasi form (nama, email, password, konfirmasi password)
- ✅ Password strength indicator
- ✅ Cek email duplikat
- ✅ Simpan user ke tabel `users` di Supabase
- ✅ Default role: `Member`
- ✅ Default status: `Active`

**Cara Kerja:**
1. User mengisi form pendaftaran
2. Validasi client-side (format email, panjang password, dll)
3. Insert data ke tabel `users` via `userService.create()`
4. Redirect ke `/login` setelah berhasil

---

### 2. **Login**
- ✅ Validasi email & password
- ✅ Cek credential di database Supabase
- ✅ Cek status akun (Active/Suspend)
- ✅ Session management via `localStorage`
- ✅ Role-based redirect (Admin → `/admin`, Member → `/`)

**Cara Kerja:**
1. User input email & password
2. Query database:
   ```ts
   const { data } = await supabase
     .from('users')
     .select('*')
     .eq('email', email)
     .eq('password', password)
     .single();
   ```
3. Validasi status akun
4. Simpan session ke `localStorage`
5. Redirect sesuai role

---

### 3. **Forgot Password**
- ✅ Validasi email terdaftar
- ✅ Cek email di database
- ✅ Simulasi pengiriman email reset
- ✅ Countdown timer untuk resend link

**Cara Kerja:**
1. User input email
2. Cek apakah email ada di database
3. Simulasi kirim email (untuk production, integrasikan dengan email service)
4. Tampilkan konfirmasi + countdown

---

## 🔐 Session Management

Session disimpan di **localStorage** dengan format:
```json
{
  "id": "uuid-user",
  "email": "user@example.com",
  "name": "Nama User",
  "level": "Member"
}
```

**Cara mengecek session:**
```typescript
const user = localStorage.getItem('user');
if (user) {
  const userData = JSON.parse(user);
  console.log(userData.level); // Admin atau Member
}
```

---

## 🚀 Integrasi dengan Supabase

### Setup `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Schema
Pastikan tabel `users` sudah dibuat:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  level VARCHAR(20) DEFAULT 'Member',
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### RLS Policies
Jalankan SQL dari `supabase/fix_registration_policy.sql`:
- ✅ Allow public registration
- ✅ Allow login verification
- ✅ Admin-only management

---

## ⚠️ Catatan Keamanan

### ⚠️ Password Storage
Saat ini password disimpan **plain text** untuk development. 

**UNTUK PRODUCTION:**
1. Install bcrypt: `npm install bcryptjs`
2. Hash password sebelum simpan:
   ```typescript
   import bcrypt from 'bcryptjs';
   const hashedPassword = await bcrypt.hash(password, 10);
   ```
3. Verifikasi login:
   ```typescript
   const isValid = await bcrypt.compare(inputPassword, userData.password);
   ```

### 🔒 Rekomendasi Production
1. **Gunakan Supabase Auth** untuk session management
2. **Implementasi JWT** untuk token-based auth
3. **Rate limiting** untuk prevent brute force
4. **Email verification** setelah registrasi
5. **2FA (Two-Factor Authentication)** untuk admin

---

## 🎨 UI Components

Semua halaman menggunakan:
- **Lucide Icons** untuk ikon
- **Tailwind CSS** untuk styling
- **Glassmorphism** effect
- **Responsive design** (mobile-first)

---

## 📝 TODO

- [ ] Implementasi password hashing (bcrypt)
- [ ] Integrasi real email service untuk reset password
- [ ] Add Google OAuth login
- [ ] Email verification after registration
- [ ] Rate limiting untuk login attempts
- [ ] Remember me functionality dengan cookie
- [ ] Password reset page (selain forgot password)

---

## 🐛 Troubleshooting

### Error: "Supabase not configured"
➡️ Pastikan file `.env.local` sudah diisi dengan benar

### Error: "Email sudah terdaftar"
➡️ Gunakan email lain atau login dengan email yang ada

### Error: "Email atau password salah"
➡️ Periksa credentials, case-sensitive untuk password

### Session hilang setelah reload
➡️ Check `localStorage`, pastikan tidak terhapus (clear browser cache)

---

## 📚 Referensi

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
