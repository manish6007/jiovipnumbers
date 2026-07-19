-- =====================================================================
-- Admin-toggleable login methods. Phone OTP costs money per SMS (MSG91);
-- Email OTP and Google OAuth are free via Supabase, so admin can turn
-- phone off entirely once traffic doesn't need it, or run all three.
-- =====================================================================

alter table platform_settings add column phone_otp_enabled    boolean not null default true;
alter table platform_settings add column email_otp_enabled    boolean not null default false;
alter table platform_settings add column google_oauth_enabled boolean not null default false;

-- Partner KYC contact number, independent of the login identity's phone
-- (which may now be null if they signed up via email/Google).
alter table partners add column contact_phone text;

-- Verify:
-- select phone_otp_enabled, email_otp_enabled, google_oauth_enabled from platform_settings;
