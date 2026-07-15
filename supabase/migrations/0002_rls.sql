-- =====================================================================
-- Row Level Security policies
-- Model: customers see their own data; partners manage their own listings
-- & orders; approved partners' approved+available numbers are public;
-- admins (profiles.role = 'admin') have full access. The service-role key
-- used by server actions bypasses RLS for privileged workflows.
-- =====================================================================

-- Helper: is the current auth user an admin?
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: partner row id owned by current user (or null).
create or replace function current_partner_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from partners where user_id = auth.uid();
$$;

-- Enable RLS everywhere.
alter table profiles            enable row level security;
alter table partners            enable row level security;
alter table categories          enable row level security;
alter table numbers             enable row level security;
alter table number_images       enable row level security;
alter table commission_settings enable row level security;
alter table orders              enable row level security;
alter table wishlist            enable row level security;
alter table banners             enable row level security;
alter table notifications       enable row level security;
alter table audit_logs          enable row level security;

-- ----- profiles -------------------------------------------------------
create policy "profiles self read"   on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles self update" on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles admin all"   on profiles for all using (is_admin()) with check (is_admin());

-- ----- partners -------------------------------------------------------
create policy "partners public read approved" on partners
  for select using (verification_status = 'approved' or user_id = auth.uid() or is_admin());
create policy "partners self insert" on partners
  for insert with check (user_id = auth.uid());
create policy "partners self update" on partners
  for update using (user_id = auth.uid() or is_admin()) with check (user_id = auth.uid() or is_admin());
create policy "partners admin delete" on partners
  for delete using (is_admin());

-- ----- categories (public read; admin write) --------------------------
create policy "categories public read" on categories for select using (true);
create policy "categories admin write" on categories for all using (is_admin()) with check (is_admin());

-- ----- numbers --------------------------------------------------------
-- Public sees only approved listings from approved partners that are live.
create policy "numbers public read" on numbers
  for select using (
    (listing_status = 'approved' and status <> 'paused'
      and exists (select 1 from partners p where p.id = numbers.partner_id and p.verification_status = 'approved'))
    or partner_id = current_partner_id()
    or is_admin()
  );
create policy "numbers partner insert" on numbers
  for insert with check (partner_id = current_partner_id());
create policy "numbers partner update" on numbers
  for update using (partner_id = current_partner_id() or is_admin())
  with check (partner_id = current_partner_id() or is_admin());
create policy "numbers partner delete" on numbers
  for delete using (partner_id = current_partner_id() or is_admin());

-- ----- number_images --------------------------------------------------
create policy "images public read" on number_images
  for select using (
    exists (select 1 from numbers n where n.id = number_images.number_id
      and (n.listing_status = 'approved' or n.partner_id = current_partner_id() or is_admin()))
  );
create policy "images partner write" on number_images
  for all using (
    exists (select 1 from numbers n where n.id = number_images.number_id
      and (n.partner_id = current_partner_id() or is_admin()))
  ) with check (
    exists (select 1 from numbers n where n.id = number_images.number_id
      and (n.partner_id = current_partner_id() or is_admin()))
  );

-- ----- commission_settings (public read active; admin write) ----------
create policy "commission public read" on commission_settings for select using (true);
create policy "commission admin write" on commission_settings for all using (is_admin()) with check (is_admin());

-- ----- orders ---------------------------------------------------------
create policy "orders customer read" on orders
  for select using (customer_id = auth.uid() or partner_id = current_partner_id() or is_admin());
create policy "orders customer insert" on orders
  for insert with check (customer_id = auth.uid());
-- Partners may advance their own orders; admins anything. (Server actions use
-- the service role for commission-sensitive transitions.)
create policy "orders update" on orders
  for update using (partner_id = current_partner_id() or is_admin())
  with check (partner_id = current_partner_id() or is_admin());

-- ----- wishlist -------------------------------------------------------
create policy "wishlist owner all" on wishlist
  for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());

-- ----- banners (public read active; admin write) ----------------------
create policy "banners public read" on banners for select using (is_active or is_admin());
create policy "banners admin write" on banners for all using (is_admin()) with check (is_admin());

-- ----- notifications --------------------------------------------------
create policy "notifications owner read" on notifications
  for select using (user_id = auth.uid());
create policy "notifications owner update" on notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications admin all" on notifications
  for all using (is_admin()) with check (is_admin());

-- ----- audit_logs (admin read only; writes via service role) ----------
create policy "audit admin read" on audit_logs for select using (is_admin());
