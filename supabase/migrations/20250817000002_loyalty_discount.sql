alter table public.orders
  add column if not exists loyalty_discount numeric(10, 2) not null default 0;
