// ============================================================
// mockDb.ts — Supabase-backed data layer
// Replaces all local JSON file I/O with Supabase queries
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Types ────────────────────────────────────────────────

export interface Property {
  id: string;
  nama_property: string;
  group: string | null;
  lebar: number;
  panjang: number;
  hadap: string[];
  tipe: 'Ruko' | 'Villa';
  tingkat: number;
  price: number;
  carport: boolean;
  status: 'in_stock' | 'sold_out';
  siap: 'siap_huni' | 'siap_kosong' | 'siap_huni_renovasi';
  maps_link: string | null;
  kawasan: string[];
  unit: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at: string | null;
}

export interface AuditLog {
  id: string;
  property_id: string;
  property_name: string;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE';
  changed_by: string;
  changed_fields: string;
  created_at: string;
}

export interface LockoutState {
  failedAttempts: number;
  lockedUntil: string | null;
}

export interface SiteProfile {
  nama_perusahaan: string;
  tagline_baris1: string;
  tagline_baris2: string;
  deskripsi_hero: string;
  alamat: string;
  telepon: string;
  telepon_display: string;
  whatsapp: string;
  whatsapp_display: string;
  email: string;
  jam_operasional: string;
  hari_operasional: string;
  akurasi_dimensi: number;
  maps_embed_url: string;
  updated_at: string;
  updated_by: string;
}

export interface ContactMessage {
  id: string;
  nama: string;
  email: string;
  hp: string;
  pesan: string;
  created_at: string;
  is_read: boolean;
}

// ─── Helpers ──────────────────────────────────────────────

function nanoid(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ─── Properties ───────────────────────────────────────────

export async function readProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Property[];
}

export async function writeProperties(properties: Property[]): Promise<void> {
  // Used for bulk updates (e.g. soft-delete). Upsert all.
  const { error } = await supabase
    .from('properties')
    .upsert(properties, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function upsertProperty(property: Property): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .upsert(property, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function softDeleteProperty(id: string, deletedAt: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({ deleted_at: deletedAt })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Audit Logs ───────────────────────────────────────────

export async function readAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AuditLog[];
}

export async function writeAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
  const newLog: AuditLog = {
    id: `log-${nanoid()}`,
    ...log,
    created_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('audit_logs').insert(newLog);
  if (error) throw new Error(error.message);
}

// ─── Lockout ──────────────────────────────────────────────

export async function readLockouts(): Promise<Record<string, LockoutState>> {
  const { data, error } = await supabase.from('lockouts').select('*');
  if (error) throw new Error(error.message);

  const result: Record<string, LockoutState> = {};
  for (const row of data ?? []) {
    result[row.email] = {
      failedAttempts: row.failed_attempts,
      lockedUntil: row.locked_until ?? null,
    };
  }
  return result;
}

export async function writeLockouts(lockouts: Record<string, LockoutState>): Promise<void> {
  const rows = Object.entries(lockouts).map(([email, state]) => ({
    email,
    failed_attempts: state.failedAttempts,
    locked_until: state.lockedUntil ?? null,
  }));

  if (rows.length === 0) return;

  const { error } = await supabase
    .from('lockouts')
    .upsert(rows, { onConflict: 'email' });
  if (error) throw new Error(error.message);
}

// ─── Site Profile ─────────────────────────────────────────

export async function readSiteProfile(): Promise<SiteProfile> {
  const { data, error } = await supabase
    .from('site_profile')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) {
    // Return default if not found
    return {
      nama_perusahaan: 'Prime Property',
      tagline_baris1: 'Hunian Mewah',
      tagline_baris2: 'Tanpa Batasan',
      deskripsi_hero: 'Menghadirkan kurasi Villa & Ruko premium di lokasi paling bergengsi di Medan.',
      alamat: 'Jl. Cemara Asri Boulevard No. 88, Medan, Sumatera Utara',
      telepon: '+6261​88997766',
      telepon_display: '+62 61 8899 7766',
      whatsapp: '6281160008899',
      whatsapp_display: '+62 811 6000 8899',
      email: 'info@primeproperty.com',
      jam_operasional: '08.00 – 17.00 WIB',
      hari_operasional: 'Senin – Sabtu',
      akurasi_dimensi: 99,
      maps_embed_url: '',
      updated_at: new Date().toISOString(),
      updated_by: 'system',
    };
  }

  return data as SiteProfile;
}

export async function writeSiteProfile(profile: SiteProfile): Promise<void> {
  const { error } = await supabase
    .from('site_profile')
    .upsert({ id: 1, ...profile }, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

// ─── Contact Messages ─────────────────────────────────────

export async function readContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ContactMessage[];
}

export async function writeContactMessage(
  msg: Omit<ContactMessage, 'id' | 'created_at' | 'is_read'>
): Promise<ContactMessage> {
  const newMsg: ContactMessage = {
    id: `msg-${nanoid()}`,
    ...msg,
    created_at: new Date().toISOString(),
    is_read: false,
  };
  const { error } = await supabase.from('contact_messages').insert(newMsg);
  if (error) throw new Error(error.message);
  return newMsg;
}

// ─── Contact Rate Limit ───────────────────────────────────

export async function checkContactRateLimit(ip: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Count recent submissions from this IP
  const { count, error } = await supabase
    .from('contact_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gt('submitted_at', oneHourAgo);

  if (error) throw new Error(error.message);
  if ((count ?? 0) >= 3) return false;

  // Record new submission
  await supabase.from('contact_limits').insert({ ip, submitted_at: new Date().toISOString() });

  // Cleanup old records (older than 1 hour) — fire and forget
  supabase
    .from('contact_limits')
    .delete()
    .lt('submitted_at', oneHourAgo)
    .then(() => {});

  return true;
}

// ─── Legacy no-op (kept for compatibility) ────────────────
export function initDb() { /* no-op: Supabase handles schema */ }
