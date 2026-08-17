-- Customer notes on orders (substitutions, delivery instructions, etc.)
alter table public.orders
  add column if not exists customer_notes text;
