import type {
  StationGroup,
  UserGroup,
  Response,
  ErrorResponse,
  ChargeRecord,
  Charge,
} from '../../main.types.ts';
import { curry } from '../../utils.ts';

/**
 * Iniciar recarga
 * Se o posto exite
 * Se o cliente exite
 * Se o posto ta livre ou reservado para esse carro sendo o primeiro da fila
 * Mudar o status da estação
 * Remover a reserva se houver
 * Criar e salvar o Charge
 */
export const startChaging = curry(
  (
    stations: StationGroup,
    users: UserGroup,
    chargeGroup: ChargeRecord,
    data: {
      stationId: number;
      userId: number;
    },
  ) => {
    const { stationId, userId } = data;
    const station = stations[stationId];
    if (!station) {
      return {
        message: 'Station does not exist',
        success: true,
        error: 'this field is required',
      } satisfies ErrorResponse<unknown>;
    }

    const user = users[userId];
    if (!user) {
      return {
        message: 'User does not exist',
        success: true,
        error: 'this field is not optional',
      } satisfies ErrorResponse<unknown>;
    }

    if (station.state === 'charging-car') {
      return {
        message: 'Cannot use this station',
        success: true,
        error: 'Station is already being used',
      } satisfies ErrorResponse<unknown>;
    }

    if (station.state === 'reserved' && station.reservations[0] !== userId) {
      return {
        message: 'Cannot use this station',
        success: true,
        error: 'This station is reserved for another user',
      } satisfies ErrorResponse<unknown>;
    }

    // remover reserva
    if (station.reservations[0] === userId) {
      station.reservations.splice(0, 1);
    }

    const startDate = new Date();

    const newChage: Charge = {
      // MUDAR ISSO AQUI
      chargeId: Object.values(chargeGroup).length,
      cost: 0,
      endTime: startDate,
      startTime: startDate,
      stationId: station.id,
      userId: user.id,
    };

    chargeGroup[newChage.chargeId] = newChage;

    // Deixar typescript feliz depois
    station.state = 'charging-car';
    station.onUse = newChage.chargeId;

    return {
      message: 'Charging has been succesfully initialized',
      success: true,
      data: newChage,
    } satisfies Response<Charge>;
  },
);
