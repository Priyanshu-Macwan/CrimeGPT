import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterCases } from './reporting.js';

test('AC5: date boundaries and unit selection', () => {
  const cases = [
    { id: 'a', date: '2026-10-01', precinct: '7B' },
    { id: 'b', date: '2026-10-05', precinct: '8A' },
    { id: 'c', date: '2026-10-31', precinct: '7B' },
  ];
  assert.deepEqual(filterCases(cases, '2026-10-01', '2026-10-31', '7B').map(c => c.id), ['a', 'c']);
  assert.deepEqual(filterCases(cases, '2026-10-06', '2026-10-01', 'All units'), []);
  assert.deepEqual(filterCases(cases, '', '', 'All units').map(c => c.id), ['a', 'b', 'c']);
});

test('AC5: generated inputs match a direct filter oracle', () => {
  let seed = 187;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
  for (let round = 0; round < 100; round++) {
    const cases = Array.from({ length: 40 }, (_, index) => ({
      id: String(index),
      date: '2026-10-' + String(1 + Math.floor(random() * 31)).padStart(2, '0'),
      precinct: random() < 0.5 ? '7B' : '8A',
    }));
    const from = '2026-10-' + String(1 + Math.floor(random() * 20)).padStart(2, '0');
    const to = '2026-10-' + String(20 + Math.floor(random() * 12)).padStart(2, '0');
    const unit = random() < 0.5 ? 'All units' : '7B';
    const expected = cases.filter(item => item.date >= from && item.date <= to && (unit === 'All units' || item.precinct === unit));
    assert.deepEqual(filterCases(cases, from, to, unit), expected);
  }
});
