import { it, expect, test } from 'vitest';
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

const stations2: Array<Station> = [
  Station(1, 10, 20, 'reserved'),
  Station(0, 100, 200, 'avaliable'),
  Station(2, 50, 100, 'charging-car'),
];

const stations3: Array<Station> = [
  Station(1, 10, 20, 'charging-car'),
  Station(0, 100, 200, 'avaliable'),
  Station(2, 50, 100, 'charging-car'),
];

it('can run tests', () => {
  expect(true).toBe(true);
});

it('returns a list', () => {
  const res = calcRecomendations(stations, car);
  expect(Array.isArray(res)).toBe(true);
});

test('if recommendations list always contains all Station set', () => {
  const res = calcRecomendations(stations, car);
  const compareFn = (a: Station, b: Station): number => {
    return b.id - a.id;
  };
  expect(res.toSorted(compareFn)).toEqual(stations.toSorted(compareFn));
});

test('if the recommended list is sorted from less crowded to the most one', () => {
  const res = calcRecomendations(stations2, car);
  expect(res[0]).toBe(stations2[1]);
  expect(res[1]).toBe(stations2[0]);
  expect(res[2]).toBe(stations2[2]);
});

it('returns recomendations by position', () => {
  const res = calcRecomendations(stations, car);

  expect(res[0]).toBe(stations[1]);
  expect(res[1]).toBe(stations[2]);
  expect(res[2]).toBe(stations[0]);
});

it('recomendations check reservations', () => {
  stations3[0]?.reservations.push(1);
  stations3[2]?.reservations.push(5);
  stations3[2]?.reservations.push(8);

  const res = calcRecomendations(stations3, car);

  expect(res[0]).toBe(stations3[1]);
  expect(res[1]).toBe(stations3[0]);
  expect(res[2]).toBe(stations3[2]);
});
