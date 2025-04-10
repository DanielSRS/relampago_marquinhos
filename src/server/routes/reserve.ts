import type {
  UserGroup,
  RequestHandler,
  StationGroup,
} from '../../main.types.ts';
import { curry } from '../../utils.ts';

export const reserve = curry(
  (
    stations: StationGroup,
    users: UserGroup,
    data: Parameters<RequestHandler<'reserve'>>[0],
  ): ReturnType<RequestHandler<'reserve'>> => {
    const { stationId, userId } = data;
    const station = stations[stationId];

    if (!station) {
      // retutn error
      return {
        success: false,
        message: 'station does not exist',
        error: undefined,
      };
    }

    const user = users[userId];
    if (!user) {
      return {
        message: 'User does not exist',
        success: false,
        error: undefined,
      };
    }

    // verificar se ja tem reserva
    const hasReservationOnThisStation = station.reservations.includes(userId);
    if (hasReservationOnThisStation) {
      return {
        success: true,
        message: `You already have a reservation on this station: ${station.id}`,
        data: undefined,
      };
    }

    const hasAnyOtherReservation = Object.entries(stations).reduce(
      (prev, station) => {
        return station[1].reservations.includes(userId) || prev;
      },
      false,
    );

    if (hasAnyOtherReservation) {
      return {
        success: false,
        message: 'You already have a reservation on another station',
        error: undefined,
      };
    }

    station.reservations.push(userId);
    station.state = 'reserved';

    // retorna sucesso
    return {
      success: true,
      message: `Reserved station ${station.id}`,
      data: undefined,
    };
  },
);
