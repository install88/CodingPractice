create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_role text := 'member';
  next_username text;
begin
  if not exists (select 1 from public.profiles) then
    next_role := 'admin';
  end if;

  next_username := nullif(new.raw_user_meta_data ->> 'username', '');
  if next_username is null then
    next_username := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (id, username, role)
  values (new.id, next_username, next_role);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.learner_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  selected_card_index integer not null default 0,
  completed_card_ids jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.learner_progress enable row level security;

drop policy if exists "Users can read own learner progress" on public.learner_progress;
create policy "Users can read own learner progress"
on public.learner_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own learner progress" on public.learner_progress;
create policy "Users can insert own learner progress"
on public.learner_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own learner progress" on public.learner_progress;
create policy "Users can update own learner progress"
on public.learner_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.list_progress_overview()
returns table (
  user_id uuid,
  username text,
  role text,
  completed_count integer,
  current_card_no integer,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.username,
    p.role,
    coalesce(jsonb_array_length(lp.completed_card_ids), 0)::integer as completed_count,
    coalesce(lp.selected_card_index, 0) + 1 as current_card_no,
    coalesce(lp.updated_at, p.created_at) as updated_at
  from public.profiles p
  left join public.learner_progress lp on lp.user_id = p.id
  order by completed_count desc, updated_at desc, lower(p.username);
$$;

revoke all on function public.list_progress_overview() from public;
grant execute on function public.list_progress_overview() to authenticated;
