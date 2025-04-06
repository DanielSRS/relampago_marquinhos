import type { Station, StationGroup, Response, ErrorResponse } from '../../main.types.ts';
import { curry } from '../../utils.ts';

export const registerStation = curry(
  (stations: StationGroup, newStation: Station) => {
    const exists = Object.values(stations).find(station => station.id === newStation.id);
    
    if (exists) {
      return {
        message: 'Try another id or check if the station is already registered on the server.',
        success: false,
        error: 'ERROR: This id already belongs to another station!',
      } satisfies ErrorResponse<unknown>;
    } else {
      stations[newStation.id] = newStation;
      return {
        message: 'The station has been successfully registered!',
        success: true,
        data: newStation,
      } satisfies Response<unknown>;
    }
  },
);
