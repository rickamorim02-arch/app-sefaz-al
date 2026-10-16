-- Execute no SQL Editor do seu projeto Supabase.
-- Cada usuário acessa apenas os próprios registros.
create table if not exists public.sefaz_sync (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.sefaz_sync enable row level security;
revoke all on public.sefaz_sync from anon;
grant select,insert,update,delete on public.sefaz_sync to authenticated;
drop policy if exists "select own sync" on public.sefaz_sync;
create policy "select own sync" on public.sefaz_sync for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "insert own sync" on public.sefaz_sync;
create policy "insert own sync" on public.sefaz_sync for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "update own sync" on public.sefaz_sync;
create policy "update own sync" on public.sefaz_sync for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "delete own sync" on public.sefaz_sync;
create policy "delete own sync" on public.sefaz_sync for delete to authenticated using ((select auth.uid())=user_id);
-- IMPORTANTE: não inserir a chave service_role no aplicativo.
