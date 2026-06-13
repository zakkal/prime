import React from 'react';
import { getAuthenticatedAgent } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { readProperties, writeProperties, writeAuditLog, Property } from '@/lib/mockDb';
import PropertyForm from '@/components/PropertyForm';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

export default async function NewPropertyPage() {
  const agent = await getAuthenticatedAgent();
  if (!agent) {
    redirect('/agent/login');
  }

  // Admin Role Restriction (AC-5.2 & AC-8.1: Hanya Superadmin yang bisa Create)
  if (agent.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm max-w-md">
          <span className="text-4xl">🚫</span>
          <h1 className="text-xl font-bold text-[#B33A3A] mt-4 uppercase">403 - Akses Ditolak</h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Maaf, Anda login sebagai <strong>{agent.nama} (Admin)</strong> yang memiliki akses baca saja. Fitur tambah properti hanya diizinkan untuk <strong>Superadmin</strong>.
          </p>
          <a 
            href="/agent/dashboard" 
            className="mt-6 inline-block bg-[#1A1A1A] text-[#C9A961] font-bold text-xs px-4 py-2 rounded uppercase tracking-wider transition hover:bg-black"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Server Action for adding properties (AC-8.1 & AC-8.4)
  const handleCreateAction = async (data: any) => {
    'use server';

    const agentCheck = await getAuthenticatedAgent();
    if (!agentCheck || agentCheck.role !== 'superadmin') {
      return { success: false, error: 'Akses Ditolak (403). Hanya Superadmin yang dapat menambahkan properti.' };
    }

    // Secondary Server-side Validations
    if (!data.nama_property || data.nama_property.length < 3 || data.nama_property.length > 100) {
      return { success: false, error: 'Validasi Gagal: Nama properti tidak valid.' };
    }
    if (data.lebar <= 0 || data.panjang <= 0 || data.price <= 0 || data.tingkat < 1 || data.tingkat > 10) {
      return { success: false, error: 'Validasi Gagal: Nilai angka melanggar aturan jangkauan.' };
    }

    const properties = readProperties();
    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: agentCheck.id,
      deleted_at: null
    };

    properties.unshift(newProperty);
    writeProperties(properties);

    // Audit log
    writeAuditLog({
      property_id: newProperty.id,
      property_name: newProperty.nama_property,
      action_type: 'CREATE',
      changed_by: agentCheck.nama,
      changed_fields: JSON.stringify(newProperty)
    });

    revalidatePath('/agent/dashboard');
    revalidatePath('/');
    return { success: true };
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Tambah Properti Baru</h1>
          <p className="text-xs text-gray-500 mt-0.5">Lengkapi data rincian fisik, lokasi kawasan, dan hadap bangunan.</p>
        </div>
        <PropertyForm onSubmitAction={handleCreateAction} />
      </div>
    </div>
  );
}
