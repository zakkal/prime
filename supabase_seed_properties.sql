-- Seed 4 dummy properties for Prime Property
-- Run this in Supabase SQL Editor

insert into properties (id, nama_property, "group", lebar, panjang, hadap, tipe, tingkat, price, carport, status, siap, maps_link, kawasan, unit, created_at, updated_at, created_by, deleted_at) values

('prop-001', 'Cemara Asri Residence Blok A-1', 'Cemara Premier', 8, 15, ARRAY['Utara'], 'Villa', 2, 1850000000, true, 'in_stock', 'siap_huni', 'https://maps.app.goo.gl/d5uEistMaMnesdeV7', ARRAY['Cemara Asri'], 'Ready Siap Huni', now(), now(), 'superadmin@primeproperty.com', null),

('prop-002', 'Krakatau Mansion Blok C-12', 'Krakatau Executive', 9, 20, ARRAY['Barat'], 'Villa', 2.5, 3200000000, true, 'in_stock', 'siap_huni', null, ARRAY['Krakatau'], 'Ready Siap Huni', now(), now(), 'superadmin@primeproperty.com', null),

('prop-003', 'Pancing Heights Villa E-7', 'Pancing Residence', 8.5, 18, ARRAY['Selatan'], 'Villa', 2, 2450000000, true, 'in_stock', 'siap_huni_renovasi', null, ARRAY['Pancing'], 'Rucon', now(), now(), 'superadmin@primeproperty.com', null),

('prop-004', 'Helvetia Garden Blok F-2', 'Helvetia Garden', 7, 14, ARRAY['Barat'], 'Villa', 1.5, 980000000, false, 'in_stock', 'siap_kosong', null, ARRAY['Helvetia'], null, now(), now(), 'superadmin@primeproperty.com', null);
