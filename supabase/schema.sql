create table if not exists public.planta_sync_states (
  app_key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.planta_sync_states enable row level security;

drop policy if exists "planta sync select by app key" on public.planta_sync_states;
drop policy if exists "planta sync insert by app key" on public.planta_sync_states;
drop policy if exists "planta sync update by app key" on public.planta_sync_states;

create policy "planta sync select by app key"
on public.planta_sync_states
for select
to anon
using (
  app_key = coalesce((nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-planta-key'), '')
);

create policy "planta sync insert by app key"
on public.planta_sync_states
for insert
to anon
with check (
  app_key = coalesce((nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-planta-key'), '')
);

create policy "planta sync update by app key"
on public.planta_sync_states
for update
to anon
using (
  app_key = coalesce((nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-planta-key'), '')
)
with check (
  app_key = coalesce((nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-planta-key'), '')
);

grant select, insert, update on public.planta_sync_states to anon;
