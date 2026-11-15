# Project brief: Bhairava encyclopedia (भैरव विश्वकोश)

## What this is
A bilingual (Hindi + English, with Sanskrit in Devanāgarī + IAST) platform on Bhairava, the
Bhairavīs and the Daśa Mahāvidyās: a verified library, interactive study tools, and (later)
a moderated community whose contributions reach the library only after source review. The home page is a yantra-form map:
bindu → trikoṇa → aṣṭadala → ten directions → vṛtta → bhūpura (four gates).
Full concept: docs/00-concept.md. Research rules: docs/01-methodology-and-sources.md.

## Non-negotiable content rules
1. Never write, invent, paraphrase into existence, or "fill in" religious content, names,
   verses, mantras, dates or citations. Content comes ONLY from files in content/ or
   research/ supplied by the owner. If something is missing, insert a visible
   placeholder: `<Pending>` with what is needed. Do not guess.
2. Every claim on a page must carry a citation key and an evidence grade
   (A, A-w, B, C, D, ⚠). The build must fail otherwise.
3. Sanskrit is copied verbatim. Never "correct" Sanskrit spelling or sandhi; flag it instead.
4. Never label a text "lost", "recovered" or "ancient" unless its registry entry has the
   matching status and evidence (see concept §5).
5. No AI-generated images of deities. No audio. No ads, trackers or shop features.
6. Real deity images (temple mūrtis, sculptures, manuscript paintings, old book plates)
   are wanted, but every image needs an Image record with source, place, period,
   current location, licence and attribution (concept §4.7A, §7A). Never add an image
   that has no such record, and never download images yourself without the owner
   approving the source and licence.

## Stack
- Astro (latest stable) + Content Collections + MDX, TypeScript strict.
- Zod schemas for: devata, grantha, passage, mantra, person, place, claim, edition, image.
  Required fields as in concept §4.
- Pagefind for search, with a synonyms file for spelling variants
  (Bhairav/Bhairava/भैरव/Bhairo …) and IAST→ASCII folding.
- Yantra: hand-built SVG generated from src/data/yantra.yaml
  (layer, slot, label_sa, label_iast, label_hi, label_en, href, status, variant_note).
  Each slot is a real <a> with an accessible name. Respect prefers-reduced-motion.
  On narrow screens, render as stepped concentric layers, not one dense diagram.
- Plain hierarchical nav + A–Z index on every page (the yantra is never the only route).
- Fonts: Tiro Devanagari Sanskrit or Noto Serif Devanagari for Sanskrit/Hindi; a Latin
  serif with full IAST diacritics. Self-host, subset.
- Deploy target: Cloudflare Pages (or Netlify). CI: build, schema check, link check, axe.
- Later phases (do not start until asked): Supabase for accounts, study tools and the
  contributions review queue (row-level security on every table); Discourse for the forum and
  per-page discussions, with SSO. Never build custom auth or a custom forum.
- Community content must render visually distinct from library content and must never be
  written into content/ automatically; only an editor merge does that.

## Components to build first (Ring 0)
- <YantraMap>, <CitationBadge key grade>, <GradeLegend>, <VariantTable>,
  <Passage sa iast en hi translator location grade>, <MantraBlock> (with fixed dīkṣā
  note EN+HI, source line, attribution_check), <TextStatusBadge>, <DraftBanner>,
  <BilingualBlock> (parallel EN/HI, language toggle sets order not visibility).
- Pages: Home (yantra), Sources & Method, Glossary, About & Ethics, Claims register,
  Corrections, A–Z index, and empty-state templates for every content type.

## Design tokens
Night blue-black background in dark mode, ash-grey neutrals, one vermilion accent,
gold for yantra lines only. Light and dark modes designed separately. Generous line
height for Devanāgarī. No horror/sensational imagery.

## Working style
- Small PRs, one component or page type at a time, with screenshots (desktop + phone,
  light + dark).
- Migrate existing research Markdown into content collections without changing wording;
  only restructure into the schema. List any content that did not fit the schema.

## Where things are
- `docs/00-concept.md` — the full concept (yantra map, content model, text-status framework,
  copyright, mantra ethics, community design, tech, risks). Read §3, §4, §5, §10, §11 before
  building anything.
- `docs/01-methodology-and-sources.md` — evidence grades (A, A-w, B, C, D, ⚠) and rules.
  These are the law for all content.
- `docs/02-roadmap.md` — the build order, phase by phase. Work on one phase at a time and
  only when the owner asks.
- `research/` — the owner's research files. This is the ONLY source of religious content.
  Migrate it into content collections without changing wording. Never edit these files.

## Decisions still open (ask the owner; do not assume)
Mantra display style, site name/domain, licence for the site's text, Sabhā placement,
moderators. Defaults until decided: mantras shown open with the dīkṣā note; working name
"BhairavYantra"; no licence footer yet; community not built.

## Before you finish any task
- Run the build and the schema check; both must pass.
- Check the page on a phone-width viewport and in dark mode.
- List anything from research/ that did not fit the schema instead of dropping it.
