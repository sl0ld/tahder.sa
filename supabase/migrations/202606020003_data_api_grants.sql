grant usage on schema public to anon, authenticated;

grant select on public.plans to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select on public.subscriptions to authenticated;
grant select, insert, update, delete on public.linked_devices to authenticated;
grant select, insert, update, delete on public.extension_settings to authenticated;
grant select on public.lesson_catalog to authenticated;
grant select, insert, update, delete on public.preparations to authenticated;
grant select on public.generation_logs to authenticated;
grant select, insert on public.activity_logs to authenticated;

grant select, insert, update, delete on public.educational_contexts to authenticated;
grant select, insert, update, delete on public.teacher_classes to authenticated;
grant select, insert, update, delete on public.students to authenticated;
grant select, insert, update, delete on public.class_students to authenticated;
grant select, insert, update, delete on public.attendance_sessions to authenticated;
grant select, insert, update, delete on public.attendance_entries to authenticated;
grant select, insert, update, delete on public.assignments to authenticated;
grant select, insert, update, delete on public.assignment_questions to authenticated;
grant select, insert, update, delete on public.assignment_submissions to authenticated;
grant select, insert, update, delete on public.worksheets to authenticated;
grant select, insert, update, delete on public.curriculum_distributions to authenticated;
grant select, insert on public.export_logs to authenticated;
grant select, insert, update, delete on public.sync_jobs to authenticated;

grant usage, select on all sequences in schema public to authenticated;

