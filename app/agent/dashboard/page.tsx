import React from 'react';
import { getAuthenticatedAgent } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { readProperties, softDeleteProperty, writeAuditLog } from '@/lib/mockDb';
import TableDashboard from '@/components/TableDashboard';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

export default async function DashboardPage() {
  const agent = await getAuthenticatedAgent();
  if (!agent) {
    redirect('/agent/login');
  }

  const allProperties = await readProperties();
  const activeProperties = allProperties.filter((p) => p.deleted_at === null);

  const handleDeleteAction = async (id: string) => {
    'use server';

    const agentCheck = await getAuthenticatedAgent();
    if (!agentCheck || agentCheck.role !== 'superadmin') {
      return { success: false, error: 'Akses ditolak (403 Forbidden). Hanya superadmin yang dapat menghapus properti.' };
    }

    const properties = await readProperties();
    const prop = properties.find((p) => p.id === id);

    if (!prop) {
      return { success: false, error: 'Properti tidak ditemukan.' };
    }

    const deletedAt = new Date().toISOString();
    await softDeleteProperty(id, deletedAt);

    await writeAuditLog({
      property_id: id,
      property_name: prop.nama_property,
      action_type: 'DELETE',
      changed_by: agentCheck.nama,
      changed_fields: JSON.stringify({ deleted_at: deletedAt }),
    });

    revalidatePath('/agent/dashboard');
    revalidatePath('/');
    return { success: true };
  };

  const handleBulkDeleteAction = async (ids: string[]) => {
    'use server';

    const agentCheck = await getAuthenticatedAgent();
    if (!agentCheck || agentCheck.role !== 'superadmin') {
      return { success: false, error: 'Akses ditolak (403 Forbidden). Hanya superadmin yang dapat menghapus properti.' };
    }

    if (!ids || ids.length === 0) {
      return { success: false, error: 'Tidak ada ID properti yang diberikan.' };
    }

    const properties = await readProperties();
    const now = new Date().toISOString();
    let deletedCount = 0;

    for (const id of ids) {
      const prop = properties.find((p) => p.id === id && p.deleted_at === null);
      if (prop) {
        await softDeleteProperty(id, now);
        await writeAuditLog({
          property_id: id,
          property_name: prop.nama_property,
          action_type: 'DELETE',
          changed_by: agentCheck.nama,
          changed_fields: JSON.stringify({ deleted_at: now, bulk: true }),
        });
        deletedCount++;
      }
    }

    revalidatePath('/agent/dashboard');
    revalidatePath('/');
    return { success: true, deletedCount };
  };

  return (
    <TableDashboard
      initialProperties={activeProperties}
      role={agent.role}
      userName={agent.nama}
      onDeleteAction={handleDeleteAction}
      onBulkDeleteAction={handleBulkDeleteAction}
    />
  );
}
