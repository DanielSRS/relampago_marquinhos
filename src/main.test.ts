import { it, expect } from 'vitest';
import { calcRecomendations } from './main.ts';
import { Car, Station } from './main.types.ts';

const car: Car = Car(0, 5, 4);

/**
 * Estações de recarga
 */
const stations: Array<Station> = [
  Station(0, 100, 200, 'avaliable'),
  Station(1, 10, 20, 'avaliable'),
  Station(2, 50, 100, 'avaliable'),
];

it('can run tests', () => {
  expect(true).toBe(true);
});

it('returns a list', () => {
  const res = calcRecomendations(stations, car);
  expect(Array.isArray(res)).toBe(true);
});

it('returns recomendations by position', () => {
  const res = calcRecomendations(stations, car);

  expect(res[0]).toBe(stations[1]);
  expect(res[1]).toBe(stations[2]);
  expect(res[2]).toBe(stations[0]);
});
