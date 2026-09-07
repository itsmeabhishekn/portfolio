-- Paste this into the Supabase SQL editor and run it once.
-- Then insert YOUR Google email into htracker_allowlist.

create table if not exists public.htracker_allowlist (
  email text primary key
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.checkins (
  habit_id uuid not null references public.habits (id) on delete cascade,
  day date not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (habit_id, day)
);

create index if not exists checkins_user_day_idx
  on public.checkins (user_id, day);

alter table public.htracker_allowlist enable row level security;
alter table public.habits enable row level security;
alter table public.checkins enable row level security;

create or replace function public.htracker_is_allowed()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.htracker_allowlist
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.htracker_is_allowed() from public;
grant execute on function public.htracker_is_allowed() to authenticated;

drop policy if exists "habits_own_allowed" on public.habits;
create policy "habits_own_allowed"
on public.habits
for all
to authenticated
using (auth.uid() = user_id and public.htracker_is_allowed())
with check (auth.uid() = user_id and public.htracker_is_allowed());

drop policy if exists "checkins_own_allowed" on public.checkins;
create policy "checkins_own_allowed"
on public.checkins
for all
to authenticated
using (auth.uid() = user_id and public.htracker_is_allowed())
with check (auth.uid() = user_id and public.htracker_is_allowed());

grant select, insert, update, delete on public.habits to authenticated;
grant select, insert, update, delete on public.checkins to authenticated;

-- Replace with the Gmail you will click in "Sign in with Google".
insert into public.htracker_allowlist (email)
values ('YOUR_GOOGLE_EMAIL@gmail.com')
on conflict (email) do nothing;
