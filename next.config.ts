import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  // Konfigurasi opsi dev server untuk sembunyikan overlay error
  experimental: {
    // Mematikan overlay error bawaan next dev
    overlay: false
  },
  // Menonaktifkan Dev Overlay Isu/Error di browser
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
