import test from 'node:test';
import assert from 'node:assert/strict';

import { parseEntries, serializeEntries } from '../src/lib/url-state.ts';

test('serializeEntries and parseEntries round-trip escaped keys and values', () => {
  const serialized = serializeEntries([
    ['yearly_revenue__openai__dollars', '2.5e9'],
    ['custom label', 'Payout per person: baseline, revised'],
  ]);

  assert.equal(
    serialized,
    'yearly_revenue__openai__dollars:2.5e9,custom%20label:Payout%20per%20person%3A%20baseline%2C%20revised',
  );

  assert.deepEqual(parseEntries(serialized), {
    yearly_revenue__openai__dollars: '2.5e9',
    'custom label': 'Payout per person: baseline, revised',
  });
});

test('parseEntries ignores malformed fragments instead of throwing', () => {
  assert.deepEqual(parseEntries('missing-separator,,good:value,:empty-key'), {
    good: 'value',
    '': 'empty-key',
  });
});

test('parseEntries returns an empty record for null or empty state', () => {
  assert.deepEqual(parseEntries(null), {});
  assert.deepEqual(parseEntries(''), {});
});
