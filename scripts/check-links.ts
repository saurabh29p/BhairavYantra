/**
 * Internal link check over built sites: every href/src/srcset that points inside the site must
 * resolve to a file, and every #fragment to an element id on the target page.
 * External links are listed but not fetched (the build runs offline).
 *
 * Usage: npm run check:links -- dist [dist-fixtures ...]
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pagesIn, resolveFile } from './lib/site';

const dirs = process.argv.slice(2);
if (dirs.length === 0) dirs.push('dist');

const ATTR = /\s(?:href|src|srcset|poster|action)=("([^"]*)"|'([^']*)')/g;
let failures = 0;

for (const dir of dirs) {
  const ids = new Map<string, Set<string>>();
  const idsOf = (file: string) => {
    if (!ids.has(file)) {
      const html = readFileSync(file, 'utf8');
      ids.set(file, new Set([...html.matchAll(/\sid=("([^"]*)"|'([^']*)')/g)].map((m) => m[2] ?? m[3] ?? '')));
    }
    return ids.get(file)!;
  };
  const external = new Set<string>();
  const pages = pagesIn(dir);
  let checked = 0;

  for (const page of pages) {
    const file = resolveFile(dir, page)!;
    const html = readFileSync(file, 'utf8');
    for (const m of html.matchAll(ATTR)) {
      const raw = (m[2] ?? m[3] ?? '').trim();
      const values = m[0].includes('srcset=') ? raw.split(',').map((s) => s.trim().split(/\s+/)[0] ?? '') : [raw];
      for (const value of values) {
        if (!value || /^(?:mailto:|tel:|data:|javascript:)/i.test(value)) continue;
        if (/^[a-z]+:\/\//i.test(value) || value.startsWith('//')) {
          external.add(value);
          continue;
        }
        checked++;
        const url = new URL(value, `http://site${page}`);
        const target = resolveFile(dir, url.pathname);
        if (!target) {
          console.error(`  ✗ ${dir}${page} → ${value} (no such page or file)`);
          failures++;
          continue;
        }
        const frag = decodeURIComponent(url.hash.slice(1));
        if (frag && target.endsWith('.html') && !idsOf(target).has(frag)) {
          console.error(`  ✗ ${dir}${page} → ${value} (no element with id "${frag}")`);
          failures++;
        }
      }
    }
  }
  console.log(`${dir}: ${pages.length} pages, ${checked} internal links checked, ${external.size} external links not fetched.`);
}

if (failures > 0) {
  console.error(`\nLink check failed: ${failures} broken link${failures === 1 ? '' : 's'}.`);
  process.exit(1);
}
console.log('Link check passed.');
