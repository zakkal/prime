-- ============================================================
-- PRIME PROPERTY - Supabase Migration (v2 - fixed types)
-- 1. Drop semua tabel lama dulu
-- 2. Buat ulang dengan tipe yang benar
-- ============================================================

drop table if exists contact_limits cascade;
drop table if exists contact_messages cascade;
drop table if exists audit_logs cascade;
drop table if exists lockouts cascade;
drop table if exists site_profile cascade;
drop table if exists properties cascade;
drop table if exists agent_profiles cascade;

-- 1. Properties
create table properties (
  id text primary key,
  nama_property text not null,
  "group" text,
  lebar numeric not null,
  panjang numeric not null,
  hadap text[] not null default '{}',
  tipe text not null check (tipe in ('Ruko', 'Villa')),
  tingkat numeric not null,
  price bigint not null,
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
create table audit_logs (
  id text primary key,
  property_id text not null,
  property_name text not null,
  action_type text not null check (action_type in ('CREATE', 'UPDATE', 'DELETE')),
  changed_by text not null,
  changed_fields text not null,
  created_at timestamptz not null default now()
);

-- 3. Lockout
create table lockouts (
  email text primary key,
  failed_attempts integer not null default 0,
  locked_until timestamptz
);

-- 4. Site Profile
create table site_profile (
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
  maps_embed_url text not null default '',
  foto_lokasi_url text not null default '',
  map_lat numeric not null default 3.6377,
  map_lng numeric not null default 98.6947,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'system'
);

-- 5. Contact Messages
create table contact_messages (
  id text primary key,
  nama text not null,
  email text not null,
  hp text not null,
  pesan text not null,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

-- 6. Contact Rate Limits
create table contact_limits (
  ip text not null,
  submitted_at timestamptz not null default now()
);
create index contact_limits_ip_idx on contact_limits(ip);
create index contact_limits_time_idx on contact_limits(submitted_at);

-- 7. Seed default site_profile
insert into site_profile (
  id, nama_perusahaan, tagline_baris1, tagline_baris2, deskripsi_hero,
  alamat, telepon, telepon_display, whatsapp, whatsapp_display,
  email, jam_operasional, hari_operasional, akurasi_dimensi,
  maps_embed_url, foto_lokasi_url, map_lat, map_lng,
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
  '',
  '',
  3.6377,
  98.6947,
  now(),
  'system'
);

-- 8. Disable RLS
alter table properties disable row level security;
alter table audit_logs disable row level security;
alter table lockouts disable row level security;
alter table site_profile disable row level security;
alter table contact_messages disable row level security;
alter table contact_limits disable row level security;
