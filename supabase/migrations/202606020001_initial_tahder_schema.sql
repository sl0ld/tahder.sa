create extension if not exists pgcrypto;

create type public.subscription_status as enum ('trial', 'active', 'past_due', 'cancelled', 'expired');
create type public.preparation_status as enum ('draft', 'ready', 'exported', 'archived');
create type public.generation_status as enum ('started', 'completed', 'failed');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  school_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plans (
  id text primary key,
  name_ar text not null,
  price_sar numeric(10, 2) not null default 0,
  duration_days integer not null,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references public.plans(id),
  status public.subscription_status not null default 'trial',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.linked_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  label text not null default 'Chrome extension',
  last_seen_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, device_id)
);

create table public.extension_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  panel_position jsonb,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.lesson_catalog (
  id uuid primary key default gen_random_uuid(),
  curriculum_year text not null,
  subject text not null,
  grade text not null,
  term text not null,
  unit_title text,
  lesson_title text not null,
  lesson_order integer,
  book_storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (curriculum_year, subject, grade, term, lesson_title)
);

create table public.preparations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_catalog_id uuid references public.lesson_catalog(id) on delete set null,
  lesson_title text not null,
  subject text,
  grade text,
  term text,
  class_names text[] not null default '{}',
  content jsonb not null default '{}'::jsonb,
  status public.preparation_status not null default 'draft',
  source text not null default 'extension',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.generation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preparation_id uuid references public.preparations(id) on delete set null,
  lesson_context jsonb not null default '{}'::jsonb,
  provider text,
  model text,
  status public.generation_status not null default 'started',
  prompt_tokens integer,
  output_tokens integer,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.activity_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index subscriptions_user_status_idx on public.subscriptions (user_id, status, ends_at);
create index preparations_user_created_idx on public.preparations (user_id, created_at desc);
create index generation_logs_user_created_idx on public.generation_logs (user_id, created_at desc);
create index activity_logs_user_created_idx on public.activity_logs (user_id, created_at desc);
create index lesson_catalog_lookup_idx on public.lesson_catalog (subject, grade, term, lesson_title);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions
for each row execute function public.set_updated_at();
create trigger preparations_set_updated_at before update on public.preparations
for each row execute function public.set_updated_at();
create trigger extension_settings_set_updated_at before update on public.extension_settings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.has_active_subscription(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.subscriptions
    where user_id = target_user_id
      and status in ('trial', 'active')
      and starts_at <= now()
      and (ends_at is null or ends_at > now())
  );
$$;

grant execute on function public.has_active_subscription(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.linked_devices enable row level security;
alter table public.extension_settings enable row level security;
alter table public.lesson_catalog enable row level security;
alter table public.preparations enable row level security;
alter table public.generation_logs enable row level security;
alter table public.activity_logs enable row level security;

create policy "authenticated users can read their profile"
on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "authenticated users can update their profile"
on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "plans are publicly readable"
on public.plans for select to anon, authenticated using (is_active = true);

create policy "users can read their subscriptions"
on public.subscriptions for select to authenticated using ((select auth.uid()) = user_id);

create policy "users can manage their devices"
on public.linked_devices for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users can manage their extension settings"
on public.extension_settings for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "subscribers can read the lesson catalog"
on public.lesson_catalog for select to authenticated using (public.has_active_subscription());

create policy "subscribers can read their preparations"
on public.preparations for select to authenticated using ((select auth.uid()) = user_id and public.has_active_subscription());
create policy "subscribers can create their preparations"
on public.preparations for insert to authenticated with check ((select auth.uid()) = user_id and public.has_active_subscription());
create policy "subscribers can update their preparations"
on public.preparations for update to authenticated using ((select auth.uid()) = user_id and public.has_active_subscription()) with check ((select auth.uid()) = user_id and public.has_active_subscription());
create policy "subscribers can delete their preparations"
on public.preparations for delete to authenticated using ((select auth.uid()) = user_id and public.has_active_subscription());

create policy "users can read their generation logs"
on public.generation_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy "users can read their activity logs"
on public.activity_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy "users can create activity logs"
on public.activity_logs for insert to authenticated with check ((select auth.uid()) = user_id);

insert into public.plans (id, name_ar, price_sar, duration_days, features)
values
  ('trial', 'تجربة', 0, 7, '{"ai_generations": 10, "devices": 1}'::jsonb),
  ('teacher-monthly', 'اشتراك المعلم الشهري', 29, 30, '{"ai_generations": 300, "devices": 2}'::jsonb),
  ('teacher-yearly', 'اشتراك المعلم السنوي', 249, 365, '{"ai_generations": 5000, "devices": 4}'::jsonb)
on conflict (id) do nothing;

