/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['vdmsolvdwppbygjhxslv.supabase.co'], // Ganti dengan domain Supabase Storage Anda
    formats: ['image/avif', 'image/webp'], // Tambahkan format gambar yang didukung
    deviceSizes: [320, 420, 768, 1024, 1200], // Ukuran yang didukung untuk responsivitas
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  reactStrictMode: true, // Mode Strict untuk debugging lebih baik
  swcMinify: true, // Optimisasi minifikasi kode
};

module.exports = nextConfig;