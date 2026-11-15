/**
 * Place (kṣetra / temple), concept §4.6. Textual mentions are kept separate from temple lore,
 * which is grade D "living tradition" (concept §8.3).
 */
import { z } from 'astro/zod';
import {
  citation,
  devanagari,
  iast,
  id,
  isoDate,
  openQuestions,
  pageStatus,
  spellings,
  text,
} from './common';

export const placeSchema = z
  .strictObject({
    name_sa: devanagari.optional(),
    name_iast: iast,
    name_en: text.optional(),
    spellings,
    location: z.strictObject({
      locality: text,
      region: text.optional(),
      country: text,
      coordinates: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]).optional(),
    }),
    presiding_forms: z.array(z.strictObject({ devata: id, source: citation })).default([]),
    textual_mentions: z.array(citation).default([]),
    temple_lore: z
      .array(z.strictObject({ statement_en: text, statement_hi: text.optional(), source: citation }))
      .default([]),
    summary_en: text,
    summary_hi: text,
    status: pageStatus,
    last_reviewed: isoDate,
    open_questions: openQuestions,
  })
  .superRefine((p, ctx) => {
    if (p.textual_mentions.length === 0 && p.temple_lore.length === 0)
      ctx.addIssue({
        code: 'custom',
        path: ['textual_mentions'],
        message: 'A place needs at least one textual mention or cited temple lore.',
      });
    p.textual_mentions.forEach((c, i) => {
      if (c.grade === 'D')
        ctx.addIssue({
          code: 'custom',
          path: ['textual_mentions', i, 'grade'],
          message: 'Grade D material is temple lore; record it under temple_lore (concept §4.6).',
        });
    });
    p.temple_lore.forEach((l, i) => {
      if (l.source.grade !== 'D' && l.source.grade !== '⚠')
        ctx.addIssue({
          code: 'custom',
          path: ['temple_lore', i, 'source', 'grade'],
          message:
            'Temple lore is grade D (or ⚠). A text-based statement belongs under textual_mentions.',
        });
    });
  });

export type Place = z.infer<typeof placeSchema>;
