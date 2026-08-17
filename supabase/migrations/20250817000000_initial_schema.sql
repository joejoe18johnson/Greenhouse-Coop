-- Greenhouse Co-Op — initial Supabase schema

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (extends Supabase Auth)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  district text not null,
  town text not null,
  village text not null default '',
  full_address text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses (user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10, 2) not null,
  propagation_type text not null,
  size text not null,
  fruit_image text not null,
  plant_image text not null,
  description text not null,
  flavor_profile text not null,
  featured boolean not null default false,
  limited_supply boolean not null default false,
  very_rare boolean not null default false,
  certified boolean not null default false,
  in_stock boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category);
create index products_featured_idx on public.products (featured) where featured = true;

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  invoice_number text not null,
  invoice_issued_at timestamptz,
  user_id uuid not null references public.profiles (id),
  items jsonb not null default '[]',
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null default 0,
  box_fee numeric(10, 2) not null default 0,
  courier_estimate numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  box_recommendation jsonb not null,
  status text not null default 'Payment Pending',
  shipping jsonb not null,
  payment jsonb not null default '{}',
  timeline jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

-- ---------------------------------------------------------------------------
-- App settings (singleton rows as key/value JSON)
-- ---------------------------------------------------------------------------

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Carts (logged-in users)
-- ---------------------------------------------------------------------------

create table public.carts (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  items jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

create trigger app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.touch_updated_at();

create trigger carts_updated_at
  before update on public.carts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.app_settings enable row level security;
alter table public.carts enable row level security;

-- Profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- Addresses
create policy "addresses_select_own_or_admin"
  on public.addresses for select
  using (auth.uid() = user_id or public.is_admin());

create policy "addresses_insert_own"
  on public.addresses for insert
  with check (auth.uid() = user_id);

create policy "addresses_update_own"
  on public.addresses for update
  using (auth.uid() = user_id);

create policy "addresses_delete_own"
  on public.addresses for delete
  using (auth.uid() = user_id);

-- Products — public read, admin write
create policy "products_select_all"
  on public.products for select
  using (true);

create policy "products_insert_admin"
  on public.products for insert
  with check (public.is_admin());

create policy "products_update_admin"
  on public.products for update
  using (public.is_admin());

create policy "products_delete_admin"
  on public.products for delete
  using (public.is_admin());

-- Orders
create policy "orders_select_own_or_admin"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "orders_insert_own"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "orders_update_admin"
  on public.orders for update
  using (public.is_admin());

-- App settings — public read for checkout, admin write
create policy "app_settings_select_all"
  on public.app_settings for select
  using (true);

create policy "app_settings_insert_admin"
  on public.app_settings for insert
  with check (public.is_admin());

create policy "app_settings_update_admin"
  on public.app_settings for update
  using (public.is_admin());

-- Carts
create policy "carts_select_own"
  on public.carts for select
  using (auth.uid() = user_id);

create policy "carts_insert_own"
  on public.carts for insert
  with check (auth.uid() = user_id);

create policy "carts_update_own"
  on public.carts for update
  using (auth.uid() = user_id);

create policy "carts_delete_own"
  on public.carts for delete
  using (auth.uid() = user_id);
