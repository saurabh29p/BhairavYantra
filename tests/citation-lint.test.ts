import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lintMdx } from '../src/lib/citation-lint';

const ctx = {
  editions: new Set(['ed']),
  entries: { passage: new Set(['p1']), mantra: new Set(['m1']) },
};
const lint = (src: string) => lintMdx(src, ctx).map((i) => i.message);

describe('citation lint (CLAUDE.md rule 2)', () => {
  it('passes a cited paragraph', () => assert.deepEqual(lint('A claim <CitationBadge cite="ed" grade="B" />.'), []));
  it('fails an uncited paragraph', () => assert.match(lint('A claim with no source.')[0] ?? '', /Paragraph has no citation/));
  it('accepts A‑w written with a non-breaking hyphen', () =>
    assert.deepEqual(lint('Claim <CitationBadge cite="ed" grade="A‑w" />.'), []));
  it('fails an unknown citation key', () =>
    assert.match(lint('Claim <CitationBadge cite="nope" grade="B" />.').join(), /not in content\/bibliography.yaml/));
  it('fails an invalid grade', () => assert.match(lint('Claim <CitationBadge cite="ed" grade="E" />.').join(), /Grade "E"/));
  it('fails a badge without a grade', () => assert.match(lint('Claim <CitationBadge cite="ed" />.').join(), /needs both/));
  it('fails expression attributes it cannot check', () =>
    assert.match(lint('Claim <CitationBadge cite={k} grade="B" />.').join(), /plain strings/));
  it('exempts <Pending> placeholders', () => assert.deepEqual(lint('<Pending what="Hindi summary" />'), []));
  it('exempts text inside <Pending>', () => assert.deepEqual(lint('<Pending what="x">\n\nSome draft text.\n\n</Pending>'), []));
  it('exempts headings', () => assert.deepEqual(lint('## A heading'), []));
  it('accepts an embedded Passage as its own source', () => assert.deepEqual(lint('<Passage id="p1" />'), []));
  it('fails a Passage that does not exist', () => assert.match(lint('<Passage id="zz" />').join(), /does not match/));
  it('fails an uncited list item', () =>
    assert.match(lint('- cited <CitationBadge cite="ed" grade="C" />\n- not cited').join(), /List item has no citation/));
  it('fails an uncited table row', () =>
    assert.match(lint('| a | b |\n|---|---|\n| x | <CitationBadge cite="ed" grade="C" /> |\n| y | z |').join(), /Table row has no citation/));
  it('does not require a citation in the table header', () =>
    assert.deepEqual(lint('| a | b |\n|---|---|\n| x | <CitationBadge cite="ed" grade="C" /> |'), []));
  it('checks paragraphs inside wrapper components', () =>
    assert.match(lint('<BilingualBlock>\n\nUncited text.\n\n</BilingualBlock>').join(), /Paragraph has no citation/));
  it('rejects Markdown images (images need a record)', () =>
    assert.match(lint('![x](a.jpg) <CitationBadge cite="ed" grade="C" />').join(), /Image record/));
});
