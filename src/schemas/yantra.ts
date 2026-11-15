/**
 * Schema for src/data/yantra.yaml: the yantra-form map on the home page (concept §3,
 * CLAUDE.md "Yantra"). The map is a navigational design, not the ritual yantra of any text
 * (concept §2.1), and it never carries a claim its source does not (§2.2): where a layer
 * follows one variant of a list, the layer's variant_note names it, with citations.
 */
import { z } from 'astro/zod';
import { citation, devanagari, iast, text } from './common';
import { YANTRA_LAYERS } from './devata';

export type YantraLayerId = (typeof YANTRA_LAYERS)[number];

/** How many slots each layer must have. The optional ṣaṭkoṇa ring is left out for now (concept §13.9). */
export const SLOT_COUNTS: Partial<Record<YantraLayerId, number>> = {
  bindu: 1,
  trikona: 3,
  astadala: 8,
  'dasa-disa': 10,
  bhupura: 4,
};

/** Layers whose slots follow one variant of a disputed list; they must say which (concept §2.2). */
export const VARIANT_LAYERS: YantraLayerId[] = ['astadala', 'dasa-disa'];

const variantNote = z.strictObject({
  en: text,
  /** null = Hindi wording still needed (rendered as <Pending>). */
  hi: text.nullable(),
  sources: z.array(citation).min(1, { error: 'A variant note needs at least one citation.' }),
});

const layer = z.strictObject({
  id: z.enum(YANTRA_LAYERS),
  label_sa: devanagari,
  label_iast: iast.optional(),
  label_en: text,
  /** What this layer holds, from concept §3. */
  holds_en: text,
  holds_hi: text.nullable(),
  variant_note: variantNote.optional(),
});

const slot = z.strictObject({
  /** Unique id, also the anchor on /yantra/. */
  slot: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  layer: z.enum(YANTRA_LAYERS),
  /** Only where a research file or the docs give the Devanāgarī form. */
  label_sa: devanagari.optional(),
  label_iast: iast.optional(),
  /** null = Hindi wording still needed. */
  label_hi: text.nullable(),
  label_en: text,
  /** Where the slot leads once its page exists. */
  href: z.string().regex(/^\/(?:[a-z0-9-]+\/)*(?:#[a-z0-9-]+)?$/, {
    error: 'href is a site path ending in "/", e.g. /devata/ or /devata/kala-bhairava/',
  }),
  /** ready: links to href. in-preparation: shown, linking to its entry on /yantra/. */
  status: z.enum(['ready', 'in-preparation']),
  variant_note: variantNote.optional(),
});

export const yantraSchema = z
  .strictObject({
    layers: z.array(layer),
    slots: z.array(slot),
  })
  .superRefine((y, ctx) => {
    const layerIds = y.layers.map((l) => l.id);
    if (new Set(layerIds).size !== layerIds.length)
      ctx.addIssue({ code: 'custom', path: ['layers'], message: 'Each layer may appear only once.' });
    const seen = new Set<string>();
    y.slots.forEach((s, i) => {
      if (seen.has(s.slot))
        ctx.addIssue({ code: 'custom', path: ['slots', i, 'slot'], message: `Duplicate slot "${s.slot}".` });
      seen.add(s.slot);
      if (!layerIds.includes(s.layer))
        ctx.addIssue({ code: 'custom', path: ['slots', i, 'layer'], message: `Layer "${s.layer}" is not in layers.` });
    });
    for (const l of y.layers) {
      const count = y.slots.filter((s) => s.layer === l.id).length;
      const want = SLOT_COUNTS[l.id];
      if (want !== undefined && count !== want)
        ctx.addIssue({
          code: 'custom',
          path: ['slots'],
          message: `Layer "${l.id}" needs ${want} slots, found ${count}.`,
        });
      if (want === undefined && count === 0)
        ctx.addIssue({ code: 'custom', path: ['slots'], message: `Layer "${l.id}" has no slots.` });
      if (VARIANT_LAYERS.includes(l.id) && !l.variant_note)
        ctx.addIssue({
          code: 'custom',
          path: ['layers'],
          message: `Layer "${l.id}" follows one variant of a list; it needs a variant_note with sources (concept §2.2).`,
        });
    }
  });

export type Yantra = z.infer<typeof yantraSchema>;
export type YantraSlot = Yantra['slots'][number];
export type YantraLayer = Yantra['layers'][number];
