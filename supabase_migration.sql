-- ============================================================
-- PRIME PROPERTY - Supabase Migration
-- Jalankan ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Properties
create table if not exists properties (
  id text primary key,
  nama_property text not null,
  "group" text,
  lebar numeric not null,
  panjang numeric not null,
  hadap text[] not null default '{}',
  tipe text not null check (tipe in ('Ruko', 'Villa')),
  tingkat numeric not null,
  price numeric not null,
  carport boolean not null default false,
  status text not null check (status in ('in_stock', 'sold_out')),
  siap text not null check (siap in ('siap_huni', 'siap_kosong', 'siap_huni_renovasi')),
  maps_link text,
  kawasan text[] not null default '{}',
  unit text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text not null,
  deleted_at timestamptz
);

-- 2. Audit Logs
create table if not exists audit_logs (
  id text primary key,
  property_id text not null,
  property_name text not null,
  action_type text not null check (action_type in ('CREATE', 'UPDATE', 'DELETE')),
  changed_by text not null,
  changed_fields text not null,
  created_at timestamptz not null default now()
);

-- 3. Lockout
create table if not exists lockouts (
  email text primary key,
  failed_attempts integer not null default 0,
  locked_until timestamptz
);

-- 4. Site Profile
create table if not exists site_profile (
  id integer primary key default 1,
  nama_perusahaan text not null,
  tagline_baris1 text not null,
  tagline_baris2 text not null,
  deskripsi_hero text not null,
  alamat text not null,
  telepon text not null,
  telepon_display text not null,
  whatsapp text not null,
  whatsapp_display text not null,
  email text not null,
  jam_operasional text not null,
  hari_operasional text not null,
  akurasi_dimensi numeric not null default 99,
  maps_embed_url text not null,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'system'
);

-- 5. Contact Messages
create table if not exists contact_messages (
  id text primary key,
  nama text not null,
  email text not null,
  hp text not null,
  pesan text not null,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

-- 6. Contact Rate Limits
create table if not exists contact_limits (
  ip text not null,
  submitted_at timestamptz not null default now()
);
create index if not exists contact_limits_ip_idx on contact_limits(ip);
create index if not exists contact_limits_time_idx on contact_limits(submitted_at);

-- 7. Seed default site_profile (insert only if empty)
insert into site_profile (
  id, nama_perusahaan, tagline_baris1, tagline_baris2, deskripsi_hero,
  alamat, telepon, telepon_display, whatsapp, whatsapp_display,
  email, jam_operasional, hari_operasional, akurasi_dimensi, maps_embed_url,
  updated_at, updated_by
) values (
  1,
  'Prime Property',
  'Hunian Mewah',
  'Tanpa Batasan',
  'Menghadirkan kurasi Villa & Ruko premium di lokasi paling bergengsi di Medan. Kami menawarkan transparansi penuh, akurasi dimensi bersertifikat, dan layanan VIP personal untuk investasi properti Anda.',
  'Jl. Cemara Asri Boulevard No. 88, Medan, Sumatera Utara, Indonesia 20371',
  '+6261​88997766',
  '+62 61 8899 7766',
  '6281160008899',
  '+62 811 6000 8899',
  'info@primeproperty.com',
  '08.00 – 17.00 WIB',
  'Senin – Sabtu',
  99,
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.9790695029053!2d98.69469507604558!3d3.6377626963363363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30313220fbf7774d%3A0x303131804a9d701b!2sKawasan%20Cemara%20Asri!5e0!3m2!1sid!2sid!4v1717326880000!5m2!1sid!2sid',
  now(),
  'system'
) on conflict (id) do nothing;

-- 8. Disable RLS (pakai anon key dari server, bukan user auth)
alter table properties disable row level security;
alter table audit_logs disable row level security;
alter table lockouts disable row level security;
alter table site_profile disable row level security;
alter table contact_messages disable row level security;
alter table contact_limits disable row level security;
