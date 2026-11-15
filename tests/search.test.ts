import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { expandQuery, fold } from '../src/lib/search';

const groups = [['Bhairava', 'Bhairav', 'bhairav', 'भैरव', 'Bhairo'], ['Kālī', 'काली']];

describe('search query expansion (concept §9)', () => {
  it('folds IAST to plain letters', () => assert.equal(fold('Śiva Kālī'), 'siva kali'));
  it('leaves Devanāgarī as it is', () => assert.equal(fold('भैरव'), 'भैरव'));
  it('Bhairo finds Bhairava and भैरव', () => {
    const v = expandQuery('Bhairo', groups);
    assert.ok(v.includes('Bhairava') && v.includes('भैरव'));
  });
  it('भैरव finds Bhairava', () => assert.ok(expandQuery('भैरव', groups).includes('Bhairava')));
  it('Shiva also searches siva', () => assert.ok(expandQuery('Shiva', groups).includes('siva')));
  it('Chanda also searches canda', () => assert.ok(expandQuery('Chanda', groups).includes('canda')));
  it('expands one word of a longer query', () =>
    assert.ok(expandQuery('kali temple', groups).includes('काली temple')));
  it('ignores empty queries', () => assert.deepEqual(expandQuery('  ', groups), []));
  it('caps the number of searches', () => assert.ok(expandQuery('Bhairo Bhairav', groups).length <= 12));
});
