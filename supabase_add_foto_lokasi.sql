-- Jalankan di Supabase SQL Editor
alter table site_profile add column if not exists foto_lokasi_url text not null default '';
