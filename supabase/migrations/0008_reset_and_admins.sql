-- Clean slate: wipe all VIP number listings and everything that references
-- them (bids, orders, coupon redemptions, favorites, images). Coupons
-- themselves are kept, but used_count is reset since their redemptions are gone.
truncate table numbers cascade;
update coupons set used_count = 0;

-- Grant admin role to the two specified accounts. Each must have already
-- signed in at least once (so a profiles row exists) before running this.
update profiles set role = 'admin'
where email in ('manishshrivastava26@gmail.com', 'ashish62407@gmail.com');

-- Sanity check: run this after and confirm both rows show role = 'admin'.
-- select id, email, role from profiles
-- where email in ('manishshrivastava26@gmail.com', 'ashish62407@gmail.com');
