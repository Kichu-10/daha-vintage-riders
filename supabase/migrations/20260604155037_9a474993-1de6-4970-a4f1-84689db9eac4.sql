
drop policy if exists "anyone can register" on public.registrations;
create policy "anyone can register" on public.registrations
  for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

revoke execute on function public.has_role(uuid, public.app_role) from authenticated;
grant execute on function public.has_role(uuid, public.app_role) to service_role;
