import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { prepareDocHtml } from '../src/lib/doc-html';

describe('preparing a docs/ file for a page', () => {
  it('adds a stable id to the matching heading', () =>
    assert.match(
      prepareDocHtml('<h2 id="2-evidence-grades">2. Evidence grades / प्रमाण-श्रेणियाँ</h2>', { anchors: [{ match: /Evidence grades/, id: 'grades' }] }),
      /^<h2 id="grades">2\. Evidence grades/,
    ));
  it('unlinks relative .md links but keeps their words', () =>
    assert.equal(prepareDocHtml('<p>See <a href="bibliography.md">bibliography.md</a> (to be created).</p>'), '<p>See bibliography.md (to be created).</p>'));
  it('keeps external links', () => {
    const html = '<p><a href="https://vedapath.app/">vedapath.app</a></p>';
    assert.equal(prepareDocHtml(html), html);
  });
  it('marks mostly-Devanāgarī paragraphs as Hindi', () =>
    assert.equal(prepareDocHtml('<p><strong>HI:</strong> यह फ़ोल्डर एक शोध-आधार है।</p>'), '<p lang="hi"><strong>HI:</strong> यह फ़ोल्डर एक शोध-आधार है।</p>'));
  it('leaves English paragraphs alone', () => assert.equal(prepareDocHtml('<p>Evidence grades.</p>'), '<p>Evidence grades.</p>'));
  it('never changes the text', () => {
    const html = '<p>मूल ग्रंथ, किसी नामित मुद्रित/समीक्षित संस्करण में</p><td>A‑w</td>';
    assert.equal(prepareDocHtml(html).replace(/<[^>]+>/g, ''), html.replace(/<[^>]+>/g, ''));
  });
});
