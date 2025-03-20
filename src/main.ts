import { calculateDistance } from './location.ts';
import { curry } from './utils.ts';
import type { Car, Station } from './main.types.ts';

/**
 * Calcula a recomendação de postos de recarga para um determinado carro
 * dado o conjunto de pontos de recarga e um carro
 */
export const calcRecomendations = curry(
  (stations: Station[], car: Car): Station[] => {
    return stations.toSorted((a, b) => {
      const distanceAC = calculateDistance(car.location, a.location);
      const distanceBC = calculateDistance(car.location, b.location);

      return distanceAC - distanceBC; // Subtração para obter um valor numérico
    });
  },
);
