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

// ------

// Finalizar recarga
// Se o posto exite
// Se o cliente exite
// O posto deve estar recarregando um carro
// O id do carro deve ser o mesmo do Charge

// Muda o status da estção
//   - para disponível se não houver mais reservas
//   - para reservado se ainda houver reservas na fila
// Finalizar o Charge (salvar end time)
// retornar o Charge para o usuário

export const endCharging = curry(
  (
    stations: StationGroup,
    users: UserGroup,
    chargeGroup: ChargeRecord,
    data: {
      stationId: number;
      userId: number;
      battery_level: number;
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

    if (station.state !== 'charging-car') {
      return {
        message:
          'There is no car recharging now, so impossible to complete a recharge',
        success: true,
        error: 'Station is not at the charging-car state',
      } satisfies ErrorResponse<unknown>;
    }

    if (station.onUse === -1) {
      return {
        message:
          'Because of a strange, absurd and  unknown reason, there is no recharge receipt associated with this station',
        success: true,
        error: 'No recharge receipt at this station',
      } satisfies ErrorResponse<unknown>;
    }

    const charge = chargeGroup[station.onUse];

    if (!charge) {
      return {
        message: 'Recharge receipt does not exist',
        success: true,
        error: 'this field is not optional',
      } satisfies ErrorResponse<unknown>;
    }

    if (charge.userId !== userId) {
      return {
        message: 'This recharge receipt refers to another car',
        success: true,
        error: 'This receipt recharge is associated with another user',
      } satisfies ErrorResponse<unknown>;
    }

    const endDate = new Date();

    charge.endTime = endDate;

    charge.cost = battery_level * 6.02 - charge.cost;
    // Deixar typescript feliz depois

    releaseStation(station);
    station.onUse = -1;

    return {
      message: 'Recharging has been succesfully completed',
      success: true,
      data: charge,
    } satisfies Response<Charge>;
  },
);

function releaseStation(station: Station) {
  station.state = station.reservations.length === 0 ? 'avaliable' : 'reserved';
}
