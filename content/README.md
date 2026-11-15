# content/ — the library's data

Only material from the owner's research files goes here, migrated without changing its
wording (CLAUDE.md). Schemas: `src/schemas/`. The build fails if anything below breaks a rule;
run `npm run check:content` to see the problems.

| Folder / file | Collection | Format | One file per |
|---|---|---|---|
| `devata/` | Devatā (concept §4.1) | `.mdx`: YAML frontmatter + optional body | deity or form |
| `grantha/` | Grantha (§4.2, §5) | `.mdx` | text |
| `person/` | Sādhaka / Ācārya (§4.5) | `.mdx` | person (no living persons without consent) |
| `place/` | Place (§4.6) | `.mdx` | kṣetra or temple |
| `passage/` | Passage (§4.3) | `.yaml` | verse or prose unit |
| `mantra/` | Mantra (§4.4) | `.yaml` | mantra |
| `claim/` | Claims register (§4.7) | `.yaml` | claim |
| `images/` | Image records (§4.7A) | `.yaml` next to the image file | image |
| `bibliography.yaml` | Edition (§4.8) | one YAML list | — every citation key is an `id` here |

File names become ids and URLs: lowercase ASCII words joined by hyphens
(`kala-bhairava.mdx` → `/devata/kala-bhairava/`).

## Citations and grades
A citation is `{ key: <bibliography id>, location: "31.30", grade: A‑w }`. Grades are
A, A‑w, B, C, D, ⚠ (methodology §2); A‑w may be written with the ordinary or the
non-breaking hyphen. Write chapter and verse numbers in quotes so YAML keeps them exact.

The check also enforces the grade definitions: **A** must cite a printed edition, critical
edition or manuscript; **A‑w** must cite a website entry.

## MDX bodies
Every paragraph, list item and table row in a body needs a citation:

```mdx
The account appears in the Kūrma Purāṇa <CitationBadge cite="kurma-vedapath" loc="Utt. 31.30" grade="A-w" />.
```

(`cite`, not `key`: JSX reserves the name `key`.) Material that is missing is marked with a
visible placeholder instead of being filled in:

```mdx
<Pending what="Hindi summary, in the owner's words" />
```

Markdown images (`![]()`) are not allowed; images need a record in `images/`.
