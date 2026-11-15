/**
 * Edition: one entry in the single bibliography file, content/bibliography.yaml
 * (concept §4.8, §11). Every citation key resolves to one of these.
 */
import { z } from 'astro/zod';
import { id, text } from './common';

export const EDITION_KINDS = [
  'critical-edition',
  'printed-edition',
  'translation',
  'manuscript',
  'website',
  'scholarly-work',
  'field-record',
  'other',
] as const;
export type EditionKind = (typeof EDITION_KINDS)[number];

/** Kinds that count as "a named printed or critical edition" for grade A (methodology §2). */
export const GRADE_A_KINDS: readonly EditionKind[] = ['critical-edition', 'printed-edition', 'manuscript'];

export const editionSchema = z
  .strictObject({
    /** The citation key. */
    id,
    kind: z.enum(EDITION_KINDS),
    title: text,
    /** Short form for inline citations, e.g. "KūP". */
    short: text.optional(),
    /** Grantha id this is an edition or translation of. */
    of_text: id.optional(),
    authors: z.array(text).default([]),
    editors: z.array(text).default([]),
    translators: z.array(text).default([]),
    publisher: text.optional(),
    place: text.optional(),
    year: z.union([z.string(), z.number().int()]).transform(String).optional(),
    series: text.optional(),
    volume: text.optional(),
    url: z.url().optional(),
    /** Manuscripts: holding repository and catalogue/accession number. */
    repository: text.optional(),
    catalogue_number: text.optional(),
    /** False while details are still "to be confirmed" (methodology §5). */
    details_confirmed: z.boolean().default(true),
    copyright_note: text.optional(),
    note: text.optional(),
  })
  .superRefine((e, ctx) => {
    if (e.kind === 'website' && !e.url)
      ctx.addIssue({ code: 'custom', path: ['url'], message: 'A website entry needs its url.' });
    if (e.kind === 'manuscript' && (!e.repository || !e.catalogue_number))
      ctx.addIssue({
        code: 'custom',
        path: ['repository'],
        message: 'A manuscript entry needs repository and catalogue_number.',
      });
  });

export type Edition = z.infer<typeof editionSchema>;
