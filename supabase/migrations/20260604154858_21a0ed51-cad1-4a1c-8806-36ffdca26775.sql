
-- ROLES
create type public.app_role as enum ('admin', 'moderator', 'member');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users see own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  bio text,
  avatar_url text,
  department text,
  joined_at date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles public read" on public.profiles for select using (true);
create policy "user updates own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "user inserts own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "admin manages profiles" on public.profiles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email)) on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- EVENTS
create type public.event_type as enum ('ride','meeting','tour','workshop','social','race','other');
create type public.event_status as enum ('draft','upcoming','ongoing','past','cancelled');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  event_type public.event_type not null default 'ride',
  status public.event_status not null default 'upcoming',
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  description text,
  rules text,
  prize text,
  guests text,
  organizer text,
  poster_url text,
  is_paid boolean not null default false,
  price numeric(10,2) default 0,
  capacity int,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.events to anon, authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "events public read" on public.events for select using (true);
create policy "admins manage events" on public.events for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger events_touch before update on public.events for each row execute function public.touch_updated_at();

-- REGISTRATIONS
create type public.payment_status as enum ('not_required','pending','verified','rejected');

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  email text not null,
  school_college text,
  team_name text,
  category text,
  participants int default 1,
  payment_status public.payment_status not null default 'not_required',
  payment_proof_url text,
  payment_method text,
  notes text,
  ticket_code text unique default upper(substr(md5(random()::text),1,8)),
  created_at timestamptz not null default now()
);
grant select, insert on public.registrations to anon;
grant select, insert, update on public.registrations to authenticated;
grant all on public.registrations to service_role;
alter table public.registrations enable row level security;
create policy "anyone can register" on public.registrations for insert to anon, authenticated with check (true);
create policy "user sees own registration" on public.registrations for select to authenticated using (auth.uid() = user_id);
create policy "admins see all registrations" on public.registrations for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins manage registrations" on public.registrations for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- NOTICES
create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_pinned boolean not null default false,
  published_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.notices to anon, authenticated;
grant all on public.notices to service_role;
alter table public.notices enable row level security;
create policy "notices public read" on public.notices for select using (true);
create policy "admins manage notices" on public.notices for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- SPONSORS
create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  tier text default 'standard',
  sort_order int default 100,
  created_at timestamptz not null default now()
);
grant select on public.sponsors to anon, authenticated;
grant all on public.sponsors to service_role;
alter table public.sponsors enable row level security;
create policy "sponsors public read" on public.sponsors for select using (true);
create policy "admins manage sponsors" on public.sponsors for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- GALLERY
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  event_id uuid references public.events(id) on delete set null,
  sort_order int default 100,
  created_at timestamptz not null default now()
);
grant select on public.gallery_images to anon, authenticated;
grant all on public.gallery_images to service_role;
alter table public.gallery_images enable row level security;
create policy "gallery public read" on public.gallery_images for select using (true);
create policy "admins manage gallery" on public.gallery_images for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
