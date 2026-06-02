create table public.educational_contexts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  academic_year text not null,
  term text not null,
  stage text,
  grade text not null,
  subject text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teacher_classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  educational_context_id uuid references public.educational_contexts(id) on delete set null,
  name text not null,
  madrasati_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  external_reference text,
  full_name text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.class_students (
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  lesson_title text,
  session_date date not null default current_date,
  local_sync_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendance_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  attendance_status text not null default 'present' check (attendance_status in ('present', 'absent', 'late', 'excused')),
  participation_points integer not null default 0,
  note text,
  updated_at timestamptz not null default now(),
  primary key (session_id, student_id)
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preparation_id uuid references public.preparations(id) on delete set null,
  class_id uuid references public.teacher_classes(id) on delete set null,
  title text not null,
  instructions text,
  starts_at timestamptz,
  due_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assignment_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  question_order integer not null default 1,
  question_type text not null default 'short_text',
  prompt text not null,
  options jsonb,
  expected_answer jsonb,
  points numeric(8, 2) not null default 1
);

create table public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score numeric(8, 2),
  submitted_at timestamptz,
  graded_at timestamptz,
  unique (assignment_id, student_id)
);

create table public.worksheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_catalog_id uuid references public.lesson_catalog(id) on delete set null,
  preparation_id uuid references public.preparations(id) on delete set null,
  title text not null,
  storage_path text,
  interactive_schema jsonb,
  answer_key jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.curriculum_distributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  educational_context_id uuid not null references public.educational_contexts(id) on delete cascade,
  week_number integer not null,
  starts_on date,
  ends_on date,
  lessons jsonb not null default '[]'::jsonb,
  is_holiday boolean not null default false,
  note text,
  updated_at timestamptz not null default now(),
  unique (educational_context_id, week_number)
);

create table public.export_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preparation_id uuid references public.preparations(id) on delete set null,
  export_type text not null,
  target_platform text,
  status text not null default 'created',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  operation text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  attempts integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index teacher_classes_user_idx on public.teacher_classes (user_id);
create index students_user_idx on public.students (user_id);
create index attendance_sessions_user_date_idx on public.attendance_sessions (user_id, session_date desc);
create index assignments_user_created_idx on public.assignments (user_id, created_at desc);
create index curriculum_distributions_context_idx on public.curriculum_distributions (educational_context_id, week_number);
create index sync_jobs_user_status_idx on public.sync_jobs (user_id, status, created_at);

create trigger educational_contexts_set_updated_at before update on public.educational_contexts for each row execute function public.set_updated_at();
create trigger teacher_classes_set_updated_at before update on public.teacher_classes for each row execute function public.set_updated_at();
create trigger students_set_updated_at before update on public.students for each row execute function public.set_updated_at();
create trigger attendance_sessions_set_updated_at before update on public.attendance_sessions for each row execute function public.set_updated_at();
create trigger assignments_set_updated_at before update on public.assignments for each row execute function public.set_updated_at();
create trigger worksheets_set_updated_at before update on public.worksheets for each row execute function public.set_updated_at();
create trigger curriculum_distributions_set_updated_at before update on public.curriculum_distributions for each row execute function public.set_updated_at();
create trigger sync_jobs_set_updated_at before update on public.sync_jobs for each row execute function public.set_updated_at();

alter table public.educational_contexts enable row level security;
alter table public.teacher_classes enable row level security;
alter table public.students enable row level security;
alter table public.class_students enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_entries enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_questions enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.worksheets enable row level security;
alter table public.curriculum_distributions enable row level security;
alter table public.export_logs enable row level security;
alter table public.sync_jobs enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'educational_contexts', 'teacher_classes', 'students', 'class_students',
    'attendance_sessions', 'attendance_entries', 'assignments', 'assignment_questions',
    'assignment_submissions', 'worksheets', 'curriculum_distributions', 'export_logs', 'sync_jobs'
  ]
  loop
    execute format(
      'create policy "users manage their own %1$s" on public.%1$I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name
    );
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values
  ('curriculum-books', 'curriculum-books', false),
  ('teacher-uploads', 'teacher-uploads', false)
on conflict (id) do nothing;

create policy "subscribers can read curriculum books"
on storage.objects for select to authenticated
using (bucket_id = 'curriculum-books' and public.has_active_subscription());

create policy "teachers can manage their upload folder"
on storage.objects for all to authenticated
using (bucket_id = 'teacher-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'teacher-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

