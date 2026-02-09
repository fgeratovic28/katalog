-- Add variants column to products table
alter table proizvodi 
add column varijante jsonb default null;

-- Comment on column varijante
comment on column proizvodi.varijante is 'Array of objects with name and price, e.g. [{"name": "256GB", "price": 1200}]';
