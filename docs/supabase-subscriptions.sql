create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null,
  category text not null,
  next_payment_date date not null,
  memo text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

create index if not exists subscriptions_user_updated_idx
  on public.subscriptions (user_id, updated_at);

alter table public.subscriptions enable row level security;

create policy "users can read own subscriptions"
  on public.subscriptions for select
  using ((select auth.uid()) = user_id);

create policy "users can insert own subscriptions"
  on public.subscriptions for insert
  with check ((select auth.uid()) = user_id);

create policy "users can update own subscriptions"
  on public.subscriptions for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can delete own subscriptions"
  on public.subscriptions for delete
  using ((select auth.uid()) = user_id);
