-- Fix id columns to use text instead of uuid
-- Run this in Supabase SQL Editor if you get "invalid input syntax for type uuid" errors

-- Check current id column types
select table_name, column_name, data_type 
from information_schema.columns 
where table_schema = 'public' 
and column_name = 'id';

-- If any table uses uuid type, alter to text:
-- alter table properties alter column id type text;
-- alter table audit_logs alter column id type text;
-- alter table contact_messages alter column id type text;
