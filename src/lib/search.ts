/**
 * Query-side spelling help for Pagefind (concept §9). Pagefind already ignores diacritics
 * (kali finds Kālī); this adds what it cannot know:
 *  - popular "sh"/"ch" spellings for IAST ś/ṣ and c (Shiva → siva, Chanda → canda),
 *  - synonym groups across spellings and scripts (Bhairo → Bhairava, भैरव).
 * The search page runs every variant and merges the results.
 */
export type SynonymGroups = string[][];

/** Lowercase, diacritics removed. Devanāgarī is left as it is. */
export function fold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const MAX_VARIANTS = 12;

export function expandQuery(query: string, groups: SynonymGroups): string[] {
  const q = query.trim().replace(/\s+/g, ' ');
  if (!q) return [];
  const out = new Set<string>([q]);
  const add = (v: string) => {
    if (out.size < MAX_VARIANTS && v.trim()) out.add(v);
  };

  const folded = fold(q);
  add(folded.replace(/sh/g, 's'));
  add(folded.replace(/ch/g, 'c'));

  // Index groups by each folded member.
  const index = new Map<string, string[]>();
  for (const g of groups) for (const m of g) index.set(fold(m), g);

  const words = q.split(' ');
  // Whole query first (multi-word names), then single words.
  const whole = index.get(folded);
  if (whole) whole.forEach(add);
  words.forEach((w, i) => {
    const g = index.get(fold(w)) ?? index.get(fold(w).replace(/sh/g, 's'));
    if (!g) return;
    for (const m of g) add([...words.slice(0, i), m, ...words.slice(i + 1)].join(' '));
  });
  return [...out];
}
