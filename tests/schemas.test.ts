/** Each content rule must reject bad input. Run: npm test */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { claimSchema } from '../src/schemas/claim';
import { citation } from '../src/schemas/common';
import { devataSchema } from '../src/schemas/devata';
import { granthaSchema } from '../src/schemas/grantha';
import { imageSchema } from '../src/schemas/image';
import { mantraSchema } from '../src/schemas/mantra';
import { passageSchema } from '../src/schemas/passage';
import { personSchema } from '../src/schemas/person';
import { placeSchema } from '../src/schemas/place';

const cite = { key: 'fixture-print', location: '1.1', grade: 'A' };
const messages = (r: { success: boolean; error?: { issues: { message: string }[] } }) =>
  (r.error?.issues ?? []).map((i) => i.message).join(' | ');
const rejects = (r: { success: boolean; error?: { issues: { message: string }[] } }, pattern?: RegExp) => {
  assert.equal(r.success, false, 'expected the schema to reject this');
  if (pattern) assert.match(messages(r), pattern);
};

describe('citation', () => {
  it('requires a grade', () => rejects(citation.safeParse({ key: 'x' })));
  it('rejects an unknown grade', () => rejects(citation.safeParse({ key: 'x', grade: 'E' }), /Evidence grade/));
  it('requires a key', () => rejects(citation.safeParse({ grade: 'A' })));
  it('reads A‑w with a non-breaking hyphen (as the research files write it) as A-w', () => {
    const r = citation.safeParse({ key: 'x', grade: 'A‑w' });
    assert.equal(r.success, true);
    assert.equal(r.data?.grade, 'A-w');
  });
  it('accepts ⚠ with an emoji variation selector', () =>
    assert.equal(citation.safeParse({ key: 'x', grade: '⚠️' }).data?.grade, '⚠'));
  it('rejects unknown fields', () => rejects(citation.safeParse({ ...cite, page: 3 })));
  it('rejects a numeric location (YAML would turn 31.30 into 31.3)', () =>
    rejects(citation.safeParse({ ...cite, location: 31.3 }), /quoted/));
});

const devata = {
  name_sa: 'परीक्षण',
  name_iast: 'parīkṣaṇa',
  type: 'other',
  summary_en: 'x',
  summary_hi: 'x',
  textual_sources: [cite],
  status: 'draft',
  last_reviewed: '2026-11-15',
};
describe('devata', () => {
  it('accepts a minimal entry', () => assert.equal(devataSchema.safeParse(devata).success, true));
  it('requires at least one textual source', () =>
    rejects(devataSchema.safeParse({ ...devata, textual_sources: [] }), /textual source/));
  it('requires the name in Devanāgarī', () =>
    rejects(devataSchema.safeParse({ ...devata, name_sa: 'pariksana' }), /Devanāgarī/));
  it('requires IAST in Latin script', () =>
    rejects(devataSchema.safeParse({ ...devata, name_iast: 'परीक्षण' }), /Latin/));
  it('requires a citation for every attribute value', () =>
    rejects(
      devataSchema.safeParse({
        ...devata,
        iconography: { attributes: [{ attribute: 'colour', values: [{ value: 'x' }] }] },
      }),
    ));
  it('accepts an unquoted YAML date (parsed as a Date)', () =>
    assert.equal(devataSchema.safeParse({ ...devata, last_reviewed: new Date('2026-11-15') }).data?.last_reviewed, '2026-11-15'));
});

