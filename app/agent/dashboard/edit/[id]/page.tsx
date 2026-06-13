import React from 'react';
import { getAuthenticatedAgent } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { readProperties, writeProperties, writeAuditLog, Property } from '@/lib/mockDb';
import PropertyForm from '@/components/PropertyForm';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPageProps) {
  const agent = await getAuthenticatedAgent();
  if (!agent) {
    redirect('/agent/login');
  }

  // Admin Role Restriction (AC-5.2 & AC-8.2: Hanya Superadmin yang bisa Update)
  if (agent.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm max-w-md">
          <span className="text-4xl">🚫</span>
          <h1 className="text-xl font-bold text-[#B33A3A] mt-4 uppercase">403 - Akses Ditolak</h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Maaf, Anda login sebagai <strong>{agent.nama} (Admin)</strong> yang memiliki akses baca saja. Fitur edit properti hanya diizinkan untuk <strong>Superadmin</strong>.
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

  const { id } = await params;
  const properties = readProperties();
  const property = properties.find((p) => p.id === id && p.deleted_at === null);

  if (!property) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm max-w-md">
          <span className="text-4xl">🔍</span>
          <h1 className="text-xl font-bold text-[#1A1A1A] mt-4 uppercase">404 - Tidak Ditemukan</h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Maaf, properti yang Anda cari tidak ditemukan atau telah dihapus secara soft-delete.
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

  // Server Action for updating property (AC-8.2)
  const handleUpdateAction = async (data: any) => {
    'use server';

    const agentCheck = await getAuthenticatedAgent();
    if (!agentCheck || agentCheck.role !== 'superadmin') {
      return { success: false, error: 'Akses Ditolak (403). Hanya Superadmin yang dapat mengedit properti.' };
    }

    const currentProperties = readProperties();
    const index = currentProperties.findIndex((p) => p.id === id);

    if (index === -1) {
      return { success: false, error: 'Properti tidak ditemukan.' };
    }

    const original = currentProperties[index];

    // Detect changed fields for audit log (AC-8.2: dirty state / changed fields)
    const changedFields: Record<string, { from: any; to: any }> = {};
    Object.keys(data).forEach((key) => {
      const origValue = original[key as keyof Property];
      const newValue = data[key];
      
      // JSON comparison helper for arrays/objects
      const origStr = JSON.stringify(origValue);
      const newStr = JSON.stringify(newValue);
      
      if (origStr !== newStr) {
        changedFields[key] = { from: origValue, to: newValue };
      }
    });

    const updatedProperty: Property = {
      ...original,
      ...data,
      updated_at: new Date().toISOString(),
    };

    currentProperties[index] = updatedProperty;
    writeProperties(currentProperties);

    // Save audit log if any fields changed (AC-8.2)
    if (Object.keys(changedFields).length > 0) {
      writeAuditLog({
        property_id: id,
        property_name: updatedProperty.nama_property,
        action_type: 'UPDATE',
        changed_by: agentCheck.nama,
        changed_fields: JSON.stringify(changedFields),
      });
    }

    revalidatePath('/agent/dashboard');
    revalidatePath('/');
    return { success: true };
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Edit Properti</h1>
          <p className="text-xs text-gray-500 mt-0.5">Ubah rincian properti <strong>{property.nama_property}</strong>. Perubahan akan tercatat di log audit.</p>
        </div>
        <PropertyForm initialData={property} isEditMode={true} onSubmitAction={handleUpdateAction} />
      </div>
    </div>
  );
}
