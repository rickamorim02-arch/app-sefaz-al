-- Execute uma vez no SQL Editor do Supabase. Mantém sefaz_sync intacta.
create table if not exists public.sefaz_sync_parts (
 user_id uuid not null references auth.users(id) on delete cascade,
 part text not null,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 primary key(user_id,part)
);
alter table public.sefaz_sync_parts enable row level security;
drop policy if exists "owner_select_parts" on public.sefaz_sync_parts;
drop policy if exists "owner_insert_parts" on public.sefaz_sync_parts;
drop policy if exists "owner_update_parts" on public.sefaz_sync_parts;
create policy "owner_select_parts" on public.sefaz_sync_parts for select to authenticated using (auth.uid()=user_id);
create policy "owner_insert_parts" on public.sefaz_sync_parts for insert to authenticated with check (auth.uid()=user_id);
create policy "owner_update_parts" on public.sefaz_sync_parts for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
-- Migração opcional, feita uma única vez: transfere apenas progresso, sem banco qs.
-- Evite executar a migração se o registro legado estiver travando consultas; solicite suporte SQL.
insert into public.sefaz_sync_parts(user_id,part,payload)
select user_id,'sefaz-al-shorts',coalesce(payload->'sefaz-al-shorts','{}'::jsonb)-'qs' from public.sefaz_sync
on conflict(user_id,part) do nothing;
insert into public.sefaz_sync_parts(user_id,part,payload)
select s.user_id,p.part,coalesce(s.payload->p.part,'{}'::jsonb)
from public.sefaz_sync s cross join (values ('sefaz-al-notes-v1'),('sefaz-reading-checked-v1'),('sefaz-reading-second-v1'),('sefaz-reading-pins-v1'),('ink'),('inkDeleted')) as p(part)
on conflict(user_id,part) do nothing;
