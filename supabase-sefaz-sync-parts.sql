-- SEFAZ-AL: executar no SQL Editor do projeto Supabase correto.
-- Não apaga nem substitui registros existentes.
begin;
create table if not exists public.sefaz_sync_parts (
 user_id uuid not null references auth.users(id) on delete cascade,
 part text not null,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 primary key (user_id, part)
);
alter table public.sefaz_sync_parts enable row level security;
revoke all on public.sefaz_sync_parts from anon;
grant select, insert, update on public.sefaz_sync_parts to authenticated;
drop policy if exists "sefaz_parts_select_own" on public.sefaz_sync_parts;
drop policy if exists "sefaz_parts_insert_own" on public.sefaz_sync_parts;
drop policy if exists "sefaz_parts_update_own" on public.sefaz_sync_parts;
create policy "sefaz_parts_select_own" on public.sefaz_sync_parts for select to authenticated using ((select auth.uid()) = user_id);
create policy "sefaz_parts_insert_own" on public.sefaz_sync_parts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "sefaz_parts_update_own" on public.sefaz_sync_parts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
commit;
notify pgrst, 'reload schema';
