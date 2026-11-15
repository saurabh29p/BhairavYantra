/**
 * Content collections. Files live in content/ at the repository root (CLAUDE.md), with the
 * schemas in src/schemas/. The same schemas are used by the standalone check
 * (npm run check:content), which also checks citations and references across collections.
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { COLLECTIONS as C, contentRoot } from './schemas';

const root = contentRoot();
const at = (def: { path: string; pattern: string }) => glob({ base: `${root}/${def.path}`, pattern: def.pattern });

export const collections = {
  devata: defineCollection({ loader: at(C.devata), schema: C.devata.schema }),
  grantha: defineCollection({ loader: at(C.grantha), schema: C.grantha.schema }),
  person: defineCollection({ loader: at(C.person), schema: C.person.schema }),
  place: defineCollection({ loader: at(C.place), schema: C.place.schema }),
  passage: defineCollection({ loader: at(C.passage), schema: C.passage.schema }),
  mantra: defineCollection({ loader: at(C.mantra), schema: C.mantra.schema }),
  claim: defineCollection({ loader: at(C.claim), schema: C.claim.schema }),
  image: defineCollection({ loader: at(C.image), schema: C.image.schema }),
  edition: defineCollection({ loader: file(`${root}/${C.edition.path}`), schema: C.edition.schema }),
};
