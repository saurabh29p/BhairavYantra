/**
 * The content collections and where their files live. Shared by src/content.config.ts (the
 * Astro build) and src/lib/content-check.ts (the standalone schema and integrity check), so
 * both validate exactly the same rules.
 */
import type { z } from 'astro/zod';
import { claimSchema } from './claim';
import { correctionSchema } from './correction';
import { devataSchema } from './devata';
import { editionSchema } from './edition';
import { glossarySchema } from './glossary';
import { granthaSchema } from './grantha';
import { imageSchema } from './image';
import { mantraSchema } from './mantra';
import { passageSchema } from './passage';
import { personSchema } from './person';
import { placeSchema } from './place';

export interface CollectionDef {
  /** Folder under the content root, or the single file for `file` collections. */
  path: string;
  /** Glob pattern within the folder (glob collections only). */
  pattern?: string;
  /** Whether entries may have an MDX body (checked by the citation lint). */
  body: boolean;
  /** Single YAML file holding a list of entries with `id` fields. */
  single?: boolean;
  schema: z.ZodType;
}

export const COLLECTIONS = {
  devata: { path: 'devata', pattern: '*.{md,mdx}', body: true, schema: devataSchema },
  grantha: { path: 'grantha', pattern: '*.{md,mdx}', body: true, schema: granthaSchema },
  person: { path: 'person', pattern: '*.{md,mdx}', body: true, schema: personSchema },
  place: { path: 'place', pattern: '*.{md,mdx}', body: true, schema: placeSchema },
  passage: { path: 'passage', pattern: '*.{yaml,yml}', body: false, schema: passageSchema },
  mantra: { path: 'mantra', pattern: '*.{yaml,yml}', body: false, schema: mantraSchema },
  claim: { path: 'claim', pattern: '*.{yaml,yml}', body: false, schema: claimSchema },
  image: { path: 'images', pattern: '*.{yaml,yml}', body: false, schema: imageSchema },
  glossary: { path: 'glossary', pattern: '*.{yaml,yml}', body: false, schema: glossarySchema },
  correction: { path: 'correction', pattern: '*.{yaml,yml}', body: false, schema: correctionSchema },
  edition: { path: 'bibliography.yaml', body: false, single: true, schema: editionSchema },
} as const satisfies Record<string, CollectionDef>;

export type CollectionName = keyof typeof COLLECTIONS;

/** Content root, relative to the project. Tests and fixture builds point it elsewhere. */
export function contentRoot(): string {
  return process.env.BY_CONTENT_ROOT ?? 'content';
}

/** The yantra-form map data. Fixture builds point it at tests/fixtures/yantra.yaml. */
export function yantraFile(): string {
  return process.env.BY_YANTRA_FILE ?? 'src/data/yantra.yaml';
}
