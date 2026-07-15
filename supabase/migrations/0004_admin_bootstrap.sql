-- =====================================================================
-- Admin bootstrap (run manually, once, AFTER the target user has logged in
-- at least once via phone OTP so their auth.users + profiles row exists).
--
-- Replace the phone number with your admin's number in E.164 without the '+',
-- exactly as stored by Supabase (e.g. 919876543210).
-- =====================================================================

update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where phone = '919876543210'
);

-- Verify:
-- select id, phone, role from public.profiles where role = 'admin';
