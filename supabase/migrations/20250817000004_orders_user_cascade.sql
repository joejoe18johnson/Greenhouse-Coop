-- Allow auth/profile deletion when a customer still has orders (e.g. test accounts).
alter table public.orders
  drop constraint if exists orders_user_id_fkey;

alter table public.orders
  add constraint orders_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;
