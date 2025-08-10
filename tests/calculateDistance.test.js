import test from 'node:test';
import assert from 'node:assert';
import { calculateDistance } from '../js/helpers.js';

test('calculateDistance returns 0 for identical locations', () => {
  const loc = { latitude: 0, longitude: 0 };
  assert.strictEqual(calculateDistance(loc, loc), 0);
});

test('calculateDistance approximates known distances', () => {
  const loc1 = { latitude: 0, longitude: 0 };
  const loc2 = { latitude: 0, longitude: 1 }; // ~111.2 km at equator
  const distance = calculateDistance(loc1, loc2);
  // allow small tolerance for floating point arithmetic
  assert.ok(Math.abs(distance - 111194.9) < 100);
});
