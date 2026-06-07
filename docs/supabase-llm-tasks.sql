create table if not exists public.llm_analysis_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'done')),
  subscriptions_snapshot jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists llm_analysis_tasks_user_id_idx
  on public.llm_analysis_tasks (user_id);

create unique index if not exists llm_analysis_tasks_user_pending_idx
  on public.llm_analysis_tasks (user_id)
  where status = 'pending';

alter table public.llm_analysis_tasks enable row level security;

create policy "users can read own llm analysis tasks"
  on public.llm_analysis_tasks for select
  using ((select auth.uid()) = user_id);

create policy "users can insert own llm analysis tasks"
  on public.llm_analysis_tasks for insert
  with check ((select auth.uid()) = user_id);

create policy "users can update own llm analysis tasks"
  on public.llm_analysis_tasks for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users can delete own llm analysis tasks"
  on public.llm_analysis_tasks for delete
  using ((select auth.uid()) = user_id);
