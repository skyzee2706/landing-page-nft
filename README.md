# ChilliensNFT Landing Page

Landing page whitelist untuk proyek NFT ChilliensNFT — tema hijau & krem dengan dekorasi UFO ala alien.

## Struktur
- `index.html` — halaman utama
- `css/style.css` — styling
- `js/script.js` — logika task checklist & form whitelist
- `assets/logo.svg`, `assets/ufo.svg` — ilustrasi

## Yang perlu kamu ganti
1. **Link postingan X untuk task Like/RT/Komen** — buka `js/script.js`, ganti nilai `TWEET_URL` dengan link postingan asli.
2. **Link OpenSea untuk tombol Mint** — cari `https://opensea.io/collection/chilliensnft` di `index.html` (2 tempat: tombol Mint & footer), ganti dengan link koleksi kamu.
3. **Handle X (Twitter)** — sudah diset ke `ChilliensNFT` di link "Follow di X". Ganti kalau handle-nya beda.
4. Saat mint sudah live, di `index.html` ganti isi tombol `.btn-mint` (hapus class `mint-strike`/`mint-tag` dan teks "Coming Soon") supaya jadi tombol Mint aktif.

## Submit Whitelist
Form saat ini menyimpan submission whitelist di `localStorage` browser pengunjung (demo, tanpa backend). Untuk mengumpulkan data submission secara nyata (misalnya ke Google Sheet, database, atau layanan seperti Formspree), sambungkan `fetch()` ke endpoint pilihanmu di dalam `js/script.js` pada bagian `form.addEventListener("submit", ...)`.

## Menjalankan lokal
Buka `index.html` langsung di browser, atau jalankan server statis sederhana:
```
python3 -m http.server 8000
```
lalu buka `http://localhost:8000`.

## Deploy ke Vercel
Ini situs statis murni (HTML/CSS/JS, tanpa build step), jadi tinggal:
1. Buka [vercel.com/new](https://vercel.com/new)
2. Pilih **"Deploy without Git"** / drag-and-drop, lalu upload folder ini (atau `vercel --prod` via CLI dari dalam folder ini)
3. Vercel otomatis mendeteksinya sebagai static site — tidak perlu isi Build Command atau Output Directory
4. Kalau nanti mau hubungkan ke GitHub, cukup push folder ini ke repo lalu Import Project di Vercel

File `vercel.json` sudah disertakan untuk clean URL (tanpa perlu ketik `.html`).
