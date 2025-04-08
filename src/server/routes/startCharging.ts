import type {
  StationGroup,
  UserGroup,
  Response,
  ErrorResponse,
  ChargeRecord,
  Charge,
  Station,
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
export const startCharging = curry(
  (
    stations: StationGroup,
    users: UserGroup,
    chargeGroup: ChargeRecord,
    data: {
      stationId: number;
      userId: number;
      battery_level: number
    },
  ) => {
    const { stationId, userId, battery_level } = data;
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

    const alredyCharging = Object.values(chargeGroup).reduce((prev, current) => {
      return prev || (current.endTime == current.startTime) && current.userId ===userId
    }, false);

    if (alredyCharging) {
      return {
        message: 'User is already using a station',
        success: true,
        error: 'Cannot start more than one charging',
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
      cost: battery_level*6.02,
      endTime: startDate,
      startTime: startDate,
      stationId: station.id,
      userId: user.id,
      hasPaid: false,
    };

    chargeGroup[newChage.chargeId] = newChage;

    // Deixar typescript feliz depois
    occupyStation(station, newChage.chargeId);

    return {
      message: 'Recharging has been succesfully initialized',
      success: true,
      data: newChage,
    } satisfies Response<Charge>;
  },
);

function occupyStation(station: Station, chargeId: number) {
  station.state = 'charging-car';
  if (station.state === 'charging-car') {
    station.onUse = chargeId;
  } else {
    throw 'this should never happens'
  }
}
