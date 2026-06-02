create table public.curriculum_documents (
  id text primary key,
  title text not null,
  document_type text not null check (document_type in (
    'student_book', 'teacher_guide', 'teacher_guidance', 'distribution', 'solution', 'worksheet_reference', 'other'
  )),
  curriculum_year text not null,
  stage text,
  grade text,
  term text,
  subject text,
  version text not null default '1',
  storage_path text not null,
  file_hash text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index curriculum_documents_lookup_idx
on public.curriculum_documents (curriculum_year, stage, grade, term, subject, document_type);

create trigger curriculum_documents_set_updated_at before update on public.curriculum_documents
for each row execute function public.set_updated_at();

alter table public.curriculum_documents enable row level security;

create policy "subscribers can read curriculum documents"
on public.curriculum_documents for select to authenticated
using (is_active = true and public.has_active_subscription());

grant select on public.curriculum_documents to authenticated;

