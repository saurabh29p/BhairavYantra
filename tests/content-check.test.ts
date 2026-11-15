/** Cross-collection integrity: run the full check on a copy of the fixtures with one fault each. */
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { checkContent } from '../src/lib/content-check';

const FIXTURES = path.resolve(import.meta.dirname, 'fixtures/content');
const dirs: string[] = [];
after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

function withFault(apply: (root: string) => void): string[] {
  const root = mkdtempSync(path.join(tmpdir(), 'by-content-'));
  dirs.push(root);
  cpSync(FIXTURES, root, { recursive: true });
  apply(root);
  return checkContent(root).issues.map((i) => `${path.basename(i.file)}: ${i.message}`);
}
const edit = (root: string, file: string, from: string | RegExp, to: string) => {
  const p = path.join(root, file);
  const src = readFileSync(p, 'utf8');
  const next = src.replace(from, to);
  assert.notEqual(next, src, `fixture edit did not apply to ${file}`);
  writeFileSync(p, next);
};

describe('content check', () => {
  it('passes the fixtures as they are', () => assert.deepEqual(checkContent(FIXTURES).issues, []));
  it('passes the real content folder', () => assert.deepEqual(checkContent('content').issues, []));

  it('fails a citation key that is not in the bibliography', () => {
    const issues = withFault((r) => edit(r, 'devata/fixture-devata-two.mdx', 'key: fixture-field', 'key: no-such-edition'));
    assert.match(issues.join('\n'), /citation key "no-such-edition" is not in the bibliography/);
  });
  it('fails grade A on a website (methodology §2)', () => {
    const issues = withFault((r) => edit(r, 'devata/fixture-devata-two.mdx', '{ key: fixture-field, grade: D }', '{ key: fixture-site, grade: A }'));
    assert.match(issues.join('\n'), /grade A needs a named printed or critical edition/);
  });
  it('fails grade A‑w on a printed edition', () => {
    const issues = withFault((r) => edit(r, 'devata/fixture-devata-two.mdx', '{ key: fixture-field, grade: D }', '{ key: fixture-print, grade: A‑w }'));
    assert.match(issues.join('\n'), /grade A‑w is for a text read online/);
  });
  it('fails a reference to a missing entry', () => {
    const issues = withFault((r) => edit(r, 'devata/fixture-devata.mdx', 'mantras: [fixture-mantra]', 'mantras: [missing-mantra]'));
    assert.match(issues.join('\n'), /no mantra entry "missing-mantra"/);
  });
  it('fails an uncited paragraph in a library body, with its line number', () => {
    const issues = withFault((r) => {
      const p = path.join(r, 'devata/fixture-devata-two.mdx');
      writeFileSync(p, `${readFileSync(p, 'utf8')}\nAn uncited statement.\n`);
    });
    assert.match(issues.join('\n'), /fixture-devata-two\.mdx: Paragraph has no citation/);
  });
  it('fails an image file with no record', () => {
    const issues = withFault((r) => writeFileSync(path.join(r, 'images/stray.jpg'), ''));
    assert.match(issues.join('\n'), /stray\.jpg: Image file has no record/);
  });
  it('fails an added image whose file is missing', () => {
    const issues = withFault((r) => rmSync(path.join(r, 'images/fixture-image.png')));
    assert.match(issues.join('\n'), /status "added" but fixture-image\.png/);
  });
  it('fails an image record without a licence', () => {
    const issues = withFault((r) => edit(r, 'images/fixture-image.yaml', /^licence: .*\n/m, ''));
    assert.match(issues.join('\n'), /fixture-image\.yaml: licence/);
  });
  it('fails a file name that is not a slug', () => {
    const issues = withFault((r) => cpSync(path.join(r, 'devata/fixture-devata-two.mdx'), path.join(r, 'devata/Bad Name.mdx')));
    assert.match(issues.join('\n'), /lowercase ASCII words/);
  });
  it('fails a duplicate bibliography id', () => {
    const issues = withFault((r) => {
      const p = path.join(r, 'bibliography.yaml');
      writeFileSync(p, `${readFileSync(p, 'utf8')}- id: fixture-site\n  kind: website\n  title: Duplicate\n  url: https://example.org/\n`);
    });
    assert.match(issues.join('\n'), /duplicate id "fixture-site"/);
  });
});
