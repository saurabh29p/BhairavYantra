/**
 * Grantha (text), concept §4.2, with the text-status framework of concept §5.
 *
 * The status a text may carry depends on the evidence recorded for it. These rules are
 * checked here so that "lost" or "recovered" can never appear without that evidence.
 */
import { z } from 'astro/zod';
import {
  citation,
  devanagari,
  grade,
  iast,
  id,
  isoDate,
  locator,
  openQuestions,
  pageStatus,
  spellings,
  text,
} from './common';

export const TEXT_STATUSES = [
  'extant',
  'fragmentary',
  'lost-quoted',
  'lost-name-only',
  'claimed-recovered',
] as const;
export type TextStatus = (typeof TEXT_STATUSES)[number];

export const GENRES = [
  'purana',
  'tantra-agama',
  'yamala',
  'stotra',
  'nibandha',
  'commentary',
  'modern',
] as const;

const manuscript = z.strictObject({
  repository: text,
  catalogue_number: text,
  date: text.optional(),
  script: text.optional(),
  completeness: text.optional(),
  source: citation.optional(),
});

const quotedIn = z.strictObject({
  /** Grantha id of the later text that quotes this one. */
  grantha: id,
  location: locator,
  /** Passage id of the quoted passage. */
  passage: id.optional(),
  source: citation,
});

/** The concept §5 checklist for moving a text from status 3/4 to 1/2. All four parts. */
const recovery = z.strictObject({
  previous_status: z.enum(['lost-quoted', 'lost-name-only']),
  /** (a) A named manuscript with repository and catalogue/accession number. */
  manuscript,
  /** (b) A description of it. */
  description: z.strictObject({ script: text, date: text, extent: text }),
  /** (c) An edition, or a published description by a named scholar. */
  edition_or_description: citation,
  /** (d) The reason to identify it with the lost text. */
  identification: z.strictObject({ reason: text, source: citation }),
});

export const granthaSchema = z
  .strictObject({
    name_sa: devanagari,
    name_iast: iast,
    spellings,
    genre: z.enum(GENRES),
    text_status: z.enum(TEXT_STATUSES),
    /** Sub-label for extant texts, concept §5. */
    extant_form: z.enum(['critical-edition', 'printed-vulgate', 'manuscript-only']).optional(),
    status_evidence: z
      .array(citation)
      .min(1, { error: 'A text status needs its evidence (concept §4.2).' }),
    date_range: z
      .strictObject({
        display: text,
        /** Years for the timeline; negative for BCE. */
        from: z.number().int().optional(),
        to: z.number().int().optional(),
        grade,
        source: citation,
      })
      .optional(),
    /** Edition ids. */
    editions: z.array(id).default([]),
    manuscripts: z.array(manuscript).default([]),
    /** For fragmentary texts: which parts survive. */
    surviving_parts: text.optional(),
    /** For lost texts known through quotation. */
    quoted_in: z.array(quotedIn).default([]),
    /** For texts known by name only: where the name is found. */
    named_in: z.array(citation).default([]),
    /** For claimed-recovered texts: the claim and who makes it. */
    claim: z.strictObject({ statement: text, claimant: text, source: citation }).optional(),
    /** Present only when a text has moved from lost to extant/fragmentary (concept §5). */
    recovery: recovery.optional(),
    contents_summary: z.strictObject({ en: text, hi: text }).optional(),
    related_devata: z.array(id).default([]),
    status: pageStatus,
    last_reviewed: isoDate,
    open_questions: openQuestions,
  })
  .superRefine((g, ctx) => {
    const fail = (message: string, path: (string | number)[]) =>
      ctx.addIssue({ code: 'custom', message, path });

    switch (g.text_status) {
      case 'extant':
        if (g.editions.length === 0 && g.manuscripts.length === 0)
          fail(
            '"Extant" needs at least one named edition or a manuscript with repository and catalogue number (concept §5).',
            ['text_status'],
          );
        if (!g.extant_form)
          fail('"Extant" needs a sub-label: critical-edition, printed-vulgate or manuscript-only.', [
            'extant_form',
          ]);
        break;
      case 'fragmentary':
        if (!g.surviving_parts || g.manuscripts.length === 0)
          fail(
            '"Fragmentary" needs surviving_parts and the manuscripts they come from (concept §5).',
            ['text_status'],
          );
        break;
      case 'lost-quoted':
        if (g.quoted_in.length === 0 || g.quoted_in.some((q) => !q.passage))
          fail(
            '"Lost, known through quotation" needs each quoting text with location and the quoted passage (concept §5).',
            ['quoted_in'],
          );
        if (g.manuscripts.length > 0)
          fail('A text with a known manuscript is not "lost".', ['manuscripts']);
        break;
      case 'lost-name-only':
        if (g.named_in.length === 0 || g.named_in.some((c) => !c.location))
          fail(
            '"Lost, known by name only" needs the source of the name, with location (concept §5).',
            ['named_in'],
          );
        if (g.manuscripts.length > 0 || g.quoted_in.length > 0)
          fail(
            'A text with a manuscript or identified quotations is not "known by name only".',
            ['text_status'],
          );
        break;
      case 'claimed-recovered':
        if (!g.claim)
          fail('"Claimed recovered" needs the claim and its source (concept §5).', ['claim']);
        break;
    }

    if (g.extant_form && g.text_status !== 'extant')
      fail('extant_form is only used with text_status "extant".', ['extant_form']);

    if (g.recovery && g.text_status !== 'extant' && g.text_status !== 'fragmentary')
      fail(
        'A recovery record means the text now counts as extant or fragmentary; set text_status accordingly.',
        ['recovery'],
      );
  });

export type Grantha = z.infer<typeof granthaSchema>;
