alter table public.products
  add column if not exists available_quantity integer;
