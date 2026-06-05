
-- Membership status enum
do $$ begin
  create type public.membership_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  full_name text not null,
  phone text not null,
  email text,
  address text,
  bike_model text,
  message text,
  payment_method text,
  payment_proof_url text,
  amount numeric default 0,
  status public.membership_status not null default 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

grant select, insert on public.memberships to anon;
grant select, insert, update, delete on public.memberships to authenticated;
grant all on public.memberships to service_role;

alter table public.memberships enable row level security;

create policy "anyone can apply" on public.memberships
  for insert to anon, authenticated
  with check ((user_id is null) or (auth.uid() = user_id));

create policy "applicant sees own" on public.memberships
  for select to authenticated
  using (auth.uid() = user_id);

create policy "admins manage memberships" on public.memberships
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- Auto-grant admin to the chief email
create or replace function public.grant_chief_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = 'dahavintage4@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin'::app_role)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_grant_chief on auth.users;
create trigger on_auth_user_grant_chief
  after insert on auth.users
  for each row execute function public.grant_chief_admin();

-- If chief already exists, grant now
insert into public.user_roles (user_id, role)
select id, 'admin'::app_role from auth.users where email='dahavintage4@gmail.com'
on conflict do nothing;

-- Storage policies for payment-proofs bucket (public read, anyone can upload)
create policy "payment proofs public read" on storage.objects
  for select using (bucket_id = 'payment-proofs');

create policy "anyone can upload payment proof" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'payment-proofs');
