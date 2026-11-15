# 03 · Visual design and deity imagery / दृश्य रूप-रचना और देव-चित्र

*Draft 1 · 2026-11-15. Read with `00-concept.md` §7A (image sourcing) and §8 (sacred design).
This guide covers how the site looks and how images of the deities are presented. Sourcing
and licence rules in §7A always come first: a beautiful image without a source record is not
used.*

---

## 1. The feeling we are designing for / भाव

The site should feel like **entering a temple at dusk**: quiet, dark, warm light falling on
the deity, nothing competing for attention. It is a **samarpaṇa (dedication)**, an offering
to Bhairava and the Devī, and at the same time a library you can trust. Every design choice
should serve both: reverence in how things look, honesty in what they say.

Three words to check every screen against: **श्रद्धा (reverence) · शान्ति (stillness) ·
सत्य (truth)**.

---

## 2. Darśana: how a deity is first seen / दर्शन

Darśana is seeing and being seen by the deity. Each deity page opens with a **darśana hero**
built on that idea.

- **Frontal and centred.** The main image is the deity facing the viewer, centred, at eye
  level. Prefer a frontal mūrti or painting; never a tilted, cropped "editorial" angle.
- **Dark field, warm light.** The image sits on the night background (`--bg-night`), with a
  soft radial glow behind it, like a dīpa lit in the garbhagṛha. No hard drop shadows.
- **The frame is a shrine, not a box.** A thin gold line frames the image as a toraṇa (arched
  gateway) or a single ring of the yantra. One frame style across the whole site, drawn as
  SVG, never a heavy ornamental border.
- **Name beneath, in Devanāgarī first.** Large Devanāgarī name, then IAST, then the Hindi and
  English epithets, all centred under the image.
- **Dhyāna beside or below.** Where the research files give a dhyāna verse for this form, it
  appears next to the image (Sanskrit, then translations), so the reader can compare the
  image with how the text describes the deity. If no verse is sourced, show nothing, never
  placeholder poetry.
- **Slow arrival.** On load, the light rises and the image fades in over about 1.2 s. Nothing
  moves after that. With `prefers-reduced-motion`, it simply appears.
- **The credit is always there.** A small, quiet credit line under the image (object, place,
  period, licence) and an "Image details / चित्र विवरण" link. Reverent does not mean
  uncredited.
- **Feet and crown intact.** Never crop through the deity's head, crown, feet or pedestal.
  If the frame does not fit, change the frame, not the image.

## 3. The gallery: forms through time / रूप-वीथिका

Below the darśana hero, each deity has a **gallery ordered by period**, oldest first, so a
reader walks through how the form was imagined across centuries and regions.

- Layout: a calm grid (2 columns on phone, 3–4 on desktop) with generous space; no masonry
  jumble, no carousels that move by themselves.
- Each tile: image, short bilingual caption (what, where, when), and the period as a small
  label.
- Filters: by period, region, medium (stone, bronze, painting, manuscript, book plate).
- Tap opens a **viewing room**: the image large on the dark field, full record beside it
  (source, location, accession number, licence, identification evidence), and zoom for
  detail (attributes, weapons, vāhana) since iconography lives in the details.
- Uncertain identifications are labelled in the caption, never hidden.

## 4. The yantra home and deity images / यंत्र मुखपृष्ठ

- The yantra stays **line and light**: gold lines on night blue-black. Deity images do not
  sit on the yantra itself, which would clutter it and fight the geometry.
- Hovering or focusing a slot shows a small round **medallion** of that deity's darśana image
  in the centre (the bindu area), with the name. On phone, the medallion appears when a
  layer is opened.
- Bhairava in the bindu: the home page's single hero image, chosen by the owner (see §9).

## 5. Colour, light and texture / वर्ण, प्रकाश और बनावट

| Token | Use | Note |
|---|---|---|
| `--bg-night` | Dark mode background | Deep blue-black, not pure black (#0B0E17 range) |
| `--bg-ash` | Light mode background | Warm ash/bhasma off-white, not stark white |
| `--ink` | Body text | High contrast on both backgrounds (WCAG AA minimum) |
| `--sindura` | The single accent: links, active slot, focus | Vermilion; used sparingly |
| `--gold` | Yantra lines, image frames, dividers only | Never for body text; never gradients that look "bling" |
| `--glow` | Radial light behind darśana images | Warm, low opacity |

- **Per-deity colour** is allowed only as a faint tint in the glow, and only when the colour
  comes from a cited dhyāna verse in the research files (e.g. a verse that describes the
  goddess as dark or golden). Otherwise every deity uses the same neutral glow.
- **Texture:** at most a very subtle paper or stone grain on backgrounds. No smoke, flames,
  skulls, blood-red splashes or "dark tantra" effects, even for ugra forms.
- **Images are never altered:** no filters, colour grading, sharpening "enhancement" or AI
  upscaling. Correct only exposure if needed, and note it in the record.

## 6. Typography / अक्षर

- Sanskrit and Hindi: Tiro Devanagari Sanskrit (preferred for verses) or Noto Serif
  Devanagari. Sanskrit verses large, with generous line height (≥ 1.8) so mātrās and
  conjuncts breathe.
- English and IAST: a book serif with complete IAST diacritics (ā ī ū ṛ ṝ ḷ ṅ ñ ṭ ḍ ṇ ś ṣ ṃ ḥ).
- Deity names on hero: Devanāgarī at display size; never all-caps for IAST.
- Sanskrit (source) vs Hindi (translation) must look different: small "सं." / "हि." labels
  and a slightly different weight, because both use Devanāgarī.

## 7. Ornament and motifs / अलंकरण

Allowed, sparingly and drawn as simple line SVG in gold: lotus petal dividers, the toraṇa
frame, yantra rings, a small bindu mark as a bullet or section end, a trident (triśūla) only
as a subtle Bhairava section mark. **Not allowed:** clip-art deities, "Om" stamped on
everything, glitter, animated diyas or bells, sounds, popup blessings.

## 8. Dedication page / समर्पण

A short **Samarpaṇa** page, linked from the footer of every page and from the bhūpura, in the
owner's own words: to whom the site is offered, and why. Optionally opened by a maṅgala
(invocation) verse, **chosen by the owner with its source**, shown like a darśana: centred,
on the dark field, in Devanāgarī with translations. Claude Code must not write this text;
it leaves a visible placeholder until the owner supplies it.

## 9. Accessibility and respect together / सुलभता

- Every image has bilingual alt text that names the deity and describes the form
  ("Kāla Bhairava, standing, four arms, with dog; stone, Karnataka, 12th c.").
- Darśana and gallery work fully by keyboard; the viewing room traps focus and closes with Esc.
- Images are lazy-loaded and served as AVIF/WebP at sensible sizes (astro:assets), so the
  site stays fast on Indian mobile data.
- No image is used as a background behind text.

## 10. Decisions for the owner / स्वामी के निर्णय

1. **Home page darśana of Bhairava:** which image (a specific temple mūrti, sculpture or
   painting you love). This sets the tone of the whole site.
2. **Dedication text and maṅgala verse:** your words, and the verse with its source.
3. **Your own images:** any temple photographs you have taken or can take (with the temple's
   permission), or paintings you own the rights to.
4. **Frame style:** toraṇa arch (warmer, temple-like) or yantra ring (cleaner, geometric).
5. **Mood references:** any sites, books, temples or artworks whose feeling you want the
   site to have.
