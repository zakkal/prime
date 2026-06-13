'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { Property } from '@/lib/mockDb';
import Toast from '@/components/Toast';
import Logo from '@/components/Logo';
import { formatRupiah, formatTanggal } from '@/lib/utils';

interface TableDashboardProps {
  initialProperties: Property[];
  role: 'admin' | 'superadmin';
  userName: string;
  onDeleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
  onBulkDeleteAction: (ids: string[]) => Promise<{ success: boolean; error?: string; deletedCount?: number }>;
}

export default function TableDashboard({ initialProperties, role, userName, onDeleteAction, onBulkDeleteAction }: TableDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // --- OPTIONS DATA ---
  const KAWASAN_OPTIONS = ['Krakatau', 'Pancing', 'Cemara Asri', 'Tembung', 'Helvetia', 'Kuala'];
  const HADAP_OPTIONS = ['Utara', 'Selatan', 'Timur', 'Barat'];
  const SIAP_OPTIONS = [
    { value: 'siap_huni', label: 'Siap Huni' },
    { value: 'siap_kosong', label: 'Siap Kosong' },
    { value: 'siap_huni_renovasi', label: 'Siap Huni (Renovasi)' },
  ];

  // --- STATE FILTER & PENCARIAN (AC-7.2) ---
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedKawasan, setSelectedKawasan] = useState<string[]>(
    searchParams.getAll('kawasan')
  );
  const [selectedHadap, setSelectedHadap] = useState<string[]>(
    searchParams.getAll('hadap')
  );
  const [minLebar, setMinLebar] = useState(searchParams.get('min_lebar') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [tipe, setTipe] = useState(searchParams.get('tipe') || 'Semua');
  const [status, setStatus] = useState(searchParams.get('status') || 'Semua');
  const [selectedSiap, setSelectedSiap] = useState<string[]>(
    searchParams.getAll('siap')
  );
  const [carport, setCarport] = useState(searchParams.get('carport') || 'Semua');

  // --- SORT & PAGINATION STATE (AC-7.1) ---
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc'
  );
  const [pageSize, setPageSize] = useState(Number(searchParams.get('limit')) || 50);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  // --- DETIL DRAWER STATE (AC-7.3) ---
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- BULK SELECTION STATE (Superadmin) ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Debounced search term & numeric filters
  const debouncedSearch = useDebounce(search, 300);
  const debouncedMinLebar = useDebounce(minLebar, 300);
  const debouncedMaxPrice = useDebounce(maxPrice, 300);

  // --- SINKRONISASI STATE FILTER KE URL QUERY PARAMS (AC-7.2) ---
  const updateQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) params.set('q', debouncedSearch);
    selectedKawasan.forEach((k) => params.append('kawasan', k));
    selectedHadap.forEach((h) => params.append('hadap', h));
    if (debouncedMinLebar) params.set('min_lebar', debouncedMinLebar);
    if (debouncedMaxPrice) params.set('max_price', debouncedMaxPrice);
    if (tipe !== 'Semua') params.set('tipe', tipe);
    if (status !== 'Semua') params.set('status', status);
    selectedSiap.forEach((s) => params.append('siap', s));
    if (carport !== 'Semua') params.set('carport', carport);

    if (sortBy !== 'created_at') params.set('sort_by', sortBy);
    if (sortOrder !== 'desc') params.set('sort_order', sortOrder);
    if (pageSize !== 50) params.set('limit', String(pageSize));
    if (currentPage !== 1) params.set('page', String(currentPage));

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [
    debouncedSearch,
    selectedKawasan,
    selectedHadap,
    debouncedMinLebar,
    debouncedMaxPrice,
    tipe,
    status,
    selectedSiap,
    carport,
    sortBy,
    sortOrder,
    pageSize,
    currentPage,
    router,
    pathname,
  ]);

  useEffect(() => {
    updateQueryParams();
  }, [updateQueryParams]);

  // --- LOGIKA FILTERING FRONTEND ---
  const getFilteredProperties = () => {
    return initialProperties
      .filter((prop) => {
        // Search Term (Nama, Group, Kawasan)
        if (debouncedSearch) {
          const s = debouncedSearch.toLowerCase();
          const matchName = prop.nama_property.toLowerCase().includes(s);
          const matchGroup = prop.group?.toLowerCase().includes(s) || false;
          const matchKawasan = prop.kawasan.some((k) => k.toLowerCase().includes(s));
          if (!matchName && !matchGroup && !matchKawasan) return false;
        }

        // Multi-select Kawasan
        if (selectedKawasan.length > 0) {
          const matchKawasan = prop.kawasan.some((k) => selectedKawasan.includes(k));
          if (!matchKawasan) return false;
        }

        // Min Lebar
        if (debouncedMinLebar) {
          if (prop.lebar < Number(debouncedMinLebar)) return false;
        }

        // Multi-select Hadap
        if (selectedHadap.length > 0) {
          const matchHadap = prop.hadap.some((h) => selectedHadap.includes(h));
          if (!matchHadap) return false;
        }

        // Max Price
        if (debouncedMaxPrice) {
          if (prop.price > Number(debouncedMaxPrice)) return false;
        }

        // Radio Tipe
        if (tipe !== 'Semua') {
          if (prop.tipe !== tipe) return false;
        }

        // Radio Status
        if (status !== 'Semua') {
          if (prop.status !== status) return false;
        }

        // Multi-select Siap
        if (selectedSiap.length > 0) {
          if (!selectedSiap.includes(prop.siap)) return false;
        }

        // Toggle/Select Carport
        if (carport !== 'Semua') {
          const hasCarport = carport === 'Ya';
          if (prop.carport !== hasCarport) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let fieldA: any = a[sortBy as keyof Property];
        let fieldB: any = b[sortBy as keyof Property];

        if (typeof fieldA === 'string') {
          fieldA = fieldA.toLowerCase();
          fieldB = fieldB.toLowerCase();
        }

        if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  };

  const filteredProperties = getFilteredProperties();
  const totalItems = filteredProperties.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + pageSize);

  // --- RESET FILTER (AC-7.2) ---
  const handleResetFilter = () => {
    setSearch('');
    setSelectedKawasan([]);
    setSelectedHadap([]);
    setMinLebar('');
    setMaxPrice('');
    setTipe('Semua');
    setStatus('Semua');
    setSelectedSiap([]);
    setCarport('Semua');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // --- REMOVE SINGLE CHIP FILTER ---
  const removeKawasanChip = (val: string) => setSelectedKawasan(selectedKawasan.filter((x) => x !== val));
  const removeHadapChip = (val: string) => setSelectedHadap(selectedHadap.filter((x) => x !== val));
  const removeSiapChip = (val: string) => setSelectedSiap(selectedSiap.filter((x) => x !== val));

  // --- BULK SELECTION HANDLERS ---
  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedProperties.map(p => p.id);
    const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allSelected) { pageIds.forEach(id => next.delete(id)); }
      else { pageIds.forEach(id => next.add(id)); }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Yakin hapus ${ids.length} properti yang dipilih?\nTindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await onBulkDeleteAction(ids);
      if (res.success) {
        setToast({ message: `${res.deletedCount ?? ids.length} properti berhasil dihapus.`, type: 'success' });
        setSelectedIds(new Set());
        setIsDrawerOpen(false);
        router.refresh();
      } else {
        setToast({ message: res.error || 'Gagal menghapus properti terpilih.', type: 'error' });
      }
    } catch { setToast({ message: 'Gagal menghubungi server.', type: 'error' }); }
  };

  const handleDeleteAll = async () => {
    const allIds = filteredProperties.map(p => p.id);
    if (allIds.length === 0) return;
    if (!window.confirm(`⚠️ PERINGATAN KERAS\n\nAnda akan menghapus SEMUA ${allIds.length} properti yang sedang ditampilkan.\nTindakan ini TIDAK DAPAT dibatalkan!\n\nTekan OK untuk melanjutkan.`)) return;
    try {
      const res = await onBulkDeleteAction(allIds);
      if (res.success) {
        setToast({ message: `Semua properti (${res.deletedCount ?? allIds.length} unit) berhasil dihapus.`, type: 'success' });
        setSelectedIds(new Set());
        setIsDrawerOpen(false);
        router.refresh();
      } else {
        setToast({ message: res.error || 'Gagal menghapus semua properti.', type: 'error' });
      }
    } catch { setToast({ message: 'Gagal menghubungi server.', type: 'error' }); }
  };

  // --- EXPORT TO EXCEL (HTML Blob — styled with borders) ---
  const handleExportExcel = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { dateStyle: 'full' });
    const rows = filteredProperties.map((p, i) => `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9f6ef'}">
        <td style="text-align:center">${i + 1}</td>
        <td><b>${p.nama_property}</b></td>
        <td>${p.group || '-'}</td>
        <td style="text-align:center">${p.lebar}</td>
        <td style="text-align:center">${p.panjang}</td>
        <td>${p.hadap.join(', ')}</td>
        <td style="text-align:center">${p.tipe}</td>
        <td style="text-align:center">${p.tingkat}</td>
        <td style="text-align:right;font-weight:bold;color:#A8893E">${formatRupiah(p.price)}</td>
        <td style="text-align:center">${p.carport ? 'Ya' : 'Tidak'}</td>
        <td style="text-align:center;font-weight:bold;color:${p.status === 'in_stock' ? '#059669' : '#B33A3A'}">${p.status === 'in_stock' ? 'In Stock' : 'Sold Out'}</td>
        <td>${p.siap.replace(/_/g, ' ')}</td>
        <td>${p.kawasan.join(', ')}</td>
        <td>${p.unit || '-'}</td>
      </tr>`).join('');

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Inventori Properti</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #c0c0c0; padding: 7px 10px; vertical-align: middle; }
  .title { font-size: 16pt; font-weight: bold; color: #1A1A1A; border: none; }
  .subtitle { font-size: 10pt; color: #777; border: none; }
  thead th { background-color: #1A1A1A; color: #C9A961; font-weight: bold; font-size: 10pt; text-align: center; }
  tfoot td { background-color: #f0ede5; font-weight: bold; font-size: 10pt; border-top: 2px solid #C9A961; }
</style></head>
<body>
  <table>
    <thead>
      <tr><th colspan="14" class="title" style="text-align:left;background:#ffffff;color:#1A1A1A;border-bottom:3px solid #C9A961;padding:12px 10px">🏢 Prime Property — Laporan Inventori Properti</th></tr>
      <tr><td colspan="14" class="subtitle" style="background:#fafafa;padding:6px 10px">Tanggal Export: ${dateStr} &nbsp;|&nbsp; Total: ${filteredProperties.length} unit</td></tr>
      <tr><th></th><th>Nama Properti</th><th>Group/Cluster</th><th>Lebar (m)</th><th>Panjang (m)</th><th>Hadap</th><th>Tipe</th><th>Tingkat</th><th>Harga (Rp)</th><th>Carport</th><th>Status</th><th>Kesiapan</th><th>Kawasan</th><th>Unit Info</th></tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="8" style="text-align:right">Total Nilai Inventori:</td>
        <td style="text-align:right;color:#A8893E">${formatRupiah(filteredProperties.reduce((s, p) => s + p.price, 0))}</td>
        <td colspan="5"></td>
      </tr>
    </tfoot>
  </table>
</body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prime_Property_Inventori_${now.toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ message: `File Excel berhasil diunduh! (${filteredProperties.length} unit)`, type: 'success' });
  };

  // --- PRINT PDF ---
  const handlePrintPDF = () => {
    window.print();
  };

  // --- LOGOUT AGENT ---
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth', { method: 'DELETE' });
      if (res.ok) {
        window.location.href = '/agent/login';
      }
    } catch (e) {
      setToast({ message: 'Gagal melakukan logout.', type: 'error' });
    }
  };

  // --- DELETE HANDLER (SOFT DELETE) (AC-8.3) ---
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Yakin hapus properti [${name}]? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const res = await onDeleteAction(id);
      if (res.success) {
        setToast({ message: `Properti [${name}] berhasil dihapus secara soft-delete.`, type: 'success' });
        setIsDrawerOpen(false);
        router.refresh();
      } else {
        setToast({ message: res.error || 'Gagal menghapus properti.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Gagal menghubungi server.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans antialiased flex flex-col">
      {/* 1. Header Dashboard Premium (AC-1.1 & AC-5.3) */}
      <header className="sticky top-0 z-40 bg-[#1A1A1A] text-white py-4 px-6 md:px-12 flex items-center justify-between shadow-md border-b border-[#C9A961]/20">
        <div className="flex items-center gap-3">
          <Logo light={true} />
          <span className="text-gray-500">|</span>
          <span className="text-xs font-bold tracking-wider uppercase text-gray-300">Agent Portal</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-[#C9A961] font-bold tracking-wider">
              {role === 'superadmin' ? '👑 SUPERADMIN' : '👤 ADMIN'}
            </p>
            <p className="text-sm font-semibold">{userName}</p>
          </div>
          
          <div className="h-10 w-10 bg-gradient-to-tr from-[#C9A961] to-[#D5BD81] text-black font-extrabold rounded-full flex items-center justify-center text-sm select-none">
            {userName.substring(0, 2).toUpperCase()}
          </div>

          {/* Pengaturan Profil - Superadmin only */}
          {role === 'superadmin' && (
            <button 
              onClick={() => router.push('/agent/dashboard/settings')}
              className="border border-[#C9A961] hover:bg-[#C9A961] text-[#C9A961] hover:text-black font-bold text-[10px] px-4 py-2.5 rounded-xl transition-all duration-200 uppercase tracking-widest cursor-pointer flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Pengaturan Profil</span>
            </button>
          )}

          {/* Dedicated Logout Button (AC-5.3) */}
          <button 
            onClick={handleLogout}
            className="border border-[#B33A3A] hover:bg-[#B33A3A] text-[#B33A3A] hover:text-white font-bold text-[10px] px-4 py-2.5 rounded-xl transition-all duration-200 uppercase tracking-widest cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-[1600px] mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 w-full flex-1">
        
        {/* Statistics Cards Ringkasan Properti */}
        <section className="col-span-1 lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-2 animate-fade-in">
          {[
            {
              label: 'Total Unit Aktif',
              value: initialProperties.length,
              icon: '🏢',
              color: 'border-l-4 border-l-[#C9A961]'
            },
            {
              label: 'Unit In Stock',
              value: initialProperties.filter(p => p.status === 'in_stock').length,
              icon: '🟢',
              color: 'border-l-4 border-l-emerald-500'
            },
            {
              label: 'Unit Sold Out',
              value: initialProperties.filter(p => p.status === 'sold_out').length,
              icon: '🔴',
              color: 'border-l-4 border-l-[#B33A3A]'
            },
            {
              label: 'Total Nilai Inventori',
              value: formatRupiah(initialProperties.reduce((sum, p) => sum + p.price, 0)),
              icon: '🪙',
              color: 'border-l-4 border-l-amber-600'
            }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex items-center justify-between ${stat.color} hover:shadow-md transition-all duration-200`}>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.label}</span>
                <span className="text-base md:text-lg font-black text-[#1A1A1A]">{stat.value}</span>
              </div>
              <span className="text-xl">{stat.icon}</span>
            </div>
          ))}
        </section>

        {/* 2. Side Panel Filter (AC-7.2) */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-6 h-fit">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-[#1A1A1A]">Filter Properti</h2>
            <button 
              onClick={handleResetFilter}
              className="text-xs font-semibold text-[#B33A3A] hover:underline"
            >
              Reset Semua
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pencarian Bebas</label>
            <input
              type="text"
              placeholder="Nama, group, kawasan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none transition"
            />
          </div>

          {/* Kawasan Multi-Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kawasan</label>
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-2">
              {KAWASAN_OPTIONS.map((k) => (
                <label key={k} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedKawasan.includes(k)}
                    onChange={() => {
                      setSelectedKawasan(
                        selectedKawasan.includes(k)
                          ? selectedKawasan.filter((x) => x !== k)
                          : [...selectedKawasan, k]
                      );
                    }}
                    className="accent-[#C9A961] h-3.5 w-3.5 rounded"
                  />
                  <span>{k}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lebar Minimal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lebar Min. (Meter)</label>
            <input
              type="number"
              placeholder="Contoh: 5"
              value={minLebar}
              onChange={(e) => setMinLebar(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none"
            />
          </div>

          {/* Hadap Multi-Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hadap Arah</label>
            <div className="grid grid-cols-2 gap-2">
              {HADAP_OPTIONS.map((h) => (
                <label key={h} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedHadap.includes(h)}
                    onChange={() => {
                      setSelectedHadap(
                        selectedHadap.includes(h)
                          ? selectedHadap.filter((x) => x !== h)
                          : [...selectedHadap, h]
                      );
                    }}
                    className="accent-[#C9A961] h-3.5 w-3.5"
                  />
                  <span>{h}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Harga Max */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Harga Maksimum</label>
            <input
              type="number"
              placeholder="Maksimum Harga"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-[#C9A961] focus:outline-none"
            />
            {maxPrice && (
              <span className="text-[10px] text-gray-400 font-medium">
                {formatRupiah(Number(maxPrice))}
              </span>
            )}
          </div>

          {/* Tipe Radio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tipe Properti</label>
            <div className="flex gap-4">
              {['Semua', 'Ruko', 'Villa'].map((t) => (
                <label key={t} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="tipe"
                    value={t}
                    checked={tipe === t}
                    onChange={() => setTipe(t)}
                    className="accent-[#C9A961] h-3.5 w-3.5"
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Radio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status Stok</label>
            <div className="flex flex-col gap-2">
              {['Semua', 'in_stock', 'sold_out'].map((s) => (
                <label key={s} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="accent-[#C9A961] h-3.5 w-3.5"
                  />
                  <span className="capitalize">
                    {s === 'Semua' ? 'Semua Status' : s === 'in_stock' ? 'In Stock' : 'Sold Out'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Kesiapan Properti */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kesiapan Huni</label>
            <div className="space-y-1.5">
              {SIAP_OPTIONS.map((o) => (
                <label key={o.value} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSiap.includes(o.value)}
                    onChange={() => {
                      setSelectedSiap(
                        selectedSiap.includes(o.value)
                          ? selectedSiap.filter((x) => x !== o.value)
                          : [...selectedSiap, o.value]
                      );
                    }}
                    className="accent-[#C9A961] h-3.5 w-3.5"
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Carport Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fasilitas Carport</label>
            <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded">
              {['Semua', 'Ya', 'Tidak'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCarport(val)}
                  className={`text-[10px] font-bold py-1.5 rounded transition ${
                    carport === val 
                      ? 'bg-[#1A1A1A] text-white shadow-sm' 
                      : 'text-gray-500 hover:text-[#1A1A1A]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Panel Tabel & Konten Utama */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Header Konten & Aksi Tambah */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#1A1A1A]">Daftar Inventori Properti</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Menampilkan {paginatedProperties.length} dari {totalItems} unit aktif
                {role === 'superadmin' && selectedIds.size > 0 && (
                  <span className="ml-2 font-bold text-[#B33A3A]">· {selectedIds.size} dipilih</span>
                )}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Ekspor Excel */}
              <button 
                onClick={handleExportExcel}
                title="Ekspor data inventori ke file Excel (.xls) dengan border dan format rapi"
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 w-fit uppercase tracking-wider border border-emerald-600 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Ekspor Excel</span>
              </button>

              {/* Cetak PDF - Superadmin only */}
              {role === 'superadmin' && (
                <button 
                  onClick={handlePrintPDF}
                  title="Cetak atau simpan halaman sebagai PDF"
                  className="border-2 border-[#C9A961] text-[#C9A961] hover:bg-[#C9A961] hover:text-black font-bold text-xs px-4 py-2.5 rounded shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 w-fit uppercase tracking-wider cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Cetak PDF</span>
                </button>
              )}

              {/* Hapus Semua - Superadmin only */}
              {role === 'superadmin' && filteredProperties.length > 0 && (
                <button 
                  onClick={handleDeleteAll}
                  title={`Hapus semua ${filteredProperties.length} properti yang ditampilkan`}
                  className="border-2 border-[#B33A3A] text-[#B33A3A] hover:bg-[#B33A3A] hover:text-white font-bold text-xs px-4 py-2.5 rounded shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 w-fit uppercase tracking-wider cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Hapus Semua ({filteredProperties.length})</span>
                </button>
              )}


              {/* Tambah Properti - Superadmin only */}
              {role === 'superadmin' && (
                <button 
                  onClick={() => router.push('/agent/dashboard/new')}
                  className="bg-[#C9A961] hover:bg-[#D5BD81] text-black font-bold text-xs px-4 py-2.5 rounded shadow-sm hover:shadow transition-all duration-200 flex items-center gap-1.5 w-fit uppercase tracking-wider cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tambah Properti</span>
                </button>
              )}
            </div>
          </div>

          {/* Bulk Action Floating Bar (superadmin only) */}
          {role === 'superadmin' && selectedIds.size > 0 && (
            <div className="flex items-center justify-between bg-[#1A1A1A] text-white px-5 py-3 rounded-lg shadow-lg border border-[#C9A961]/30 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#C9A961] animate-pulse" />
                <span className="text-sm font-bold">{selectedIds.size} properti dipilih</span>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-[10px] text-gray-400 hover:text-white underline underline-offset-2 cursor-pointer"
                >Batalkan Pilihan</button>
              </div>
              <button
                onClick={handleBulkDelete}
                className="bg-[#B33A3A] hover:bg-[#962f2f] text-white font-black text-[11px] px-5 py-2 rounded-lg uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus {selectedIds.size} yang Dipilih
              </button>
            </div>
          )}

          {/* Active Filter Chips (AC-7.2) */}
          {(selectedKawasan.length > 0 || selectedHadap.length > 0 || selectedSiap.length > 0 || tipe !== 'Semua' || status !== 'Semua' || minLebar || maxPrice || carport !== 'Semua') && (
            <div className="flex flex-wrap gap-2 items-center bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Filter Aktif:</span>
              
              {selectedKawasan.map((k) => (
                <span key={k} className="inline-flex items-center gap-1 bg-[#F5F5F5] border border-gray-200 text-[#1A1A1A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Kawasan: {k}
                  <button onClick={() => removeKawasanChip(k)} className="hover:text-red-500 font-bold text-[9px] ml-0.5">✕</button>
                </span>
              ))}

              {selectedHadap.map((h) => (
                <span key={h} className="inline-flex items-center gap-1 bg-[#F5F5F5] border border-gray-200 text-[#1A1A1A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Hadap: {h}
                  <button onClick={() => removeHadapChip(h)} className="hover:text-red-500 font-bold text-[9px] ml-0.5">✕</button>
                </span>
              ))}

              {selectedSiap.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 bg-[#F5F5F5] border border-gray-200 text-[#1A1A1A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Siap: {s.replace('_', ' ')}
                  <button onClick={() => removeSiapChip(s)} className="hover:text-red-500 font-bold text-[9px] ml-0.5">✕</button>
                </span>
              ))}

              {tipe !== 'Semua' && (
                <span className="inline-flex items-center gap-1 bg-[#F5F5F5] border border-gray-200 text-[#1A1A1A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Tipe: {tipe}
                  <button onClick={() => setTipe('Semua')} className="hover:text-red-500 font-bold text-[9px] ml-0.5">✕</button>
                </span>
              )}

              {status !== 'Semua' && (
                <span className="inline-flex items-center gap-1 bg-[#F5F5F5] border border-gray-200 text-[#1A1A1A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Status: {status === 'in_stock' ? 'In Stock' : 'Sold Out'}
                  <button onClick={() => setStatus('Semua')} className="hover:text-red-500 font-bold text-[9px] ml-0.5">✕</button>
                </span>
              )}

              {carport !== 'Semua' && (
                <span className="inline-flex items-center gap-1 bg-[#F5F5F5] border border-gray-200 text-[#1A1A1A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Carport: {carport}
                  <button onClick={() => setCarport('Semua')} className="hover:text-red-500 font-bold text-[9px] ml-0.5">✕</button>
                </span>
              )}

              <button 
                onClick={handleResetFilter} 
                className="text-[10px] font-bold text-[#B33A3A] ml-auto hover:underline"
              >
                Reset Semua Filter
              </button>
            </div>
          )}

          {/* 4. Data Table Component (AC-7.1) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto relative">
            {isPending && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-xs flex items-center justify-center z-10">
                <span className="text-xs font-bold text-[#C9A961]">Memuat Data...</span>
              </div>
            )}
            
            <table className="w-full text-left border-collapse text-[11px] min-w-[1000px]">
              <thead className="bg-[#1A1A1A] text-white select-none">
                <tr>
                  {/* Checkbox Select All — Superadmin only */}
                  {role === 'superadmin' && (
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        title="Pilih semua di halaman ini"
                        checked={paginatedProperties.length > 0 && paginatedProperties.every(p => selectedIds.has(p.id))}
                        ref={el => { if (el) el.indeterminate = selectedIds.size > 0 && !paginatedProperties.every(p => selectedIds.has(p.id)) && paginatedProperties.some(p => selectedIds.has(p.id)); }}
                        onChange={toggleSelectAll}
                        className="h-3.5 w-3.5 accent-[#C9A961] cursor-pointer"
                      />
                    </th>
                  )}
                  <th 
                    className="p-3.5 font-bold tracking-wider cursor-pointer hover:bg-gray-800 transition"
                    onClick={() => {
                      setSortBy('nama_property');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Nama {sortBy === 'nama_property' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-3.5 font-bold tracking-wider">Group</th>
                  <th className="p-3.5 font-bold tracking-wider">Dimensi (L × P)</th>
                  <th className="p-3.5 font-bold tracking-wider">Hadap</th>
                  <th className="p-3.5 font-bold tracking-wider">Tipe</th>
                  <th className="p-3.5 font-bold tracking-wider">Lt.</th>
                  <th 
                    className="p-3.5 font-bold tracking-wider cursor-pointer hover:bg-gray-800 transition"
                    onClick={() => {
                      setSortBy('price');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Harga {sortBy === 'price' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-3.5 font-bold tracking-wider text-center">Carport</th>
                  <th 
                    className="p-3.5 font-bold tracking-wider cursor-pointer hover:bg-gray-800 transition"
                    onClick={() => {
                      setSortBy('status');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="p-3.5 font-bold tracking-wider">Kesiapan</th>
                  <th className="p-3.5 font-bold tracking-wider">Kawasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProperties.length === 0 ? (
                  <tr>
                    <td colSpan={role === 'superadmin' ? 12 : 11} className="p-12 text-center text-gray-400 font-medium bg-gray-50">
                      ⚠️ Tidak ada unit properti yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  paginatedProperties.map((prop) => {
                    const isSelected = selectedIds.has(prop.id);
                    return (
                      <tr 
                        key={prop.id}
                        onClick={() => {
                          setSelectedProperty(prop);
                          setIsDrawerOpen(true);
                        }}
                        className={`cursor-pointer transition-colors duration-100 ${
                          isSelected
                            ? 'bg-[#C9A961]/8 border-l-2 border-l-[#C9A961]'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Checkbox cell - superadmin only */}
                        {role === 'superadmin' && (
                          <td className="p-3.5 text-center" onClick={(e) => toggleSelect(e, prop.id)}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="h-3.5 w-3.5 accent-[#C9A961] cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="p-3.5 font-bold text-[#1A1A1A]">{prop.nama_property}</td>
                        <td className="p-3.5 text-gray-500">{prop.group || '-'}</td>
                        <td className="p-3.5 font-mono text-gray-600">{prop.lebar}m × {prop.panjang}m</td>
                        <td className="p-3.5">
                          <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">
                            {prop.hadap.join(', ')}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-gray-600">{prop.tipe}</td>
                        <td className="p-3.5">{prop.tingkat}</td>
                        <td className="p-3.5 font-bold text-[#1A1A1A]">{formatRupiah(prop.price)}</td>
                        <td className="p-3.5 text-center text-xs">{prop.carport ? '✅' : '❌'}</td>
                        
                        {/* Status Badge (AC-7.1) */}
                        <td className="p-3.5">
                          {prop.status === 'in_stock' ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[9px] tracking-wider uppercase">
                              In Stock
                            </span>
                          ) : (
                            <span className="bg-[#B33A3A]/10 text-[#B33A3A] font-bold px-2 py-0.5 rounded text-[9px] tracking-wider uppercase">
                              Sold Out
                            </span>
                          )}
                        </td>

                        {/* Kesiapan Badge (AC-7.1) */}
                        <td className="p-3.5">
                          {prop.siap === 'siap_huni' && (
                            <span className="bg-amber-100 text-[#C9A961] font-bold px-2 py-0.5 rounded text-[9px] tracking-wider">
                              Siap Huni
                            </span>
                          )}
                          {prop.siap === 'siap_kosong' && (
                            <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[9px] tracking-wider">
                              Siap Kosong
                            </span>
                          )}
                          {prop.siap === 'siap_huni_renovasi' && (
                            <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[9px] tracking-wider">
                              Huni/Renov
                            </span>
                          )}
                        </td>
                        
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {prop.kawasan.map((k) => (
                              <span key={k} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                                {k}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Tampilkan baris:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded p-1 focus:ring-1 focus:ring-[#C9A961]"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  ◀
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`h-7 w-7 rounded font-bold transition text-xs ${
                      currentPage === p 
                        ? 'bg-[#1A1A1A] text-[#C9A961]' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  ▶
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* 5. Detail Property Drawer (AC-7.3) */}
      {isDrawerOpen && selectedProperty && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-slide-in text-xs border-l border-[#C9A961]/30">
            
            {/* Header Detail */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <div>
                <span className="text-[9px] tracking-widest font-black uppercase text-[#C9A961] bg-black px-2 py-0.5 rounded">
                  Detail Properti
                </span>
                <h3 className="font-extrabold text-base text-[#1A1A1A] mt-1">{selectedProperty.nama_property}</h3>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-400 hover:text-black font-semibold text-lg p-1.5 hover:bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>


            {/* Grid 2 Column */}
            <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-5 mb-5 text-[11px]">
              <div>
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[9px]">Nama Unit</span>
                <p className="font-bold text-[#1A1A1A] mt-0.5">{selectedProperty.nama_property}</p>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[9px]">Group / Cluster</span>
                <p className="font-bold text-[#1A1A1A] mt-0.5">{selectedProperty.group || '-'}</p>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[9px]">Dimensi (L × P)</span>
                <p className="font-bold text-[#1A1A1A] mt-0.5">{selectedProperty.lebar}m × {selectedProperty.panjang}m</p>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[9px]">Hadap Arah</span>
                <p className="font-bold text-[#1A1A1A] mt-0.5">{selectedProperty.hadap.join(', ')}</p>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[9px]">Tipe Bangunan</span>
                <p className="font-bold text-[#1A1A1A] mt-0.5">{selectedProperty.tipe}</p>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[9px]">Jumlah Lantai</span>
                <p className="font-bold text-[#1A1A1A] mt-0.5">{selectedProperty.tingkat} Tingkat</p>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[9px]">Kawasan</span>
                <p className="font-bold text-[#1A1A1A] mt-0.5">{selectedProperty.kawasan.join(', ')}</p>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[9px]">Carport</span>
                <p className="font-bold text-[#1A1A1A] mt-0.5">{selectedProperty.carport ? 'Tersedia' : 'Tidak Ada'}</p>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[9px]">Kesiapan</span>
                <p className="font-bold text-[#1A1A1A] mt-0.5 capitalize">{selectedProperty.siap.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[9px]">Unit Info</span>
                <p className="font-bold text-[#1A1A1A] mt-0.5">{selectedProperty.unit || '-'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[9px]">Harga</span>
                <p className="font-black text-sm text-[#C9A961] mt-0.5">{formatRupiah(selectedProperty.price)}</p>
              </div>
            </div>

            {/* Google Maps Button (AC-7.3) */}
            {selectedProperty.maps_link && (
              <div className="mb-6">
                <a 
                  href={selectedProperty.maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center block bg-[#1A1A1A] hover:bg-black text-[#C9A961] hover:text-[#D5BD81] font-bold py-2.5 rounded border border-[#C9A961]/40 hover:border-[#C9A961] transition"
                >
                  🗺️ Buka di Google Maps
                </a>
              </div>
            )}

            {/* Superadmin Actions (AC-7.3) */}
            {role === 'superadmin' ? (
              <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                <button 
                  onClick={() => router.push(`/agent/dashboard/edit/${selectedProperty.id}`)}
                  className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded transition"
                >
                  📝 Edit Properti
                </button>
                <button 
                  onClick={() => handleDelete(selectedProperty.id, selectedProperty.nama_property)}
                  className="flex-1 bg-[#B33A3A] hover:bg-[#962f2f] text-white font-bold py-2.5 rounded transition"
                >
                  🗑️ Hapus
                </button>
              </div>
            ) : (
              <div className="mt-auto p-3.5 bg-yellow-50 text-yellow-800 rounded border border-yellow-100 text-center font-bold">
                💡 Anda masuk sebagai Admin (Read-only). Hubungi Superadmin untuk mengedit atau menghapus inventori.
              </div>
            )}
          </div>
        </div>
      )}

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
