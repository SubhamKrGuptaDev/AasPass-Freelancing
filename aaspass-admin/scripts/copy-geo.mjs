// Copies the generated country list from the marketplace client so the admin app shares one source of truth.
import { cpSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, '../aaspass-client/src/app/geo/countries.generated.ts');
const geoSource = resolve(root, '../aaspass-client/public/geo');
const geoTarget = resolve(root, 'public/geo');
const target = resolve(root, 'src/app/geo/countries.generated.ts');

if (!existsSync(source)) {
  console.error(`copy:geo failed: source not found at ${source}. Make sure aaspass-client exists next to aaspass-admin.`);
  process.exit(1);
}
mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);

// Angular refuses asset inputs outside the workspace root, so the geo JSON is mirrored into public/geo (git-ignored).
if (!existsSync(geoSource)) {
  console.error(`copy:geo failed: geo data not found at ${geoSource}.`);
  process.exit(1);
}
cpSync(geoSource, geoTarget, { recursive: true });
console.log('copy:geo: countries.generated.ts and public/geo copied from aaspass-client');
