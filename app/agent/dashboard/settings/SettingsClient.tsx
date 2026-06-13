'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SiteProfile } from '@/lib/mockDb';
import Toast from '@/components/Toast';
import Link from 'next/link';

// Extract lat/lng from a Google Maps URL string
function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  // Format: google.com/maps/@lat,lng or google.com/maps/place/.../@lat,lng
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

  // Format: ?q=lat,lng
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };

  // Format: /place/lat,lng
  const placeMatch = url.match(/\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (placeMatch) return { lat: parseFloat(placeMatch[1]), lng: parseFloat(placeMatch[2]) };

  return null;
}

export default function SettingsClient({ initialProfile }: { initialProfile: SiteProfile }) {
  const router = useRouter();
  const [profile, setProfile] = useState<SiteProfile>(initialProfile);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [isResolvingMap, setIsResolvingMap] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMapsUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setProfile(prev => ({ ...prev, maps_embed_url: url }));

    if (!url.trim()) return;

    // Try direct extraction first
    const coords = extractCoordsFromUrl(url);
    if (coords) {
      setProfile(prev => ({ ...prev, maps_embed_url: url, map_lat: coords.lat, map_lng: coords.lng }));
      setToast({ message: `Koordinat ditemukan: ${coords.lat}, ${coords.lng}`, type: 'success' });
      return;
    }

    // For short links (maps.app.goo.gl), resolve via our API
    if (url.includes('goo.gl') || url.includes('maps.app')) {
      setIsResolvingMap(true);
      try {
        const res = await fetch(`/api/resolve-maps?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data.lat && data.lng) {
          setProfile(prev => ({ ...prev, maps_embed_url: url, map_lat: data.lat, map_lng: data.lng }));
          setToast({ message: `Koordinat ditemukan: ${data.lat}, ${data.lng}`, type: 'success' });
        } else {
          setToast({ message: 'Koordinat tidak ditemukan, isi manual.', type: 'error' });
        }
      } catch {
        setToast({ message: 'Gagal resolve link. Isi koordinat manual.', type: 'error' });
      } finally {
        setIsResolvingMap(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/site-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ message: 'Profil landing page berhasil disimpan!', type: 'success' });
        router.refresh();
      } else {
        setToast({ message: data.error || 'Gagal menyimpan profil.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Gagal menghubungi server.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans antialiased flex flex-col">
      <header className="sticky top-0 z-40 bg-[#1A1A1A] text-white py-4 px-6 md:px-12 flex items-center justify-between shadow-md border-b border-[#C9A961]/20">
        <div className="flex items-center gap-3">
          <Link href="/agent/dashboard" className="text-white hover:text-[#C9A961] font-bold text-sm flex items-center gap-1">
            <span>◀</span> Kembali ke Dashboard
          </Link>
          <span className="text-gray-500">|</span>
          <span className="text-xs font-bold tracking-wider uppercase text-gray-300">Pengaturan Landing Page</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 lg:p-8 w-full flex-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Pengaturan Landing Page</h1>
            <p className="text-xs text-gray-400 mt-1">Ubah informasi kontak, alamat, tagline, dan informasi operasional yang muncul di landing page.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Perusahaan & Tagline */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#C9A961]">Identitas & Tagline</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama Perusahaan</label>
                  <input
                    type="text"
                    name="nama_perusahaan"
                    value={profile.nama_perusahaan}
                    onChange={handleChange}
                    required
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Akurasi Dimensi (%)</label>
                  <input
                    type="number"
                    name="akurasi_dimensi"
                    value={profile.akurasi_dimensi}
                    onChange={handleChange}
                    required
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tagline Baris 1</label>
                  <input
                    type="text"
                    name="tagline_baris1"
                    value={profile.tagline_baris1}
                    onChange={handleChange}
                    required
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tagline Baris 2</label>
                  <input
                    type="text"
                    name="tagline_baris2"
                    value={profile.tagline_baris2}
                    onChange={handleChange}
                    required
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Deskripsi Hero</label>
                <textarea
                  name="deskripsi_hero"
                  value={profile.deskripsi_hero}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* Kontak */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#C9A961]">Informasi Kontak</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">No. Telepon Kantor (URL Safe, e.g. +626188997766)</label>
                  <input
                    type="text"
                    name="telepon"
                    value={profile.telepon}
                    onChange={handleChange}
                    required
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">No. Telepon Kantor (Tampilan, e.g. +62 61 8899 7766)</label>
                  <input
                    type="text"
                    name="telepon_display"
                    value={profile.telepon_display}
                    onChange={handleChange}
                    required
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">No. WhatsApp (Hanya Angka, e.g. 6281160008899)</label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={profile.whatsapp}
                    onChange={handleChange}
                    required
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">No. WhatsApp (Tampilan, e.g. +62 811 6000 8899)</label>
                  <input
                    type="text"
                    name="whatsapp_display"
                    value={profile.whatsapp_display}
                    onChange={handleChange}
                    required
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Kontak</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    required
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Alamat & Operasional */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#C9A961]">Alamat & Jam Operasional</h3>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Alamat Lengkap</label>
                <textarea
                  name="alamat"
                  value={profile.alamat}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hari Operasional (e.g. Senin – Sabtu)</label>
                  <input
                    type="text"
                    name="hari_operasional"
                    value={profile.hari_operasional}
                    onChange={handleChange}
                    required
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jam Operasional (e.g. 08.00 – 17.00 WIB)</label>
                  <input
                    type="text"
                    name="jam_operasional"
                    value={profile.jam_operasional}
                    onChange={handleChange}
                    required
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">URL Google Maps (paste link, koordinat otomatis terisi)</label>
                <div className="relative">
                  <input
                    type="text"
                    name="maps_embed_url"
                    value={profile.maps_embed_url}
                    onChange={handleMapsUrlChange}
                    placeholder="https://maps.app.goo.gl/... atau google.com/maps/..."
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white pr-8"
                  />
                  {isResolvingMap && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#C9A961] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Latitude (koordinat peta)</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="map_lat"
                    value={profile.map_lat ?? 3.6377}
                    onChange={(e) => setProfile(prev => ({ ...prev, map_lat: parseFloat(parseFloat(e.target.value).toFixed(6)) }))}
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Longitude (koordinat peta)</label>
                  <input
                    type="number"
                    step="0.000001"
                    name="map_lng"
                    value={profile.map_lng ?? 98.6947}
                    onChange={(e) => setProfile(prev => ({ ...prev, map_lng: parseFloat(parseFloat(e.target.value).toFixed(6)) }))}
                    className="w-full text-xs border border-gray-300 rounded p-2.5 focus:ring-1 focus:ring-[#C9A961] focus:outline-none bg-white"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400">Cara cari koordinat: buka Google Maps → klik kanan lokasi → koordinat akan muncul (angka pertama = Latitude, angka kedua = Longitude)</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Link
                href="/agent/dashboard"
                className="px-5 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-xs font-bold text-black bg-[#C9A961] hover:bg-[#D5BD81] disabled:opacity-50 rounded transition flex items-center gap-1.5"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
