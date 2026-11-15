/**
 * Schema and integrity check for everything under the content root.
 *
 * Runs on its own (`npm run check:content`) and inside `astro build` (see
 * src/integrations/content-integrity.ts), so the build fails on:
 *   - any entry that does not match its schema (src/schemas/),
 *   - a citation key that is not in the bibliography,
 *   - a grade that contradicts the cited edition (methodology §2: A needs a named printed or
 *     critical edition; A‑w is for websites that do not name their edition),
 *   - a reference to an entry that does not exist,
 *   - an uncited paragraph, list item or table row in a library MDX body,
 *   - an image file without a record, or an added image whose file is missing.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { COLLECTIONS, contentRoot, yantraFile, type CollectionName } from '../schemas';
import { yantraSchema } from '../schemas/yantra';
import { ID_PATTERN } from '../schemas/common';
import { GRADE_A_KINDS, type Edition } from '../schemas/edition';
import { lintMdx } from './citation-lint';

export interface Issue {
  file: string;
  line?: number;
  message: string;
}

export interface Entry {
  id: string;
  file: string;
  data: Record<string, unknown>;
  body?: string;
  bodyLine?: number;
}

export interface CheckResult {
  issues: Issue[];
  entries: Record<CollectionName, Entry[]>;
}

const IMAGE_FILE = /\.(?:jpe?g|png|webp|avif|tiff?|gif|svg)$/i;

function matchesPattern(name: string, pattern: string): boolean {
  const m = pattern.match(/^\*\.\{(.+)\}$/) ?? pattern.match(/^\*\.(.+)$/);
  if (!m) throw new Error(`Unsupported pattern ${pattern}`);
  return m[1]!.split(',').some((ext) => name.endsWith(`.${ext}`));
}

/** Splits YAML frontmatter from an MD/MDX file. */
function splitFrontmatter(src: string): { fm: string; body: string; bodyLine: number } | null {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  return { fm: m[1]!, body: src.slice(m[0].length), bodyLine: m[0].split('\n').length };
}

function formatPath(p: PropertyKey[]): string {
  return p.map((k) => (typeof k === 'number' ? `[${k}]` : `.${String(k)}`)).join('').replace(/^\./, '');
}

function loadCollection(root: string, name: CollectionName, issues: Issue[]): Entry[] {
  const def = COLLECTIONS[name];
  const entries: Entry[] = [];
  const rel = (f: string) => path.relative(process.cwd(), f);

  const validate = (file: string, id: string, raw: unknown, extra: Partial<Entry> = {}) => {
    const result = def.schema.safeParse(raw);
    if (!result.success) {
      for (const iss of result.error.issues)
        issues.push({ file: rel(file), message: `${formatPath(iss.path) || '(entry)'}: ${iss.message}` });
      return;
    }
    entries.push({ id, file: rel(file), data: result.data as Record<string, unknown>, ...extra });
  };

  if ('single' in def && def.single) {
    const file = path.join(root, def.path);
    if (!existsSync(file)) return entries;
    let raw: unknown;
    try {
      raw = parseYaml(readFileSync(file, 'utf8')) ?? [];
    } catch (err) {
      issues.push({ file: rel(file), message: `YAML error: ${(err as Error).message}` });
      return entries;
    }
    if (!Array.isArray(raw)) {
      issues.push({ file: rel(file), message: 'Must be a YAML list of entries, each with an id.' });
      return entries;
    }
    const seen = new Set<string>();
    raw.forEach((item, i) => {
      const itemId = (item as { id?: unknown })?.id;
      if (typeof itemId === 'string' && seen.has(itemId))
        issues.push({ file: rel(file), message: `[${i}] duplicate id "${itemId}".` });
      if (typeof itemId === 'string') seen.add(itemId);
      const before = issues.length;
      validate(file, typeof itemId === 'string' ? itemId : `#${i}`, item);
      for (let k = before; k < issues.length; k++) issues[k]!.message = `[${i}] ${issues[k]!.message}`;
    });
    return entries;
  }

  const dir = path.join(root, def.path);
  if (!existsSync(dir)) return entries;
  for (const name of readdirSync(dir).sort()) {
    const file = path.join(dir, name);
    if (!statSync(file).isFile() || !matchesPattern(name, (def as { pattern: string }).pattern)) continue;
    const id = name.replace(/\.[^.]+$/, '');
    if (!ID_PATTERN.test(id)) {
      issues.push({
        file: rel(file),
        message: 'File names are lowercase ASCII words joined by hyphens (they become the page URL).',
      });
      continue;
    }
    const src = readFileSync(file, 'utf8');
    try {
      if (def.body) {
        const parts = splitFrontmatter(src);
        if (!parts) {
          issues.push({ file: rel(file), message: 'Missing YAML frontmatter between --- lines.' });
          continue;
        }
        validate(file, id, parseYaml(parts.fm), { body: parts.body, bodyLine: parts.bodyLine });
      } else {
        validate(file, id, parseYaml(src));
      }
    } catch (err) {
      issues.push({ file: rel(file), message: `YAML error: ${(err as Error).message}` });
    }
  }
  return entries;
}

