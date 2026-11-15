/**
 * Mantra, concept §4.4 and §8.2.
 *
 * There is deliberately no "benefits" field. A phalaśruti stated by a source text is quoted
 * as a Passage, attributed to the text, never given in the site's own voice.
 */
import { z } from 'astro/zod';
import { citation, devanagari, grade, id, locator, text } from './common';

const FORBIDDEN_KEYS = /benefit|phala/i;

export const ATTRIBUTION_RESULTS = ['confirmed', 'not-found', 'not-checked', 'no-claim'] as const;

export const mantraSchema = z
  .strictObject(
    {
      /** Verbatim, exactly as the source gives it. */
      text_sa: devanagari,
      /** These six only if, and exactly as, the source gives them. */
      viniyoga: text.optional(),
      rsi: text.optional(),
      chandas: text.optional(),
      devata: text.optional(),
      bija: text.optional(),
      sakti: text.optional(),
      source_text: z.strictObject({ grantha: id, edition: id.optional(), location: locator }),
      /** Link to the text we read (methodology rule 3). */
      where_we_read_it: z.url(),
      grade,
      /**
       * Whether the mantra's claimed source actually contains it, e.g.
       * "Claimed: Rudrayāmala. Not found in [edition]. Grade D ⚠." (concept §4.4).
       */
      attribution_check: z.strictObject({
        result: z.enum(ATTRIBUTION_RESULTS),
        claimed_source: text.optional(),
        /** Edition id checked. */
        checked_edition: id.optional(),
        note: text.optional(),
      }),
      tradition_note: z.strictObject({ text, source: citation }).optional(),
      related_devata: z.array(id).default([]),
    },
    {
      error: (issue) =>
        issue.code === 'unrecognized_keys' && issue.keys.some((k) => FORBIDDEN_KEYS.test(k))
          ? 'Mantras have no benefits/phala field. Quote a phalaśruti as a Passage attributed to its text (concept §4.4).'
          : undefined,
    },
  )
  .superRefine((m, ctx) => {
    const a = m.attribution_check;
    if ((a.result === 'confirmed' || a.result === 'not-found') && (!a.claimed_source || !a.checked_edition))
      ctx.addIssue({
        code: 'custom',
        path: ['attribution_check'],
        message: `"${a.result}" needs claimed_source and the checked_edition.`,
      });
    if (a.result === 'not-checked' && !a.claimed_source)
      ctx.addIssue({
        code: 'custom',
        path: ['attribution_check', 'claimed_source'],
        message: '"not-checked" needs the claimed_source that has not been checked yet.',
      });
    if (a.result === 'not-found' && m.grade !== 'D' && m.grade !== '⚠')
      ctx.addIssue({
        code: 'custom',
        path: ['grade'],
        message: 'A mantra not found in its claimed source is graded D or ⚠ (concept §4.4).',
      });
  });

export type Mantra = z.infer<typeof mantraSchema>;
