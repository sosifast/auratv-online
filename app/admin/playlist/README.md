# Playlist Streaming - Admin Panel

Halaman untuk mengelola playlist video untuk setiap streaming content.

## 📋 Fitur

### ✅ CRUD Operations
- **Create**: Tambah playlist baru dengan URL streaming
- **Read**: Lihat semua playlist dengan detail lengkap
- **Update**: Edit URL, tipe, atau status playlist
- **Delete**: Hapus playlist yang tidak diperlukan

### 🔍 Filter & Search
- **Search**: Cari berdasarkan nama streaming atau URL
- **Filter Tipe**: Filter playlist berdasarkan tipe (MP4, M3U8, TS)

### 📊 Statistics
- Total playlist
- Playlist aktif
- Breakdown berdasarkan tipe video

### 🎬 Tipe Streaming Supported

1. **MP4** - Progressive download
   - Standard video file format
   - Cocok untuk video pendek/medium
   
2. **M3U8 (HLS)** - HTTP Live Streaming
   - Adaptive bitrate streaming
   - Best untuk live streaming atau long-form content
   
3. **TS** - Transport Stream
   - Format untuk broadcast
   - High quality streaming

## 🚀 Cara Pakai

### Tambah Playlist Baru

1. Klik tombol **"Tambah Playlist"**
2. Pilih streaming yang ingin diberi playlist
3. Masukkan URL streaming:
   - MP4: `https://cdn.example.com/video.mp4`
   - M3U8: `https://stream.example.com/playlist.m3u8`
4. Pilih tipe streaming sesuai format file
5. Set status (Active/Not-Active)
6. Klik **"Simpan"**

### Edit Playlist

1. Klik icon **Edit** (pensil) pada row playlist
2. Update data yang diperlukan
3. Klik **"Update"**

### Hapus Playlist

1. Klik icon **Trash** pada row playlist
2. Konfirmasi penghapusan
3. Playlist akan terhapus dari database

## 📝 Database Structure

```sql
CREATE TABLE streaming_playlist (
  id UUID PRIMARY KEY,
  id_streaming UUID REFERENCES streaming(id),
  url_streaming TEXT NOT NULL,
  type_streaming VARCHAR(10) CHECK (type_streaming IN ('mp4', 'm3u8', 'ts')),
  status VARCHAR(20) CHECK (status IN ('Active', 'Not-Active')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## ⚠️ Catatan Penting

1. **URL harus valid** - Pastikan URL dapat diakses
2. **Satu streaming bisa punya multiple playlist** - Untuk kualitas berbeda (360p, 720p, 1080p)
3. **M3U8 untuk adaptive streaming** - Recommended untuk production
4. **Status Active** - Hanya playlist dengan status Active yang akan muncul di front-end

## 🎯 Best Practices

### Naming Convention untuk URL
```
https://cdn.example.com/[streaming-slug]/[quality]/video.[ext]
https://cdn.example.com/dark-knight/1080p/video.mp4
https://cdn.example.com/dark-knight/720p/playlist.m3u8
```

### Multiple Quality Support
Untuk memberikan pilihan kualitas ke user:
1. Upload video dalam berbagai resolusi (360p, 720p, 1080p)
2. Buat playlist terpisah untuk setiap kualitas
3. Front-end player akan otomatis mendeteksi dan memberi opsi kualitas

## 🔧 Troubleshooting

### Playlist tidak muncul di player
- Cek status playlist = **Active**
- Cek URL masih valid dan accessible
- Cek CORS settings di CDN

### Video tidak bisa diplay
- Verifikasi format video sesuai dengan tipe yang dipilih
- Test URL langsung di browser
- Cek encoding video (H.264 untuk MP4)

### M3U8 error
- Pastikan .m3u8 file dan .ts segments tersedia
- Cek CORS headers di server
- Verifikasi bandwidth segments
