-- PocketFrame — Supabase schema (workspace sharing model)
-- Run in Supabase SQL editor after creating a project.

create extension if not exists "uuid-ossp";

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- workspaces (shared space for a couple / small group) ----------
create table public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  invite_code text not null unique,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- ---------- blob stores (metadata JSON, media lives in Storage) ----------
create table public.memories (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create table public.projects (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create table public.collections (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create table public.workspace_favorites (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index memories_ws on public.memories(workspace_id);
create index projects_ws on public.projects(workspace_id);
create index collections_ws on public.collections(workspace_id);

-- ---------- Row-level security ----------
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.memories enable row level security;
alter table public.projects enable row level security;
alter table public.collections enable row level security;
alter table public.workspace_favorites enable row level security;

-- helper: users who can see a workspace
create or replace function public.is_member(ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = auth.uid()
  );
$$;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "view workspaces where member" on public.workspaces
  for select using (created_by = auth.uid() or public.is_member(id));
create policy "create workspace" on public.workspaces
  for insert with check (created_by = auth.uid());
create policy "update own workspace" on public.workspaces
  for update using (created_by = auth.uid());

create policy "view membership of own" on public.workspace_members
  for select using (user_id = auth.uid() or public.is_member(workspace_id));
create policy "join workspace by invite" on public.workspace_members
  for insert with check (user_id = auth.uid());
create policy "leave or manage membership" on public.workspace_members
  for delete using (user_id = auth.uid() or public.is_member(workspace_id));

create policy "memories member access" on public.memories
  for all using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));
create policy "projects member access" on public.projects
  for all using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));
create policy "collections member access" on public.collections
  for all using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));
create policy "favorites member access" on public.workspace_favorites
  for all using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));

-- ---------- Storage bucket (private) ----------
-- insert into storage.buckets (id, name, public) values ('media', 'media', false);
-- Paths: users/{userId}/originals/{year}/{month}/{uuid}.{ext}
--        users/{userId}/thumbnails/{year}/{month}/{uuid}.webp
--
-- create policy "media member access" on storage.objects
--   for all to authenticated
--   using (bucket_id = 'media');
