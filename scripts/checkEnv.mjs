import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(dir, '..', '.env');

const REQUIRED_VARS = ['VITE_API_BASE_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const OPTIONAL_VARS = ['VITE_APP_NAME', 'VITE_APP_ENV'];

const env = { ...process.env };
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
}

let missingRequired = 0;

console.log('Required environment variables:');
for (const key of REQUIRED_VARS) {
  const present = Boolean(env[key]);
  if (!present) missingRequired += 1;
  console.log(`  ${present ? 'OK     ' : 'MISSING'}  ${key}`);
}

console.log('\nOptional environment variables:');
for (const key of OPTIONAL_VARS) {
  console.log(`  ${env[key] ? 'OK     ' : 'MISSING'}  ${key}`);
}

if (missingRequired > 0) {
  console.error(`\n${missingRequired} required variable(s) missing.`);
  process.exit(1);
}

console.log('\nAll required environment variables are set.');
