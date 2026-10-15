alter table public.orders
  add column if not exists loyalty_discount_waived boolean not null default false;
