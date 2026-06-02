import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const libraryDir = join(rootDir, 'curriculum-library');
const config = JSON.parse(await readFile(join(libraryDir, 'catalog.json'), 'utf8'));
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before syncing curriculum files.');
}

for (const document of config.documents) {
  const filePath = join(libraryDir, document.local_path);
  let bytes;

  try {
    bytes = await readFile(filePath);
  } catch {
    console.warn(`Skipped missing file: ${document.local_path}`);
    continue;
  }

  const hash = createHash('sha256').update(bytes).digest('hex');
  const storagePath = `${document.curriculum_year}/${document.id}/${document.version}/${basename(document.local_path)}`;
  await upload(storagePath, bytes);
  await upsert({ ...document, storage_path: storagePath, file_hash: hash });
  console.log(`Synced: ${document.title}`);
}

async function upload(storagePath, bytes) {
  const response = await fetch(`${supabaseUrl}/storage/v1/object/curriculum-books/${storagePath}`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/pdf',
      'x-upsert': 'true',
    },
    body: bytes,
  });

  if (!response.ok) {
    throw new Error(`Upload failed for ${storagePath}: ${await response.text()}`);
  }
}

async function upsert(document) {
  const response = await fetch(`${supabaseUrl}/rest/v1/curriculum_documents?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: document.id,
      title: document.title,
      document_type: document.document_type,
      curriculum_year: document.curriculum_year,
      stage: document.stage,
      grade: document.grade,
      term: document.term,
      subject: document.subject,
      version: document.version,
      storage_path: document.storage_path,
      file_hash: document.file_hash,
      metadata: { local_path: document.local_path, updated_at: document.updated_at },
      is_active: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Catalog update failed for ${document.id}: ${await response.text()}`);
  }
}

