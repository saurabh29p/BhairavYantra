/**
 * Glossary term (concept §3 gate 3): a Sanskrit term in Devanāgarī, IAST, Hindi and English.
 * The gloss is a claim like any other, so it carries citations. Terms come only from the
 * research files.
 */
import { z } from 'astro/zod';
import { citation, devanagari, iast, spellings, text } from './common';

export const glossarySchema = z.strictObject({
  term_sa: devanagari,
  term_iast: iast,
  /** Hindi form, if it differs from the Sanskrit. */
  term_hi: text.optional(),
  term_en: text.optional(),
  gloss_en: text,
  gloss_hi: text.optional(),
  sources: z.array(citation).min(1, { error: 'A glossary entry needs at least one source.' }),
  /** Site paths of pages that use the term. */
  see: z.array(z.string().startsWith('/')).default([]),
  spellings,
});

export type GlossaryTerm = z.infer<typeof glossarySchema>;
