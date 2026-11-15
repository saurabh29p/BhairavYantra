# 02 · Build roadmap / निर्माण क्रम

Each phase is one Claude Code request. Copy the prompt, paste it into Claude Code, review the
pull request, then move to the next. The phases follow the "rings" in `00-concept.md` §12.

---

## Phase 0 — Project skeleton / ढाँचा
**Prompt:**
> Read CLAUDE.md, docs/00-concept.md and docs/01-methodology-and-sources.md. Set up the Astro
> project (TypeScript strict, Content Collections, MDX), with Zod schemas for every content
> type in concept §4 and a build that fails on any claim without a citation and grade. Add
> the base layout, fonts (Devanāgarī + IAST), light/dark design tokens from CLAUDE.md, plain
> navigation, and CI (build, schema check, link check, accessibility). No religious content
> yet, only empty-state templates. Open a pull request with screenshots.

**Done when:** `npm run build` passes, CI is green, empty templates render on phone and desktop.

## Phase 1 — The yantra home and the four gates / यंत्र मुखपृष्ठ और चार द्वार
**Prompt:**
> Build the YantraMap component from src/data/yantra.yaml as described in concept §3 and the
> stack notes in CLAUDE.md. All slots visible; slots without content show "in preparation".
> Add the bhūpura pages: Search (Pagefind with spelling synonyms), Sources & Method (built from
> docs/01-methodology-and-sources.md), Glossary skeleton, About & Ethics, Claims register,
> Corrections. Stepped concentric layers on phone. Open a pull request with screenshots.

## Phase 2 — Core components / मुख्य घटक
**Prompt:**
> Build CitationBadge, GradeLegend, VariantTable, Passage, MantraBlock (with the fixed dīkṣā
> note in English and Hindi), TextStatusBadge, DraftBanner and BilingualBlock, each with a
> demo page using placeholder text only. Open a pull request.

## Phase 3 — Migrate the research (Bindu) / शोध-सामग्री का स्थानांतरण
**Prompt:**
> Migrate research/01-origin-of-bhairava-puranas.md into content collections (devata,
> grantha, passage, edition) without changing any wording, verse or grade. Wire it to the
> bindu of the yantra. List anything that did not fit the schema. Open a pull request.

## Phase 4 — Aṣṭa Bhairavas and Daśa Mahāvidyās
**Prompt:**
> Migrate research/02-ashta-bhairavas.md and research/09-dasha-mahavidyas.md the same way.
> Keep their draft status banners and ⚠ items; add every ⚠ item to the claims register.
> Wire them to the aṣṭadala and ten-direction slots. Open a pull request.

## Phase 5 — Deploy / प्रकाशन
**Prompt:**
> Add deployment to Cloudflare Pages with preview deploys for pull requests. Document the
> steps I need to do in my Cloudflare account in docs/03-deploy.md.

## Later phases (only after the library is live)
- Grantha registry, text reader and timeline (concept §5, §10.2–10.3).
- Accounts and study tools with Supabase (concept §10.9).
- Community (Sabhā) with Discourse, only once moderators are in place (concept §10).

New research files from the research thread go into `research/`, then ask Claude Code to
migrate them the same way as Phase 3.
