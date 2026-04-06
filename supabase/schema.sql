create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  visit_date date not null,
  visit_time text not null,
  mashaer text not null,
  marker_no text not null,
  hospitality_center_no text not null,
  site_status text not null check (site_status in ('ممتاز', 'جيد', 'يحتاج تحسين', 'سيء')),
  pilgrims_count integer,
  notes text,
  observer_name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.visits enable row level security;

create policy "users can insert own visits"
on public.visits
for insert
with check (auth.uid() = created_by);

create policy "users can view own visits"
on public.visits
for select
using (auth.uid() = created_by);

create policy "users can update own visits"
on public.visits
for update
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

create policy "users can delete own visits"
on public.visits
for delete
using (auth.uid() = created_by);
