// Builds the country list and per-country city files from node_modules (no network).
// Sources: countries-list (MIT), cities.json (CC-BY-4.0, GeoNames data).
// Run: npm run build:geo. Generated outputs are committed.
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { countries } = require('countries-list');
const cities = require('cities.json');

/** Always merged so existing store data keeps working. */
const EXTRAS = { IN: ['Bengaluru', 'Delhi NCR', 'Mumbai', 'Pune', 'Hyderabad'] };

const byCountry = new Map();
for (const { name, country } of cities) {
  if (typeof name !== 'string' || typeof country !== 'string') continue;
  if (!byCountry.has(country)) byCountry.set(country, []);
  byCountry.get(country).push(name);
}

const outDir = resolve(root, 'public/geo/cities');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const list = Object.entries(countries)
  .map(([code, c]) => ({ code, name: String(c.name).trim() }))
  .filter((c) => c.name)
  .sort((a, b) => a.name.localeCompare(b.name));

for (const { code } of list) {
  const seen = new Set();
  const out = [];
  for (const raw of [...(byCountry.get(code) ?? []), ...(EXTRAS[code] ?? [])]) {
    const name = raw.trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  out.sort((a, b) => a.localeCompare(b));
  writeFileSync(resolve(outDir, `${code}.json`), JSON.stringify(out));
}

const lines = list.map((c) => `  { code: ${JSON.stringify(c.code)}, name: ${JSON.stringify(c.name)} },`);
writeFileSync(
  resolve(root, 'src/app/geo/countries.generated.ts'),
  `// Generated - do not edit; run npm run build:geo\n\nexport interface Country {\n  code: string;\n  name: string;\n}\n\nexport const COUNTRIES: readonly Country[] = [\n${lines.join('\n')}\n];\n`,
);
console.log(`Wrote ${list.length} countries`);