/** Every object with a `key` and a `grade` is a citation. */
function collectCitations(
  value: unknown,
  at: string,
  out: Array<{ key: string; grade: string; at: string }>,
): void {
  if (Array.isArray(value)) value.forEach((v, i) => collectCitations(v, `${at}[${i}]`, out));
  else if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if (typeof o.key === 'string' && typeof o.grade === 'string')
      out.push({ key: o.key, grade: o.grade, at });
    for (const [k, v] of Object.entries(o)) collectCitations(v, at ? `${at}.${k}` : k, out);
  }
}

type Ref = { collection: CollectionName; id: string; at: string };

/** References from each collection to entries in others. */
function collectRefs(name: CollectionName, d: Record<string, any>): Ref[] {
  const refs: Ref[] = [];
  const add = (collection: CollectionName, id: unknown, at: string) => {
    if (typeof id === 'string') refs.push({ collection, id, at });
  };
  const many = (collection: CollectionName, ids: unknown, at: string) =>
    Array.isArray(ids) && ids.forEach((id, i) => add(collection, id, `${at}[${i}]`));

  switch (name) {
    case 'devata':
      d.consorts?.forEach((r: any, i: number) => add('devata', r.devata, `consorts[${i}].devata`));
      d.related?.forEach((r: any, i: number) => add('devata', r.devata, `related[${i}].devata`));
      many('passage', d.iconography?.dhyana, 'iconography.dhyana');
      many('mantra', d.mantras, 'mantras');
      many('place', d.places, 'places');
      d.yantras?.forEach((y: any, i: number) => add('image', y.image, `yantras[${i}].image`));
      break;
    case 'grantha':
      many('edition', d.editions, 'editions');
      many('devata', d.related_devata, 'related_devata');
      d.quoted_in?.forEach((q: any, i: number) => {
        add('grantha', q.grantha, `quoted_in[${i}].grantha`);
        add('passage', q.passage, `quoted_in[${i}].passage`);
      });
      break;
    case 'passage':
      add('grantha', d.location?.grantha, 'location.grantha');
      add('edition', d.location?.edition, 'location.edition');
      break;
    case 'mantra':
      add('grantha', d.source_text?.grantha, 'source_text.grantha');
      add('edition', d.source_text?.edition, 'source_text.edition');
      add('edition', d.attribution_check?.checked_edition, 'attribution_check.checked_edition');
      many('devata', d.related_devata, 'related_devata');
      break;
    case 'person':
      many('grantha', d.works, 'works');
      break;
    case 'place':
      d.presiding_forms?.forEach((r: any, i: number) =>
        add('devata', r.devata, `presiding_forms[${i}].devata`),
      );
      break;
    case 'image':
      many('devata', d.depicts, 'depicts');
      break;
    case 'edition':
      add('grantha', d.of_text, 'of_text');
      break;
    case 'claim':
      break;
  }
  return refs;
}

/** Citation keys must resolve, and the grade must fit the edition kind (methodology §2). */
function checkCitations(data: unknown, file: string, editions: Map<string, Edition>, issues: Issue[]): void {
  const cites: Array<{ key: string; grade: string; at: string }> = [];
  collectCitations(data, '', cites);
  for (const c of cites) {
    const ed = editions.get(c.key);
    if (!ed) {
      issues.push({ file, message: `${c.at}: citation key "${c.key}" is not in the bibliography.` });
      continue;
    }
    if (c.grade === 'A' && !GRADE_A_KINDS.includes(ed.kind))
      issues.push({
        file,
        message: `${c.at}: grade A needs a named printed or critical edition, but "${c.key}" is a ${ed.kind} (methodology §2; use A‑w for an online text whose edition is not named).`,
      });
    if (c.grade === 'A-w' && ed.kind !== 'website')
      issues.push({
        file,
        message: `${c.at}: grade A‑w is for a text read online where the site does not name its edition, but "${c.key}" is a ${ed.kind} (methodology §2).`,
      });
  }
}

