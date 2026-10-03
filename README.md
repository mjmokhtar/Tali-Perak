# Tali Perak

**Bahasa Indonesia** · [English](README.en.md)

Game petualangan arwah pixel art lima bab yang bisa dimainkan di browser, berdasarkan dokumen kebutuhan produk
([PRD](docs/PRD.md)). Cerita berbahasa Indonesia, grafis pixel art digambar lewat kode Canvas, audio Web Audio orisinal,
dan tiga slot simpanan lokal. Kode game ada di `artifacts/tali-perak/`.

## Cara bermain

Pilih **Mulai baru**, isi nama, pilih slot, lalu pilih **Berangkat**.
Gerak dengan WASD atau tombol panah; Z/Spasi/Enter untuk berinteraksi; Esc untuk jeda.
Dinding biasa bisa ditembus sebagai arwah. Garis garam yang bercahaya tidak bisa ditembus. Lampu kuning memulihkan tali perak.
Kumpulkan sedikitnya dua kenangan di setiap bab, lalu berinteraksi dengan pintu keluar.

- **Bab 2:** rasuki lampu gerbang lebih dulu.
- **Bab 3:** rasuki radio kamar, ikuti kucing, bicara dengannya di pintu belakang, lalu rasuki pintunya.
- **Bab 4:** rasuki jam besar, tunggu perawat menjauh dari pintu ICU, lalu rasuki pintunya.
- **Bab 5:** rasuki monitor untuk melarutkan tirai garam, lalu dekati ranjang dan pilih akhir cerita.

## Akhir cerita

- **Pulang:** butuh sedikitnya 12 dari 15 kenangan.
- **Melepas:** selalu tersedia.
- **Terlupakan:** tali perak habis.

## Cakupan

Bab 1–5, lima belas kenangan, perasukan radio/lampu/jam/pintu/monitor, anak kecil, arwah tersesat, kucing, perawat yang berpatroli,
hantu yang berpatroli, tiga akhir cerita, kontrol jeda/jurnal/audio, dan simpanan lokal.
Simpanan lama yang sudah tamat tetap berlanjut ke bab berikutnya tanpa kehilangan nama, kenangan, waktu, atau slot.

Belum selesai: level yang ringkas belum mencapai target sesi 20–30 menit di PRD (perlu uji tempo dan uji pemain),
dan 60 FPS adalah target render, bukan hasil pengukuran.

## Struktur

- `artifacts/tali-perak/src/game/engine.ts`: pemain, area, tabrakan, teka-teki, serpihan, akhir cerita, dan logika simpanan.
- `artifacts/tali-perak/src/game/story.ts`: seluruh narasi dan teks kenangan berbahasa Indonesia.
- `artifacts/tali-perak/src/game/render.ts`: latar, sprite, kamera, tali perak, dan efek yang digambar lewat kode.
- `artifacts/tali-perak/src/game/home-art.ts`: perabot rumah dan animasi kucing.
- `artifacts/tali-perak/src/game/hospital-art.ts`: interior rumah sakit, perawat, dan jam.
- `artifacts/tali-perak/src/game/icu-art.ts`: ruang ICU, monitor, dan sosok ibu.
- `artifacts/tali-perak/src/game/audio.ts`: suasana, musik, dan efek suara yang dibuat di browser.
- `artifacts/tali-perak/src/App.tsx`: menu, pilihan nama/slot, HUD, jurnal, pengaturan, dan game loop.

Setiap area memiliki dinding, serpihan, objek, dan NPC sendiri. Serpihan terhubung ke adegan kenangan; status objek dan jumlah
serpihan menentukan syarat teka-teki. Status pemain disimpan di localStorage browser, satu catatan per slot.
Tidak ada database SQL maupun layanan jaringan.

Inti game memakai Canvas dan Web Audio tanpa mesin game; React/Vite hanya untuk kerangka menu.
Slot simpanan bersifat lokal pada browser dan origin, tidak tersinkron antar perangkat.
Kegagalan penyimpanan browser ditampilkan kepada pemain.

## Pengembangan

Jalankan lewat workflow Tali Perak.
Cek tipe: `pnpm --filter @workspace/tali-perak run typecheck`.
