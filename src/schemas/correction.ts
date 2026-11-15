/**
 * Corrections log (concept §6.6–6.7, §10.5): each correction made to a library page, with
 * the source that justified it. Git history remains the full audit trail.
 */
import { z } from 'astro/zod';
import { citation, isoDate, text } from './common';

export const correctionSchema = z.strictObject({
  date: isoDate,
  /** Site path of the corrected page. */
  page: z.string().startsWith('/'),
  summary_en: text,
  summary_hi: text.optional(),
  /** The source that justified the change. */
  source: citation,
  /** Who reported it, if they agreed to be credited. */
  credit: text.optional(),
  /** Commit or pull request link for the change. */
  change_url: z.url().optional(),
});

export type Correction = z.infer<typeof correctionSchema>;
