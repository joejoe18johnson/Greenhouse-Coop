alter table public.orders
  add column if not exists invoice_discount numeric(10, 2) not null default 0,
  add column if not exists invoice_discount_note text;
