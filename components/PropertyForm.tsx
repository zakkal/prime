'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Property } from '@/lib/mockDb';
import Toast from '@/components/Toast';

interface PropertyFormProps {
  initialData?: Property;
  isEditMode?: boolean;
  onSubmitAction: (data: any) => Promise<{ success: boolean; error?: string; errors?: Record<string, string> }>;
}

export default function PropertyForm({ initialData, isEditMode = false, onSubmitAction }: PropertyFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_property: initialData?.nama_property || '',
    group: initialData?.group || '',
    lebar: initialData?.lebar !== undefined ? String(initialData.lebar) : '',
    panjang: initialData?.panjang !== undefined ? String(initialData.panjang) : '',
    hadap: initialData?.hadap || [] as string[],
    tipe: initialData?.tipe || 'Villa',
    tingkat: initialData?.tingkat !== undefined ? String(initialData.tingkat) : '',
    price: initialData?.price !== undefined ? String(initialData.price) : '',
    carport: initialData?.carport ?? false,
    status: initialData?.status || 'in_stock',
    siap: initialData?.siap || 'siap_huni',
    maps_link: initialData?.maps_link || '',
    kawasan: initialData?.kawasan?.join(', ') || '',
    unit: initialData?.unit || '',
  });

  const handleAddKawasanTag = (kawasanName: string) => {
    const currentTags = formData.kawasan
      .split(',')
      .map(k => k.trim())
      .filter(k => k !== '');
    if (!currentTags.includes(kawasanName)) {
      currentTags.push(kawasanName);
      setFormData({ ...formData, kawasan: currentTags.join(', ') });
      if (errors.kawasan) {
        setErrors({ ...errors, kawasan: '' });
      }
    } else {
      // Toggle off if already exists
      const filtered = currentTags.filter(k => k !== kawasanName);
      setFormData({ ...formData, kawasan: filtered.join(', ') });
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const KAWASAN_OPTIONS = ['Krakatau', 'Pancing', 'Cemara Asri', 'Tembung', 'Helvetia', 'Kuala'];
  const HADAP_OPTIONS = ['Utara', 'Selatan', 'Timur', 'Barat'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    let updatedHadap = [...formData.hadap];
    if (checked) {
      updatedHadap.push(value);
    } else {
      updatedHadap = updatedHadap.filter((item) => item !== value);
    }
    setFormData({ ...formData, hadap: updatedHadap });
    if (errors.hadap) {
      setErrors({ ...errors, hadap: '' });
    }
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  // Client Side Validations (AC-8.4)
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_property.trim() || formData.nama_property.length < 3 || formData.nama_property.length > 100) {
      newErrors.nama_property = 'Nama properti harus diisi, minimal 3 karakter, maksimal 100 karakter.';
    }

    const lebarNum = Number(formData.lebar);
    if (!formData.lebar || isNaN(lebarNum) || lebarNum <= 0) {
      newErrors.lebar = 'Lebar harus lebih besar dari 0 (maksimal 2 desimal).';
    }

    const panjangNum = Number(formData.panjang);
    if (!formData.panjang || isNaN(panjangNum) || panjangNum <= 0) {
      newErrors.panjang = 'Panjang harus lebih besar dari 0 (maksimal 2 desimal).';
    }

    if (formData.hadap.length === 0) {
      newErrors.hadap = 'Pilih minimal satu arah hadap.';
    }

    const tingkatNum = Number(formData.tingkat);
    if (!formData.tingkat || isNaN(tingkatNum) || tingkatNum < 1 || tingkatNum > 10) {
      newErrors.tingkat = 'Jumlah tingkat harus berkisar antara 1 hingga 10.';
    }

    const priceNum = Number(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum <= 0 || !Number.isInteger(priceNum)) {
      newErrors.price = 'Harga harus berupa bilangan bulat rupiah positif yang valid.';
    }

    if (formData.maps_link.trim() && !formData.maps_link.includes('google.com/maps')) {
      newErrors.maps_link = 'Tautan harus berupa URL Google Maps yang valid (berisi domain google.com/maps).';
    }

    if (!formData.kawasan.trim()) {
      newErrors.kawasan = 'Kawasan wajib diisi.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (submitType: 'redirect' | 'add_more') => {
    if (!validate()) return;

    setLoading(true);
    // Parse fields to correct types before submit
    const submissionData = {
      ...formData,
      lebar: Number(parseFloat(formData.lebar).toFixed(2)),
      panjang: Number(parseFloat(formData.panjang).toFixed(2)),
      tingkat: Number(parseFloat(formData.tingkat).toFixed(1)),
      price: parseInt(formData.price, 10),
      kawasan: formData.kawasan.split(',').map((k) => k.trim()).filter((k) => k !== ''),
    };

    try {
      const res = await onSubmitAction(submissionData);
      if (res.success) {
        setToast({
          message: isEditMode 
            ? 'Perubahan properti berhasil disimpan.' 
            : 'Properti baru berhasil ditambahkan.',
          type: 'success',
        });
        
        if (submitType === 'redirect') {
          setTimeout(() => {
            router.push('/agent/dashboard');
            router.refresh();
          }, 1500);
        } else {
          // Reset form for new entry (AC-8.1: Simpan & Tambah Lagi)
          setFormData({
            nama_property: '',
            group: '',
            lebar: '',
            panjang: '',
            hadap: [],
            tipe: 'Villa',
            tingkat: '',
            price: '',
            carport: false,
            status: 'in_stock',
            siap: 'siap_huni',
            maps_link: '',
            kawasan: '',
            unit: '',
          });
          setErrors({});
          setLoading(false);
        }
      } else {
        if (res.errors) {
          setErrors(res.errors);
        }
        setToast({ message: res.error || 'Gagal memproses data.', type: 'error' });
        setLoading(false);
      }
    } catch (err) {
      setToast({ message: 'Terjadi kesalahan komunikasi dengan server.', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto w-full">
      {/* Form Grid 2 Kolom (AC-8.1) */}
      <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-gray-700">
        
        {/* Nama Properti */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Nama Properti <span className="text-[#B33A3A]">*</span></label>
          <input
            type="text"
            name="nama_property"
            value={formData.nama_property}
            onChange={handleChange}
            placeholder="Contoh: Aston Villas Indah"
            className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm text-[#1A1A1A]"
          />
          {errors.nama_property && <span className="text-[#B33A3A] font-bold mt-0.5">{errors.nama_property}</span>}
        </div>

        {/* Group / Cluster */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Cluster / Group (Optional)</label>
          <input
            type="text"
            name="group"
            value={formData.group}
            onChange={handleChange}
            placeholder="Contoh: Mentari"
            className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm"
          />
        </div>

        {/* Kawasan */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Kawasan (Multitag koma) <span className="text-[#B33A3A]">*</span></label>
          <input
            type="text"
            name="kawasan"
            value={formData.kawasan}
            onChange={handleChange}
            placeholder="Contoh: Krakatau, Pancing"
            className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm"
          />
          <div className="flex flex-wrap gap-1.5 mt-1">
            {KAWASAN_OPTIONS.map((tag) => {
              const isActive = formData.kawasan
                .split(',')
                .map(k => k.trim())
                .includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddKawasanTag(tag)}
                  className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition-all ${
                    isActive
                      ? 'bg-[#C9A961] text-black border-[#C9A961]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#C9A961] hover:text-[#C9A961]'
                  }`}
                >
                  {isActive ? `✓ ${tag}` : `+ ${tag}`}
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-gray-400 font-medium mt-1">Pilihan standar: Krakatau, Pancing, Cemara Asri, Tembung, Helvetia, Kuala. Pisahkan dengan tanda koma.</span>
          {errors.kawasan && <span className="text-[#B33A3A] font-bold mt-0.5">{errors.kawasan}</span>}
        </div>

        {/* Lebar */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Lebar Bangunan (Meter) <span className="text-[#B33A3A]">*</span></label>
          <input
            type="number"
            step="0.01"
            name="lebar"
            value={formData.lebar}
            onChange={handleChange}
            placeholder="Contoh: 4.5"
            className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm"
          />
          {errors.lebar && <span className="text-[#B33A3A] font-bold mt-0.5">{errors.lebar}</span>}
        </div>

        {/* Panjang */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Panjang Bangunan (Meter) <span className="text-[#B33A3A]">*</span></label>
          <input
            type="number"
            step="0.01"
            name="panjang"
            value={formData.panjang}
            onChange={handleChange}
            placeholder="Contoh: 21.5"
            className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm"
          />
          {errors.panjang && <span className="text-[#B33A3A] font-bold mt-0.5">{errors.panjang}</span>}
        </div>

        {/* Tipe Radio */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Tipe Properti <span className="text-[#B33A3A]">*</span></label>
          <div className="flex gap-4 mt-1">
            {['Villa', 'Ruko'].map((t) => (
              <label key={t} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="tipe"
                  value={t}
                  checked={formData.tipe === t}
                  onChange={handleChange}
                  className="accent-[#C9A961] h-4 w-4"
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Jumlah Tingkat */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Jumlah Tingkat / Lantai <span className="text-[#B33A3A]">*</span></label>
          <input
            type="number"
            step="0.1"
            name="tingkat"
            value={formData.tingkat}
            onChange={handleChange}
            placeholder="Rentang 1 - 10. Contoh: 2.5"
            className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm"
          />
          {errors.tingkat && <span className="text-[#B33A3A] font-bold mt-0.5">{errors.tingkat}</span>}
        </div>

        {/* Harga */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Harga Jual (Rupiah murni) <span className="text-[#B33A3A]">*</span></label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Contoh: 1350000000"
            className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm"
          />
          {formData.price && (
            <span className="text-[10px] text-gray-400 font-medium">
              Format: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(formData.price))}
            </span>
          )}
          {errors.price && <span className="text-[#B33A3A] font-bold mt-0.5">{errors.price}</span>}
        </div>

        {/* Kesiapan Select */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Kesiapan Huni <span className="text-[#B33A3A]">*</span></label>
          <select
            name="siap"
            value={formData.siap}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm"
          >
            <option value="siap_huni">Siap Huni</option>
            <option value="siap_kosong">Siap Kosong</option>
            <option value="siap_huni_renovasi">Siap Huni (Renovasi)</option>
          </select>
        </div>

        {/* Hadap Checkbox */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Hadap Arah (Bisa pilih multi-kombinasi) <span className="text-[#B33A3A]">*</span></label>
          <div className="flex flex-wrap gap-4 mt-1">
            {HADAP_OPTIONS.map((h) => (
              <label key={h} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={h}
                  checked={formData.hadap.includes(h)}
                  onChange={handleCheckboxChange}
                  className="accent-[#C9A961] h-4 w-4 rounded"
                />
                <span>{h}</span>
              </label>
            ))}
          </div>
          {errors.hadap && <span className="text-[#B33A3A] font-bold mt-0.5">{errors.hadap}</span>}
        </div>

        {/* Maps Link */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Tautan Google Maps</label>
          <input
            type="text"
            name="maps_link"
            value={formData.maps_link}
            onChange={handleChange}
            placeholder="https://www.google.com/maps/place/..."
            className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm"
          />
          {errors.maps_link && <span className="text-[#B33A3A] font-bold mt-0.5">{errors.maps_link}</span>}
        </div>
        {/* Status Stok */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Status Stok <span className="text-[#B33A3A]">*</span></label>
          <div className="flex gap-4 mt-1">
            {[
              { value: 'in_stock', label: 'In Stock' },
              { value: 'sold_out', label: 'Sold Out' },
            ].map((s) => (
              <label key={s.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  checked={formData.status === s.value}
                  onChange={handleChange}
                  className="accent-[#C9A961] h-4 w-4"
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Carport Toggle */}
        <div className="flex items-center gap-2 mt-4 select-none">
          <input
            type="checkbox"
            name="carport"
            id="carport"
            checked={formData.carport}
            onChange={handleToggleChange}
            className="accent-[#C9A961] h-4.5 w-4.5 rounded cursor-pointer"
          />
          <label htmlFor="carport" className="font-bold text-gray-600 uppercase tracking-wider cursor-pointer">Memiliki Garasi / Carport</label>
        </div>

        {/* Unit Info Description */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="font-bold text-gray-500 uppercase tracking-wider">Keterangan Tambahan Unit</label>
          <input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="Contoh: Ready Siap huni, Gate siap"
            className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm"
          />
        </div>

        {/* Buttons Action */}
        <div className="flex flex-col sm:flex-row gap-3 md:col-span-2 justify-end border-t border-gray-100 pt-5 mt-4">
          <button
            type="button"
            onClick={() => router.push('/agent/dashboard')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded text-xs transition uppercase"
          >
            Batal
          </button>
          
          {/* Simpan & Tambah Lagi (Hanya tampil di Mode Create - AC-8.1) */}
          {!isEditMode && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave('add_more')}
              className="border border-[#C9A961] hover:bg-[#C9A961]/10 text-[#C9A961] font-bold px-5 py-2.5 rounded text-xs transition uppercase disabled:opacity-50"
            >
              Simpan &amp; Tambah Lagi
            </button>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave('redirect')}
            className="bg-[#1A1A1A] hover:bg-black text-[#C9A961] hover:text-[#D5BD81] font-bold px-6 py-2.5 rounded text-xs transition uppercase disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Properti'}
          </button>
        </div>

      </form>

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
