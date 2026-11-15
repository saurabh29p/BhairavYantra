/**
 * Shared building blocks for every content schema.
 *
 * The rules here come from docs/01-methodology-and-sources.md (evidence grades) and
 * docs/00-concept.md §4 (content model). Text values are never transformed: Sanskrit and
 * research wording must reach the page exactly as written in content/.
 */
import { z } from 'astro/zod';

/** Evidence grades, methodology §2. Stored in ASCII; displayed as written in the docs. */
export const GRADES = ['A', 'A-w', 'B', 'C', 'D', '⚠'] as const;
export type Grade = (typeof GRADES)[number];

/** How each grade is written for display (the docs use a non-breaking hyphen in A‑w). */
export const GRADE_LABEL: Record<Grade, string> = {
  A: 'A',
  'A-w': 'A‑w',
  B: 'B',
  C: 'C',
  D: 'D',
  '⚠': '⚠',
};

/**
 * The research files write "A‑w" with U+2011 (non-breaking hyphen); a warning sign may carry
 * an emoji variation selector. Both are the same grade, so they are read as the ASCII form.
 * This only touches the grade code, never content text.
 */
export function normaliseGrade(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/[‐‑‒–]/g, '-')
    .replace(/️/g, '');
}

export function isGrade(value: unknown): value is Grade {
  return typeof value === 'string' && (GRADES as readonly string[]).includes(value);
}

export const grade = z.preprocess(
  normaliseGrade,
  z.enum(GRADES, {
    error: () => `Evidence grade must be one of ${GRADES.join(', ')} (methodology §2).`,
  }),
);

/** A non-empty string. Not trimmed or otherwise changed. */
export const text = z.string().refine((s) => s.trim().length > 0, { error: 'Must not be empty.' });

const DEVANAGARI = /\p{Script=Devanagari}/u;
/** Must contain Devanāgarī. Copied verbatim; never normalised. */
export const devanagari = text.refine((s) => DEVANAGARI.test(s), {
  error: 'Must be written in Devanāgarī.',
});

/** A transliteration in Latin script (IAST). Must not contain Devanāgarī. */
export const iast = text.refine((s) => !DEVANAGARI.test(s), {
  error: 'IAST must be in Latin script, not Devanāgarī.',
});

/** Slug used for file names, ids and references between entries. */
export const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const id = z.string().regex(ID_PATTERN, {
  error: 'Ids are lowercase ASCII words joined by hyphens, e.g. "kala-bhairava".',
});

/**
 * Calendar date as YYYY-MM-DD. YAML parsers disagree on whether an unquoted date becomes a
 * Date object or a string, so both are accepted and stored as a string.
 */
export const isoDate = z.preprocess(
  (v) => (v instanceof Date && !Number.isNaN(v.valueOf()) ? v.toISOString().slice(0, 10) : v),
  z.iso.date({ error: 'Use a date in the form YYYY-MM-DD.' }),
);

/**
 * Chapter and verse numbers must be quoted strings: YAML would read 31.30 as the number 31.3.
 */
export const locator = z.string({
  error: 'Write chapter/verse numbers as quoted text (e.g. "31.30"), so YAML does not change them.',
}).refine((s) => s.trim().length > 0, { error: 'Must not be empty.' });

/**
 * A citation: one reference to an Edition entry in content/bibliography.yaml (concept §4.8),
 * with the place in it and the evidence grade. Every claim carries one.
 */
export const citation = z.strictObject({
  /** Edition id in content/bibliography.yaml. */
  key: id,
  /** Chapter/verse, page, or other place in the edition. */
  location: locator.optional(),
  grade,
  /** Where we read it, if online. */
  url: z.url().optional(),
  note: text.optional(),
});
export type Citation = z.infer<typeof citation>;

/** Page workflow status, concept §4.1. */
export const pageStatus = z.enum(['draft', 'reviewed', 'stable']);

/** Search spellings, e.g. Bhairav / Bhairava / भैरव / Bhairo (concept §9). */
export const spellings = z.array(text).default([]);

/** Unverified points shown on the page, not hidden (concept §4.1). */
export const openQuestions = z.array(text).default([]);