const grantha = {
  name_sa: 'परीक्षण',
  name_iast: 'parīkṣaṇa',
  genre: 'modern',
  status_evidence: [cite],
  status: 'draft',
  last_reviewed: '2026-11-15',
};
describe('grantha text status (concept §5)', () => {
  it('"extant" needs an edition or manuscript', () =>
    rejects(granthaSchema.safeParse({ ...grantha, text_status: 'extant', extant_form: 'printed-vulgate' }), /Extant/));
  it('"extant" passes with an edition', () =>
    assert.equal(
      granthaSchema.safeParse({ ...grantha, text_status: 'extant', extant_form: 'printed-vulgate', editions: ['e'] }).success,
      true,
    ));
  it('"lost-name-only" needs the source of the name', () =>
    rejects(granthaSchema.safeParse({ ...grantha, text_status: 'lost-name-only' }), /known by name only/));
  it('a text with a manuscript is not "lost"', () =>
    rejects(
      granthaSchema.safeParse({
        ...grantha,
        text_status: 'lost-quoted',
        quoted_in: [{ grantha: 'g', location: '1.1', passage: 'p', source: cite }],
        manuscripts: [{ repository: 'R', catalogue_number: '1' }],
      }),
      /not "lost"/,
    ));
  it('"lost-quoted" needs the quoted passage', () =>
    rejects(
      granthaSchema.safeParse({
        ...grantha,
        text_status: 'lost-quoted',
        quoted_in: [{ grantha: 'g', location: '1.1', source: cite }],
      }),
      /quotation/,
    ));
  it('"claimed-recovered" needs the claim', () =>
    rejects(granthaSchema.safeParse({ ...grantha, text_status: 'claimed-recovered' }), /claim/));
  it('a recovery record needs all four checklist parts', () =>
    rejects(
      granthaSchema.safeParse({
        ...grantha,
        text_status: 'extant',
        extant_form: 'manuscript-only',
        manuscripts: [{ repository: 'R', catalogue_number: '1' }],
        recovery: { previous_status: 'lost-quoted', manuscript: { repository: 'R', catalogue_number: '1' } },
      }),
    ));
  it('a recovery record cannot leave the text "lost"', () =>
    rejects(
      granthaSchema.safeParse({
        ...grantha,
        text_status: 'claimed-recovered',
        claim: { statement: 's', claimant: 'c', source: cite },
        recovery: {
          previous_status: 'lost-quoted',
          manuscript: { repository: 'R', catalogue_number: '1' },
          description: { script: 's', date: 'd', extent: 'e' },
          edition_or_description: cite,
          identification: { reason: 'r', source: cite },
        },
      }),
      /extant or fragmentary/,
    ));
});

describe('passage', () => {
  const passage = {
    text_sa: 'परीक्षण',
    location: { grantha: 'g', edition: 'e', chapter: '31', verse: '30' },
    grade: 'A',
  };
  it('accepts a minimal passage', () => assert.equal(passageSchema.safeParse(passage).success, true));
  it('keeps Sanskrit exactly as written (no trimming or normalising)', () => {
    const text = ' परीक्षण \n पाठ ';
    assert.equal(passageSchema.safeParse({ ...passage, text_sa: text }).data?.text_sa, text);
  });
  it('rejects numeric verse numbers', () =>
    rejects(passageSchema.safeParse({ ...passage, location: { ...passage.location, verse: 30 } }), /quoted/));
  it('a named translator needs a licence', () =>
    rejects(passageSchema.safeParse({ ...passage, translation_en: { text: 't', translator: 'A. Person' } }), /licence/));
  it('"ours" needs no licence', () =>
    assert.equal(passageSchema.safeParse({ ...passage, translation_en: { text: 't', translator: 'ours' } }).success, true));
});

describe('mantra (concept §4.4)', () => {
  const mantra = {
    text_sa: 'परीक्षण',
    source_text: { grantha: 'g', location: '1.1' },
    where_we_read_it: 'https://example.org/',
    grade: 'B',
    attribution_check: { result: 'no-claim' },
  };
  it('accepts a minimal mantra', () => assert.equal(mantraSchema.safeParse(mantra).success, true));
  it('has no benefits field', () => rejects(mantraSchema.safeParse({ ...mantra, benefits: 'x' }), /no benefits/));
  it('requires where we read it', () => {
    const { where_we_read_it: _, ...rest } = mantra;
    rejects(mantraSchema.safeParse(rest));
  });
  it('"not-found" in the claimed source must be graded D or ⚠', () =>
    rejects(
      mantraSchema.safeParse({
        ...mantra,
        attribution_check: { result: 'not-found', claimed_source: 'X', checked_edition: 'e' },
      }),
      /D or ⚠/,
    ));
});

