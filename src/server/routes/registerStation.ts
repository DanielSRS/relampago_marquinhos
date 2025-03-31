import type { Station, StationGroup, Response } from '../../main.types.ts';
import { curry } from '../../utils.ts';

export const registerStation = curry(
  (stations: StationGroup, newStation: Station) => {
    // Verificar se a estação ja existe ????

    stations[newStation.id] = newStation;

    return {
      message: 'Station registered',
      success: true,
      data: newStation,
    } satisfies Response<unknown>;
  },
);
