-- 1. Payment proofs: restrict SELECT to admins only
drop policy if exists "payment proofs public read" on storage.objects;
create policy "admins read payment proofs"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'payment-proofs' and public.has_role(auth.uid(), 'admin'));

-- 2. Profiles: restrict SELECT to owner + admins
drop policy if exists "profiles public read" on public.profiles;
create policy "owner reads own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));