import { it, expect } from 'vitest';
import type { Car } from './main.types.ts';

const car: Car = {
  id: 0,
};

it('can run tests', () => {
  expect(true).toBe(true);
});

it('returns a list', () => {
  const res = calcRecomendations(car);
  expect(Array.isArray(res)).toBe(true);
});
