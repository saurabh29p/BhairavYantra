/**
 * Image record, concept §4.7A and §7A, docs/03-visual-design.md, content/images/README.md.
 *
 * "No record, no image": every image file needs one of these next to it. A candidate record
 * may say "not stated" where its source page says nothing; an approved or added image may not,
 * for its source, period, licence or attribution.
 */
import { z } from 'astro/zod';
import { grade, id, isoDate, text } from './common';

export const NOT_STATED = 'not stated';

export const IMAGE_STATUSES = ['candidate', 'approved', 'added'] as const;
export const OBJECT_TYPES = [
  'murti',
  'relief',
  'bronze',
  'painting',
  'manuscript',
  'book-plate',
  'photograph',
] as const;

/** Fields that must be real values (not "not stated") once an image is approved. */
const REQUIRED_WHEN_APPROVED = [
  'period',
  'licence',
  'licence_url',
  'attribution_text',
  'alt_en',
  'alt_hi',
] as const;

export const imageSchema = z
  .strictObject({
    /** File name in content/images/; filled in only after approval. */
    file: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpe?g|png|webp|avif|tiff?)$/, {
        error: 'File names are lowercase-hyphenated with an image extension, e.g. batuka-bhairava-kashi-01.jpg',
      })
      .optional(),
    status: z.enum(IMAGE_STATUSES),
    /** Devatā ids. */
    depicts: z.array(id).min(1, { error: 'Say which Devatā the image shows.' }),
    identified_by: z.enum(['source', 'ours']),
    identification_note: z.string().default(''),
    object_type: z.enum(OBJECT_TYPES),
    material: text,
    origin_place: text,
    period: text,
    period_grade: grade,
    current_location: text,
    /** Where applicable; may be empty. */
    accession_number: z.string().default(''),
    source_url: z.url({ error: 'source_url must be the link to the source page.' }),
    creator: text,
    retrieved_on: isoDate,
    licence: text,
    licence_url: z.union([z.url(), z.literal(NOT_STATED)]),
    attribution_text: text,
    in_worship: z.boolean(),
    inner_shrine: z.boolean(),
    temple_permission: z.enum(['yes', 'no', 'not-needed']),
    /** Required when the licence is a permission (stored in the repo). */
    permission_file: text.optional(),
    /** Exposure correction only, if any was made (docs/03-visual-design.md §5). */
    adjustments: text.optional(),
    alt_en: text,
    alt_hi: text,
  })
  .superRefine((img, ctx) => {
    const fail = (message: string, path: (string | number)[]) =>
      ctx.addIssue({ code: 'custom', message, path });

    if (img.identified_by === 'ours' && img.identification_note.trim() === '')
      fail('Our own identification needs identification_note with the reason (concept §7A).', [
        'identification_note',
      ]);

    if (/permission/i.test(img.licence) && !img.permission_file)
      fail('A permission licence needs permission_file (concept §4.7A).', ['permission_file']);

    if (img.inner_shrine && img.temple_permission !== 'yes')
      fail('An inner-shrine photograph needs temple_permission: yes (concept §7A).', [
        'temple_permission',
      ]);

    if (img.status === 'candidate') return;

    if (!img.file) fail(`An ${img.status} image needs its file name.`, ['file']);
    if (img.temple_permission === 'no')
      fail('The temple has not given permission; the image cannot be approved.', [
        'temple_permission',
      ]);
    for (const key of REQUIRED_WHEN_APPROVED) {
      if (img[key].trim().toLowerCase() === NOT_STATED)
        fail(`An ${img.status} image cannot have ${key}: "${NOT_STATED}".`, [key]);
    }
  });

export type ImageRecord = z.infer<typeof imageSchema>;
