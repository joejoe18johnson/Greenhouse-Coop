-- Exclude test/demo orders from admin financial totals
alter table public.orders
  add column if not exists exclude_from_financials boolean not null default false;
