# BhairavYantra / भैरव यंत्र

A bilingual (हिंदी + English, Sanskrit in देवनागरी + IAST) library, encyclopedia and, later,
community on Bhairava, the Bhairavīs and the Daśa Mahāvidyās, presented as a yantra-form map.
Every statement carries its source and an evidence grade.

- Concept: [docs/00-concept.md](docs/00-concept.md)
- Research method and evidence grades: [docs/01-methodology-and-sources.md](docs/01-methodology-and-sources.md)
- Visual design and deity imagery: [docs/03-visual-design.md](docs/03-visual-design.md)
- Build order: [docs/02-roadmap.md](docs/02-roadmap.md)
- Research files: [research/](research/)
- Instructions for Claude Code: [CLAUDE.md](CLAUDE.md)

## Working on the site

Requires Node 22.23.4 or later (`.nvmrc`).

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Local site at http://localhost:4321 |
| `npm run check:content` | Schema and integrity check of `content/` (citations, grades, references, images) |
| `npm test` | Unit tests for the schemas, the citation lint and the integrity check |
| `npm run build` | Type check, content check and production build into `dist/` |
| `npm run build:fixtures` | Build every page template from the test fixtures into `dist-fixtures/` |
| `npm run check:links -- dist` | Internal link check of a build |
| `npm run check:a11y -- dist` | axe accessibility check (WCAG 2.1 AA), light + dark, desktop + phone |
| `npm run screenshots -- dist out/ / /devata/` | Screenshots for pull requests |

How to add content: [content/README.md](content/README.md).
