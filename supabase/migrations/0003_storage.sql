-- =====================================================================
-- Storage buckets + policies
--   number-images        public   (listing photos)
--   avatars              public   (customer/partner avatars)
--   logos                public   (business logos)
--   banners              public   (homepage banners)
--   kyc-docs             private  (PAN/GST/photo — signed URLs only)
--   payment-screenshots  private  (manual payment proofs — signed URLs only)
-- =====================================================================

insert into storage.buckets (id, name, public)
values
  ('number-images', 'number-images', true),
  ('avatars', 'avatars', true),
  ('logos', 'logos', true),
  ('banners', 'banners', true),
  ('kyc-docs', 'kyc-docs', false),
  ('payment-screenshots', 'payment-screenshots', false)
on conflict (id) do nothing;

-- Public buckets: anyone can read, authenticated users can upload.
create policy "public buckets read" on storage.objects
  for select using (bucket_id in ('number-images','avatars','logos','banners'));

create policy "auth upload public buckets" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('number-images','avatars','logos','banners'));

create policy "auth update own public objects" on storage.objects
  for update to authenticated
  using (bucket_id in ('number-images','avatars','logos','banners') and owner = auth.uid());

create policy "auth delete own public objects" on storage.objects
  for delete to authenticated
  using (bucket_id in ('number-images','avatars','logos','banners') and owner = auth.uid());

-- Private buckets: owner (uploader) and admins can read; owner uploads.
create policy "private read own or admin" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('kyc-docs','payment-screenshots')
    and (owner = auth.uid() or public.is_admin())
  );

create policy "private upload own" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('kyc-docs','payment-screenshots') and owner = auth.uid());
