-- Allow admins to create orders on behalf of customers (phone / walk-in orders)

create policy "orders_insert_admin"
  on public.orders for insert
  with check (public.is_admin());
