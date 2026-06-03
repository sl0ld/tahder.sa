# Tahder

Tahder is a teacher assistant focused on reducing preparation time for Saudi
school workflows. The product direction is centered on lesson preparation,
Madrasati automation, curriculum distribution, assignments, worksheets,
reports, subscriptions, and a Chrome extension.

## Current focus

- Generate lesson preparation drafts from selected lessons.
- Support Madrasati-ready fields for objectives, strategies, resources,
  assessment, homework, and closure.
- Connect the website and Chrome extension to Supabase subscriptions.
- Keep curriculum books and teacher guides in a private managed library.
- Publish a public marketing website without exposing the private source.

## Out of scope

Student attendance and absence tracking are intentionally removed. The teacher
workflow should not make attendance management a core responsibility in Tahder.

## Local development

```bash
npm install
npm run dev
```

The Expo web app usually runs on:

```text
http://localhost:19007
```

The Chrome extension demo runs from the local `extension` folder.

## Supabase

Database migrations live in `supabase/migrations`.

The active product tables cover:

- accounts and profiles
- plans and subscriptions
- linked extension devices
- lesson catalog and preparations
- AI generation logs
- curriculum documents and distributions
- classes and students
- assignments, questions, submissions, and worksheets
- export and sync jobs
- activity logs

Run migrations in order when preparing a new Supabase project. Existing
projects should also run `202606030001_remove_attendance.sql` to remove the old
attendance tables if they were created before the product scope changed.

## Public website

Build the safe public copy with:

```bash
npm run site:build-public
```

The generated folder only contains the public marketing website files. It does
not include extension source, Supabase migrations, Edge Functions, curriculum
files, or mobile app source.
