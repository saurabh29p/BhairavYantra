/** Devatā (deity or form), concept §4.1. */
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

/** Layers of the yantra-form map, concept §3 (ṣaṭkoṇa is optional there). */
export const YANTRA_LAYERS = [
  'bindu',
  'trikona',
  'satkona',
  'astadala',
  'dasa-disa',
  'vrtta',
  'bhupura',
] as const;

export const DEVATA_TYPES = [
  'bhairava-form',
  'bhairavi',
  'mahavidya',
  'matrka',
  'yogini',
  'other',
] as const;

/** A relation to another Devatā, always with its source. */
const relation = z.strictObject({
  devata: id,
  relation: text.optional(),
  source: citation,
});

/** One attribute (colour, vehicle, weapons…) as a variant table: every value cited. */
const attributeRow = z.strictObject({
  attribute: text,
  values: z
    .array(z.strictObject({ value: text, source: citation }))
    .min(1, { error: 'Each attribute needs at least one cited value.' }),
});

export const devataSchema = z.strictObject({
  name_sa: devanagari,
  name_iast: iast,
  spellings,
  type: z.enum(DEVATA_TYPES),
  yantra_position: z
    .strictObject({
      layer: z.enum(YANTRA_LAYERS),
      slot: text,
      /** The variant (list, order) this placement follows, concept §2.2. */
      variant: text,
      source: citation.optional(),
    })
    .optional(),
  summary_en: text,
  summary_hi: text,
  textual_sources: z
    .array(citation)
    .min(1, { error: 'A Devatā needs at least one textual source, even if grade D (concept §4.1).' }),
  name_variants: z.array(z.strictObject({ name: text, source: citation })).default([]),
  iconography: z
    .strictObject({
      /** Passage ids of dhyāna verses. */
      dhyana: z.array(id).default([]),
      attributes: z.array(attributeRow).default([]),
    })
    .optional(),
  consorts: z.array(relation).default([]),
  related: z.array(relation).default([]),
  /** Mantra ids. */
  mantras: z.array(id).default([]),
  yantras: z
    .array(z.strictObject({ label: text, source: citation, image: id.optional() }))
    .default([]),
  /** Place ids. */
  places: z.array(id).default([]),
  status: pageStatus,
  last_reviewed: isoDate,
  open_questions: openQuestions,
});

export type Devata = z.infer<typeof devataSchema>;
