/** Passage (a quoted verse or prose unit), concept §4.3. */
import { z } from 'astro/zod';
import { citation, devanagari, grade, id, locator, text } from './common';

/**
 * A translation. "ours" marks the site's own rendering (methodology rule 2); any other
 * translator is a named person, and a published translation needs its licence (concept §7).
 */
export const translation = z
  .strictObject({
    text,
    translator: text,
    licence: text.optional(),
  })
  .superRefine((t, ctx) => {
    if (t.translator !== 'ours' && !t.licence)
      ctx.addIssue({
        code: 'custom',
        path: ['licence'],
        message:
          'A translation by a named translator needs its licence or permission (concept §7). Use translator: ours for the site\'s own rendering.',
      });
  });

export const passageSchema = z.strictObject({
  /** Verbatim from the named edition. Never corrected or normalised. */
  text_sa: devanagari,
  iast: text.optional(),
  translation_en: translation.optional(),
  translation_hi: translation.optional(),
  location: z.strictObject({
    grantha: id,
    edition: id,
    /** Part, book or khaṇḍa, where the text has them. */
    division: text.optional(),
    chapter: locator,
    verse: locator,
  }),
  grade,
  where_we_read_it: z.url().optional(),
  variant_readings: z
    .array(z.strictObject({ reading_sa: devanagari, source: citation, note: text.optional() }))
    .default([]),
});

export type Passage = z.infer<typeof passageSchema>;
