/**
 * Synonym groups for the search page: src/data/search-synonyms.yaml, plus every name on the
 * yantra-form map and every entry's names and spellings.
 */
import { readFileSync } from 'node:fs';
import { getCollection } from 'astro:content';
import { parse as parseYaml } from 'yaml';
import { loadYantra } from '../../lib/yantra';

export async function GET() {
  const file = parseYaml(readFileSync('src/data/search-synonyms.yaml', 'utf8')) as { groups?: string[][] };
  const groups: string[][] = [...(file.groups ?? [])];
  for (const s of loadYantra().slots) groups.push([s.label_en, s.label_iast, s.label_sa, s.label_hi].filter((v): v is string => !!v));
  const named = [
    ...(await getCollection('devata')),
    ...(await getCollection('grantha')),
    ...(await getCollection('person')),
    ...(await getCollection('place')),
  ];
  for (const e of named) {
    const d = e.data as { name_iast: string; name_sa?: string; spellings: string[] };
    groups.push([d.name_iast, d.name_sa, ...d.spellings].filter((v): v is string => !!v));
  }
  for (const g of await getCollection('glossary'))
    groups.push([g.data.term_iast, g.data.term_sa, g.data.term_hi, ...g.data.spellings].filter((v): v is string => !!v));
  const unique = groups.map((g) => [...new Set(g)]).filter((g) => g.length > 1);
  return new Response(JSON.stringify({ groups: unique }), { headers: { 'content-type': 'application/json' } });
}