describe('person (concept §8.3)', () => {
  const person = {
    name_iast: 'x',
    historicity: 'historical',
    historical_sources: [cite],
    living: false,
    summary_en: 'x',
    summary_hi: 'x',
    status: 'draft',
    last_reviewed: '2026-11-15',
  };
  it('accepts a historical person', () => assert.equal(personSchema.safeParse(person).success, true));
  it('excludes living persons without written consent', () =>
    rejects(personSchema.safeParse({ ...person, living: true }), /Living persons/));
  it('"mixed" needs both historical and traditional sources', () =>
    rejects(personSchema.safeParse({ ...person, historicity: 'mixed' }), /traditional_sources/));
});

describe('place (concept §4.6)', () => {
  const place = {
    name_iast: 'x',
    location: { locality: 'x', country: 'x' },
    textual_mentions: [cite],
    summary_en: 'x',
    summary_hi: 'x',
    status: 'draft',
    last_reviewed: '2026-11-15',
  };
  it('accepts a place', () => assert.equal(placeSchema.safeParse(place).success, true));
  it('temple lore must be grade D or ⚠', () =>
    rejects(placeSchema.safeParse({ ...place, temple_lore: [{ statement_en: 's', source: cite }] }), /grade D/));
  it('grade D material is not a textual mention', () =>
    rejects(placeSchema.safeParse({ ...place, textual_mentions: [{ ...cite, grade: 'D' }] }), /temple_lore/));
});

describe('claim (concept §4.7)', () => {
  const claim = {
    statement_en: 's',
    who_claims_it: [{ name: 'n', kind: 'site', url: 'https://example.org/' }],
    status: 'unverified',
    opened_on: '2026-11-15',
  };
  it('accepts a claim', () => assert.equal(claimSchema.safeParse(claim).success, true));
  it('"refuted" needs evidence against', () => rejects(claimSchema.safeParse({ ...claim, status: 'refuted' }), /evidence_against/));
  it('says where the claim is made', () =>
    rejects(claimSchema.safeParse({ ...claim, who_claims_it: [{ name: 'n', kind: 'book' }] }), /where the claim is made/));
});

describe('image (concept §4.7A)', () => {
  const image = {
    file: 'x-01.jpg',
    status: 'added',
    depicts: ['d'],
    identified_by: 'source',
    object_type: 'relief',
    material: 'stone',
    origin_place: 'p',
    period: '12th c.',
    period_grade: 'C',
    current_location: 'm',
    source_url: 'https://example.org/object',
    creator: 'c',
    retrieved_on: '2026-11-15',
    licence: 'CC0',
    licence_url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    attribution_text: 'a',
    in_worship: false,
    inner_shrine: false,
    temple_permission: 'not-needed',
    alt_en: 'a',
    alt_hi: 'अ',
  };
  const without = (k: keyof typeof image) => {
    const copy: Record<string, unknown> = { ...image };
    delete copy[k];
    return copy;
  };
  it('accepts a complete record', () => assert.equal(imageSchema.safeParse(image).success, true));
  for (const k of ['source_url', 'period', 'licence', 'licence_url', 'attribution_text', 'alt_en', 'alt_hi'] as const)
    it(`fails without ${k}`, () => rejects(imageSchema.safeParse(without(k))));
  for (const k of ['period', 'licence', 'attribution_text'] as const)
    it(`an added image cannot have ${k}: "not stated"`, () =>
      rejects(imageSchema.safeParse({ ...image, [k]: 'not stated' }), /not stated/));
  it('an empty licence fails', () => rejects(imageSchema.safeParse({ ...image, licence: '' })));
  it('a candidate may say "not stated"', () =>
    assert.equal(
      imageSchema.safeParse({ ...without('file'), status: 'candidate', licence: 'not stated', licence_url: 'not stated', period: 'not stated' }).success,
      true,
    ));
  it('an approved image needs a file name', () =>
    rejects(imageSchema.safeParse({ ...without('file'), status: 'approved' }), /file name/));
  it('a permission licence needs the permission file', () =>
    rejects(imageSchema.safeParse({ ...image, licence: 'Written permission' }), /permission_file/));
  it('an inner-shrine photograph needs temple permission', () =>
    rejects(imageSchema.safeParse({ ...image, inner_shrine: true }), /inner-shrine/));
  it('our own identification needs a reason', () =>
    rejects(imageSchema.safeParse({ ...image, identified_by: 'ours' }), /identification_note/));
});
