-- FX Journey account-owned trade storage. Run in Supabase SQL Editor.
-- Assumes public.trades has id uuid primary key default gen_random_uuid(),
-- user_id uuid referencing auth.users(id) on delete cascade, and trade jsonb.

alter table public.trades enable row level security;

drop policy if exists "Users manage their own trades" on public.trades;
create policy "Users manage their own trades"
on public.trades
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.trades to authenticated;