/** The yantra-form map data: schema, then its citations against the bibliography. */
function checkYantra(file: string, editions: Map<string, Edition>, issues: Issue[]): void {
  const rel = path.relative(process.cwd(), path.resolve(file));
  if (!existsSync(file)) {
    issues.push({ file: rel, message: 'Yantra map data not found.' });
    return;
  }
  let raw: unknown;
  try {
    raw = parseYaml(readFileSync(file, 'utf8'));
  } catch (err) {
    issues.push({ file: rel, message: `YAML error: ${(err as Error).message}` });
    return;
  }
  const result = yantraSchema.safeParse(raw);
  if (!result.success) {
    for (const iss of result.error.issues)
      issues.push({ file: rel, message: `${formatPath(iss.path) || '(file)'}: ${iss.message}` });
    return;
  }
  checkCitations(result.data, rel, editions, issues);
}

export function checkContent(root = contentRoot(), yantra = yantraFile()): CheckResult {
  const absRoot = path.resolve(root);
  const issues: Issue[] = [];
  const entries = Object.fromEntries(
    (Object.keys(COLLECTIONS) as CollectionName[]).map((name) => [
      name,
      loadCollection(absRoot, name, issues),
    ]),
  ) as Record<CollectionName, Entry[]>;

  const ids = Object.fromEntries(
    Object.entries(entries).map(([k, v]) => [k, new Set(v.map((e) => e.id))]),
  ) as Record<CollectionName, Set<string>>;
  const editions = new Map(entries.edition.map((e) => [e.id, e.data as unknown as Edition]));

  for (const [name, list] of Object.entries(entries) as [CollectionName, Entry[]][]) {
    for (const entry of list) {
      // References between entries.
      for (const ref of collectRefs(name, entry.data)) {
        if (!ids[ref.collection].has(ref.id))
          issues.push({
            file: entry.file,
            message: `${name === 'edition' ? `[${entry.id}] ` : ''}${ref.at}: no ${ref.collection} entry "${ref.id}".`,
          });
      }
      // Citations: key must resolve; grade must fit the edition kind.
      checkCitations(entry.data, entry.file, editions, issues);
      // Citation lint on MDX bodies.
      if (entry.body !== undefined) {
        for (const li of lintMdx(entry.body, { editions: ids.edition, entries: ids }))
          issues.push({
            file: entry.file,
            line: li.line !== undefined ? li.line + (entry.bodyLine ?? 1) - 1 : undefined,
            message: li.message,
          });
      }
    }
  }

  checkYantra(yantra, editions, issues);

  // Passages and mantras with a top-level grade also need their source edition kind to fit.
  for (const p of entries.passage) {
    const d = p.data as any;
    const ed = editions.get(d.location?.edition);
    if (ed && d.grade === 'A' && !GRADE_A_KINDS.includes(ed.kind))
      issues.push({ file: p.file, message: `grade A needs a named printed or critical edition, but "${d.location.edition}" is a ${ed.kind}.` });
    if (ed && d.grade === 'A-w' && ed.kind !== 'website')
      issues.push({ file: p.file, message: `grade A‑w is for an unnamed online edition, but "${d.location.edition}" is a ${ed.kind}.` });
  }

  // Images: "No record, no image" (content/images/README.md).
  const imgDir = path.join(absRoot, COLLECTIONS.image.path);
  if (existsSync(imgDir)) {
    const recorded = new Set(entries.image.map((e) => (e.data as { file?: string }).file).filter(Boolean));
    for (const name of readdirSync(imgDir)) {
      if (IMAGE_FILE.test(name) && !recorded.has(name))
        issues.push({
          file: path.relative(process.cwd(), path.join(imgDir, name)),
          message: 'Image file has no record. Every image needs a <name>.yaml record (concept §4.7A).',
        });
    }
    for (const e of entries.image) {
      const d = e.data as { status: string; file?: string };
      if (d.status === 'added' && d.file && !existsSync(path.join(imgDir, d.file)))
        issues.push({ file: e.file, message: `status "added" but ${d.file} is not in ${COLLECTIONS.image.path}/.` });
    }
  }

  return { issues, entries };
}

export function formatIssues(issues: Issue[]): string {
  return issues.map((i) => `  ✗ ${i.file}${i.line ? `:${i.line}` : ''}  ${i.message}`).join('\n');
}
