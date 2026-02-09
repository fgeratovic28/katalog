-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create products table
create table proizvodi (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  naziv text not null,
  cena numeric not null,
  opis text,
  slika_url text,
  velicine text[],
  dostupno boolean default true,
  kategorija text -- Added to support frontend category filtering
);

-- Create orders table
create table porudzbine (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ime_kupca text not null,
  adresa_kupca text not null,
  grad_kupca text not null,
  postanski_broj_kupca text not null,
  telefon_kupca text not null,
  artikli jsonb not null,
  ukupna_cena numeric not null,
  status text default 'novo'
);

-- Storage bucket for product images
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true);

-- Policies for Storage
create policy "Public Access" 
  on storage.objects for select 
  using ( bucket_id = 'product-images' );

create policy "Authenticated Users can upload" 
  on storage.objects for insert 
  with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

create policy "Authenticated Users can update" 
  on storage.objects for update 
  with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

create policy "Authenticated Users can delete" 
  on storage.objects for delete 
  using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

-- RLS for products
alter table proizvodi enable row level security;

create policy "Public products are viewable by everyone" 
  on proizvodi for select 
  using ( true );

create policy "Authenticated users can insert products" 
  on proizvodi for insert 
  with check ( auth.role() = 'authenticated' );

create policy "Authenticated users can update products" 
  on proizvodi for update 
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can delete products" 
  on proizvodi for delete 
  using ( auth.role() = 'authenticated' );

-- RLS for orders
alter table porudzbine enable row level security;

create policy "Everyone can create orders" 
  on porudzbine for insert 
  with check ( true );

create policy "Authenticated users can view orders" 
  on porudzbine for select 
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can update orders" 
  on porudzbine for update 
  using ( auth.role() = 'authenticated' );
