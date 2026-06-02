import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(projectRoot, 'extension-site');
const outputDir = join(projectRoot, 'public-site-dist');

// Keep this allow-list intentionally small. The public repository must never
// receive the extension, Supabase migrations, curriculum files, or app source.
const publicFiles = [
  'config.js',
  'index.html',
  'site.js',
  'styles.css',
  'supabase-client.js',
  'tools.css',
  'tools.html',
  'tools.js',
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const file of publicFiles) {
  await cp(join(sourceDir, file), join(outputDir, file));
}

const indexPath = join(outputDir, 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');
await writeFile(
  indexPath,
  indexHtml
    .replace('http://localhost:19100/demo.html', '#account')
    .replace('فتح صفحة التجربة', 'تسجيل الدخول للتجربة')
    .replace('نسخة تجريبية محلية لتطوير تجربة المعلم.', 'واجهة تحضيري لمساعدة المعلم.'),
);

await writeFile(join(outputDir, '.nojekyll'), '');
await writeFile(
  join(outputDir, 'README.md'),
  [
    '# Tahder public website',
    '',
    'Deploy-only static website generated from the private Tahder repository.',
    'Application source, browser extension source, database migrations, and curriculum files are intentionally excluded.',
    '',
  ].join('\n'),
);

console.log(`Prepared public website in ${outputDir}`);
