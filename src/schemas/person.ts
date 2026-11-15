/** Sādhaka / Ācārya (person), concept §4.5 and §8.3. */
import { z } from 'astro/zod';
import {
  citation,
  devanagari,
  grade,
  iast,
  id,
  isoDate,
  openQuestions,
  pageStatus,
  spellings,
  text,
} from './common';

export const personSchema = z
  .strictObject({
    name_sa: devanagari.optional(),
    name_iast: iast,
    spellings,
    dates: z.strictObject({ display: text, grade, source: citation }).optional(),
    traditions: z.array(text).default([]),
    /** Grantha ids of works authored. */
    works: z.array(id).default([]),
    historicity: z.enum(['historical', 'traditional', 'mixed']),
    /** Documented history (usually grade A–C). */
    historical_sources: z.array(citation).default([]),
    /** Hagiography and tradition (usually grade D). */
    traditional_sources: z.array(citation).default([]),
    /** Living persons are excluded unless they have given written consent (concept §8.3). */
    living: z.boolean(),
    consent: z.strictObject({ file: text, date: isoDate, scope: text }).optional(),
    summary_en: text,
    summary_hi: text,
    status: pageStatus,
    last_reviewed: isoDate,
    open_questions: openQuestions,
  })
  .superRefine((p, ctx) => {
    if (p.living && !p.consent)
      ctx.addIssue({
        code: 'custom',
        path: ['living'],
        message:
          'Living persons are excluded by default; include one only with written consent on file (concept §8.3).',
      });
    const needHistorical = p.historicity !== 'traditional';
    const needTraditional = p.historicity !== 'historical';
    if (needHistorical && p.historical_sources.length === 0)
      ctx.addIssue({
        code: 'custom',
        path: ['historical_sources'],
        message: `historicity "${p.historicity}" needs historical_sources.`,
      });
    if (needTraditional && p.traditional_sources.length === 0)
      ctx.addIssue({
        code: 'custom',
        path: ['traditional_sources'],
        message: `historicity "${p.historicity}" needs traditional_sources.`,
      });
  });

export type Person = z.infer<typeof personSchema>;
