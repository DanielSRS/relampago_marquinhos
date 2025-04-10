import { filterStationsByDistanceRadius } from '../../location.ts';
import { calcRecomendations } from '../../main.ts';
import { curry } from '../../utils.ts';
import type { Car, StationGroup, RequestHandler } from '../../main.types.ts';

export const getSuggestions = curry(
  (
    MAX_RADIUS: number,
    STATIONS: StationGroup,
    data: Car,
  ): ReturnType<RequestHandler<'getSuggestions'>> => {
    const res = generateSuggestions(MAX_RADIUS, STATIONS, data);
    return {
      message: 'Lista de recomendações',
      success: true,
      data: res,
    };
  },
);

function generateSuggestions(
  maxRadius: number,
  stations: StationGroup,
  car: Car,
) {
  const stationList = Object.values(stations);
  // Verificar se o carro já recebeu alguma sugestão
  const stationWithSuggestion = stationList.find(station =>
    station.suggestions.includes(car.id),
  );

  // Remove sugestão se houver
  if (stationWithSuggestion) {
    const carIndex = stationWithSuggestion.suggestions.findIndex(
      id => id === car.id,
    );
    if (carIndex !== -1) {
      stationWithSuggestion.suggestions.splice(carIndex, 1);
    }
  }

  // Limita as recomendações a um determinado raio de distância do veículo
  const filteredStations = filterStationsByDistanceRadius(
    maxRadius,
    stationList,
    car,
  );

  // calcula recomendações
  const recommendations = calcRecomendations(filteredStations, car);

  // Registra sugestão feita
  recommendations[0]?.suggestions.push(car.id);
  return recommendations;
}
