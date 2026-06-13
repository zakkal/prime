-- Jalankan di Supabase SQL Editor
alter table site_profile add column if not exists foto_lokasi_url text not null default '';
alter table site_profile add column if not exists map_lat numeric not null default 3.6377;
alter table site_profile add column if not exists map_lng numeric not null default 98.6947;
