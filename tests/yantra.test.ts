import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { parse } from 'yaml';
import { labelLines, slotHref, slotName } from '../src/lib/yantra';
import { yantraSchema } from '../src/schemas/yantra';

const real = () => parse(readFileSync('src/data/yantra.yaml', 'utf8'));
const issues = (data: unknown) => {
  const r = yantraSchema.safeParse(data);
  return r.success ? '' : r.error.issues.map((i) => i.message).join(' | ');
};

describe('yantra map data (concept §3)', () => {
  it('src/data/yantra.yaml is valid', () => assert.equal(issues(real()), ''));
  it('has 8 petals and 10 directions', () => {
    const y = yantraSchema.parse(real());
    assert.equal(y.slots.filter((s) => s.layer === 'astadala').length, 8);
    assert.equal(y.slots.filter((s) => s.layer === 'dasa-disa').length, 10);
  });
  it('a variant layer must name its variant with sources (concept §2.2)', () => {
    const y = real();
    delete y.layers.find((l: { id: string }) => l.id === 'dasa-disa').variant_note;
    assert.match(issues(y), /"dasa-disa" follows one variant/);
  });
  it('a variant note needs a citation', () => {
    const y = real();
    y.layers.find((l: { id: string }) => l.id === 'astadala').variant_note.sources = [];
    assert.match(issues(y), /at least one citation/);
  });
  it('rejects duplicate slots', () => {
    const y = real();
    y.slots.push({ ...y.slots[0] });
    assert.match(issues(y), /Duplicate slot/);
  });
  it('Devanāgarī labels must be Devanāgarī', () => {
    const y = real();
    y.slots[0].label_sa = 'Bhairava';
    assert.match(issues(y), /Devanāgarī/);
  });
  it('ready slots link to their page; others to their entry on /yantra/', () => {
    const y = yantraSchema.parse(real());
    const ready = y.slots.find((s) => s.status === 'ready')!;
    const prep = y.slots.find((s) => s.status === 'in-preparation')!;
    assert.equal(slotHref(ready), ready.href);
    assert.equal(slotHref(prep), `/yantra/#slot-${prep.slot}`);
    assert.match(slotName(prep, y.layers.find((l) => l.id === prep.layer)!), /in preparation/);
  });
  it('splits a parenthetical label onto two lines without changing it', () => {
    assert.deepEqual(labelLines('त्रिपुरसुन्दरी (षोडशी)'), ['त्रिपुरसुन्दरी', '(षोडशी)']);
    assert.deepEqual(labelLines('काली'), ['काली']);
  });
});
