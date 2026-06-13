import React from 'react';
import { getAuthenticatedAgent } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { readProperties, writeProperties, writeAuditLog } from '@/lib/mockDb';
import TableDashboard from '@/components/TableDashboard';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

export default async function DashboardPage() {
  const agent = await getAuthenticatedAgent();
  if (!agent) {
    redirect('/agent/login');
  }

  // Fetch properties (soft deleted properties are excluded - AC-8.3)
  const activeProperties = readProperties().filter((p) => p.deleted_at === null);

  // Server Action for soft deleting (AC-8.3)
  const handleDeleteAction = async (id: string) => {
    'use server';
    
    // Authorization check in backend (AC-5.2)
    const agentCheck = await getAuthenticatedAgent();
    if (!agentCheck || agentCheck.role !== 'superadmin') {
      return { success: false, error: 'Akses ditolak (403 Forbidden). Hanya superadmin yang dapat menghapus properti.' };
    }

    const properties = readProperties();
    const index = properties.findIndex((p) => p.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Properti tidak ditemukan.' };
    }

    const propName = properties[index].nama_property;
    properties[index].deleted_at = new Date().toISOString();
    writeProperties(properties);

    // Audit log (AC-8.2 / AC-8.3)
    writeAuditLog({
      property_id: id,
      property_name: propName,
      action_type: 'DELETE',
      changed_by: agentCheck.nama,
      changed_fields: JSON.stringify({ deleted_at: properties[index].deleted_at })
    });

    revalidatePath('/agent/dashboard');
    revalidatePath('/');
    return { success: true };
  };

  // Server Action: Bulk soft-delete (Superadmin only)
  const handleBulkDeleteAction = async (ids: string[]) => {
    'use server';

    const agentCheck = await getAuthenticatedAgent();
    if (!agentCheck || agentCheck.role !== 'superadmin') {
      return { success: false, error: 'Akses ditolak (403 Forbidden). Hanya superadmin yang dapat menghapus properti.' };
    }

    if (!ids || ids.length === 0) {
      return { success: false, error: 'Tidak ada ID properti yang diberikan.' };
    }

    const properties = readProperties();
    let deletedCount = 0;
    const now = new Date().toISOString();

    for (const id of ids) {
      const index = properties.findIndex((p) => p.id === id && p.deleted_at === null);
      if (index !== -1) {
        const propName = properties[index].nama_property;
        properties[index].deleted_at = now;

        writeAuditLog({
          property_id: id,
          property_name: propName,
          action_type: 'DELETE',
          changed_by: agentCheck.nama,
          changed_fields: JSON.stringify({ deleted_at: now, bulk: true })
        });

        deletedCount++;
      }
    }

    writeProperties(properties);
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
