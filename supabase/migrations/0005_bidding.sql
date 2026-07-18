-- =====================================================================
-- Optional timed bidding/auction feature for VIP numbers.
-- Sits behind a global admin toggle (platform_settings.bidding_enabled) so
-- it can ship now and be switched on later once there's enough traffic.
-- =====================================================================

create type auction_status as enum ('none', 'active', 'ended');

alter table numbers add column auction_status    auction_status not null default 'none';
alter table numbers add column auction_ends_at   timestamptz;
alter table numbers add column starting_bid      integer;
alter table numbers add column current_bid       integer;
alter table numbers add column highest_bidder_id uuid references profiles(id) on delete set null;
alter table numbers add column bid_count         integer not null default 0;
-- A partner's chosen duration, held here until admin approval actually starts
-- the clock (auction_status/auction_ends_at) — a listing isn't publicly
-- visible before approval, so the timer can't safely start at creation time.
alter table numbers add column auction_duration_hours integer;

create table bids (
  id          uuid primary key default gen_random_uuid(),
  number_id   uuid not null references numbers(id) on delete cascade,
  bidder_id   uuid not null references profiles(id) on delete cascade,
  amount      integer not null check (amount > 0),
  created_at  timestamptz not null default now()
);
create index idx_bids_number on bids(number_id, amount desc);

-- Singleton platform-wide feature flags (fixed known id so writes never race).
create table platform_settings (
  id              uuid primary key default '00000000-0000-0000-0000-000000000001',
  bidding_enabled boolean not null default false,
  updated_by      uuid references profiles(id) on delete set null,
  updated_at      timestamptz not null default now()
);
insert into platform_settings (id) values ('00000000-0000-0000-0000-000000000001');
create trigger trg_platform_settings_updated before update on platform_settings
  for each row execute function set_updated_at();

-- ----- RLS ------------------------------------------------------------
alter table bids              enable row level security;
alter table platform_settings enable row level security;

create policy "platform_settings public read" on platform_settings
  for select using (true);
create policy "platform_settings admin write" on platform_settings
  for update using (is_admin()) with check (is_admin());

create policy "bids read" on bids
  for select using (
    bidder_id = auth.uid()
    or exists (select 1 from numbers n where n.id = bids.number_id and n.partner_id = current_partner_id())
    or is_admin()
  );
create policy "bids insert" on bids
  for insert with check (bidder_id = auth.uid());

-- Verify:
-- select bidding_enabled from platform_settings;
