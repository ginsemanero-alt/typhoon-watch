-- =====================================================================
-- TyphoonWatch: Disaster & Typhoon Reporting Platform
-- Run this whole file once in: Supabase Dashboard -> SQL Editor -> New query
-- =====================================================================

-- ---------- Tables ----------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  phone       text,
  barangay    text,
  role        text not null default 'resident' check (role in ('resident', 'admin')),
  created_at  timestamptz not null default now()
);

create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  type         text not null check (type in (
                 'typhoon_damage','flood','landslide','storm_surge',
                 'fallen_tree','power_outage','road_blocked','missing_stranded','other')),
  severity     text not null default 'moderate' check (severity in ('low','moderate','high','critical')),
  title        text not null,
  description  text not null default '',
  barangay     text not null default '',
  lat          double precision not null,
  lng          double precision not null,
  photo_url    text,
  status       text not null default 'pending' check (status in ('pending','verified','responding','resolved','rejected')),
  admin_notes  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists reports_status_idx     on public.reports (status);
create index if not exists reports_created_idx    on public.reports (created_at desc);
create index if not exists reports_reporter_idx   on public.reports (reporter_id);

create table if not exists public.advisories (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null default '',
  kind         text not null default 'general' check (kind in ('typhoon','flood','general')),
  signal_level int  check (signal_level between 0 and 5),
  is_active    boolean not null default true,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists advisories_active_idx on public.advisories (is_active, created_at desc);

-- ---------- Helpers ---------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reports_touch on public.reports;
create trigger reports_touch before update on public.reports
for each row execute function public.touch_updated_at();

-- Residents may never change their own role, and may not edit a report's
-- moderation fields. Admins can do anything.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role = old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role before update on public.profiles
for each row execute function public.guard_profile_role();

-- Create a profile automatically whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, barangay)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'barangay'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- Row Level Security ---------------------------------------

alter table public.profiles   enable row level security;
alter table public.reports    enable row level security;
alter table public.advisories enable row level security;

-- profiles
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles update own or admin" on public.profiles;
create policy "profiles update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- reports
-- Public map: anyone can see reports that an admin already verified/is handling/resolved.
drop policy if exists "reports public read verified" on public.reports;
create policy "reports public read verified" on public.reports
  for select using (status in ('verified','responding','resolved'));

drop policy if exists "reports read own" on public.reports;
create policy "reports read own" on public.reports
  for select using (reporter_id = auth.uid());

drop policy if exists "reports admin read all" on public.reports;
create policy "reports admin read all" on public.reports
  for select using (public.is_admin());

drop policy if exists "reports insert own" on public.reports;
create policy "reports insert own" on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid() and status = 'pending' and admin_notes is null);

drop policy if exists "reports admin update" on public.reports;
create policy "reports admin update" on public.reports
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reports delete own pending or admin" on public.reports;
create policy "reports delete own pending or admin" on public.reports
  for delete using ((reporter_id = auth.uid() and status = 'pending') or public.is_admin());

-- advisories
drop policy if exists "advisories public read active" on public.advisories;
create policy "advisories public read active" on public.advisories
  for select using (is_active = true or public.is_admin());

drop policy if exists "advisories admin write" on public.advisories;
create policy "advisories admin write" on public.advisories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Realtime (live map updates) ------------------------------

do $$
begin
  alter publication supabase_realtime add table public.reports;
exception when duplicate_object then null;
end $$;

-- ---------- Storage (report photos) ----------------------------------

insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do nothing;

drop policy if exists "photos public read" on storage.objects;
create policy "photos public read" on storage.objects
  for select using (bucket_id = 'report-photos');

-- Files must be uploaded to a folder named after the user's id: <uid>/<file>
drop policy if exists "photos upload own folder" on storage.objects;
create policy "photos upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'report-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos delete own or admin" on storage.objects;
create policy "photos delete own or admin" on storage.objects
  for delete using (
    bucket_id = 'report-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ---------- Make yourself an admin -----------------------------------
-- 1) Register normally in the app.
-- 2) Then run this with YOUR email:
--
--   update public.profiles
--   set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
--
-- =====================================================================
