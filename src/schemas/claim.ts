/** Claim (the claims register), concept §4.7. */
import { z } from 'astro/zod';
import { citation, isoDate, text } from './common';

export const CLAIM_STATUSES = ['unverified', 'disputed', 'refuted', 'verified'] as const;

export const claimSchema = z
  .strictObject({
    statement_en: text.optional(),
    statement_hi: text.optional(),
    who_claims_it: z
      .array(
        z.strictObject({
          name: text,
          kind: z.enum(['site', 'book', 'tradition', 'person', 'other']),
          source: citation.optional(),
          url: z.url().optional(),
        }),
      )
      .min(1, { error: 'Say who makes the claim.' }),
    status: z.enum(CLAIM_STATUSES),
    evidence_for: z.array(citation).default([]),
    evidence_against: z.array(citation).default([]),
    /** Site paths of pages that rely on or mention the claim, e.g. /devata/kala-bhairava/ */
    pages_affected: z.array(z.string().startsWith('/')).default([]),
    opened_on: isoDate,
    last_reviewed: isoDate.optional(),
  })
  .superRefine((c, ctx) => {
    if (!c.statement_en && !c.statement_hi)
      ctx.addIssue({
        code: 'custom',
        path: ['statement_en'],
        message: 'A claim needs its statement (statement_en and/or statement_hi).',
      });
    c.who_claims_it.forEach((w, i) => {
      if (!w.source && !w.url)
        ctx.addIssue({
          code: 'custom',
          path: ['who_claims_it', i],
          message: 'Say where the claim is made: a source citation or a url.',
        });
    });
    if (c.status === 'verified' && c.evidence_for.length === 0)
      ctx.addIssue({
        code: 'custom',
        path: ['evidence_for'],
        message: '"verified" needs evidence_for.',
      });
    if (c.status === 'refuted' && c.evidence_against.length === 0)
      ctx.addIssue({
        code: 'custom',
        path: ['evidence_against'],
        message: '"refuted" needs evidence_against.',
      });
  });

export type Claim = z.infer<typeof claimSchema>;
