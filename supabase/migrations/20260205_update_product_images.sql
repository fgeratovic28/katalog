-- Add slike column
alter table proizvodi 
add column slike text[] default array[]::text[];

-- Migrate existing data
update proizvodi 
set slike = array[slika_url] 
where slika_url is not null;

-- Drop old column
alter table proizvodi 
drop column slika_url;
