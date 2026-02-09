-- Add is_new, is_on_sale, and stara_cena columns to products table
alter table proizvodi 
add column is_new boolean default false,
add column is_on_sale boolean default false,
add column stara_cena numeric default null;
