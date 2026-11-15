/**
 * IAST → plain ASCII folding for sorting and (later) search (concept §9):
 * ā→a, ī→i, ū→u, ṛ→r, ṅ/ñ/ṇ→n, ṭ→t, ḍ→d, ś/ṣ→s, ṃ/ṁ→m, ḥ→h, ḷ→l.
 * Used only for keys; displayed text is never changed.
 */
export function foldIast(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

export function byIast<T>(key: (t: T) => string) {
  return (a: T, b: T) => foldIast(key(a)).localeCompare(foldIast(key(b)), 'en');
}

/** First letter for the A–Z index, after folding. */
export function indexLetter(s: string): string {
  const c = foldIast(s).replace(/^[^a-z0-9]+/, '').charAt(0);
  return /[a-z]/.test(c) ? c.toUpperCase() : '#';
}
