import { z } from 'zod';
import type {
  ErrorResponse,
  StationGroup,
  Response,
  UserGroup,
  ChargeRecord,
} from './main.types.ts';
import { curry, Logger } from './utils.ts';

import * as net from 'node:net';
import { createRouter } from './server/router.ts';
import { getSuggestions } from './server/routes/stationSuggetions.ts';
import { registerStation } from './server/routes/registerStation.ts';
import { carSchema } from './schemas/carSchema.ts';
import { stationSchema } from './schemas/stationSchema.ts';
import { registerUser } from './server/routes/registerCar.ts';
import { userSchema } from './schemas/userSchema.ts';
import { startCharging } from './server/routes/startCharging.ts';
import { endCharging } from './server/routes/endCharging.ts';
import { rechargeList } from './server/routes/rechargeList.ts';
import { payment } from './server/routes/payment.ts';

const HOST = '0.0.0.0';
const PORT = 8080;
const MAX_RADIUS = 8000;

const addReservation = curry(
  (
    stations: StationGroup,
    users: UserGroup,
    idStation: number,
    idUser: number,
  ): {
    success: boolean;
    message: string;
  } => {
    const station = stations[idStation];

    if (!station) {
      // retutn error
      return {
        success: false,
        message: 'station does not exist',
      };
    }

    const user = users[idUser];
    if (!user) {
      return {
        message: 'User does not exist',
        success: false,
      };
    }

    // verificar se ja tem reserva
    const hasReservationOnThisStation = station.reservations.includes(idUser);
    if (hasReservationOnThisStation) {
      return {
        success: true,
        message: `You already have a reservation on this station: ${station.id}`,
      };
    }

    const hasAnyOtherReservation = Object.entries(stations).reduce(
      (prev, station) => {
        return station[1].reservations.includes(idUser) || prev;
      },
      false,
    );

    if (hasAnyOtherReservation) {
      return {
        success: false,
        message: 'You already have a reservation on another station',
      };
    }

    station.reservations.push(idUser);
    station.state = 'reserved';

    // retorna sucesso
    return {
      success: true,
      message: `Reserved station ${station.id}`,
    };
  },
);

const STATIONS: StationGroup = {
  2: {
    id: 2,
    location: {
      x: 200,
      y: 50,
    },
    reservations: [],
    state: 'avaliable',
    suggestions: [],
  },
  12: {
    id: 12,
    location: {
      x: 0,
      y: 1,
    },
    reservations: [],
    state: 'avaliable',
    suggestions: [],
  },
};

const USERS: UserGroup = {};

const CHARGES: ChargeRecord = {};

export const connectionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('reserve'),
    data: z.object({
      userId: z.number(),
      stationId: z.number(),
    }),
  }),
  z.object({
    type: z.literal('getSuggestions'),
    data: carSchema,
  }),
  z.object({
    type: z.literal('registerStation'),
    data: stationSchema,
  }),
  z.object({
    type: z.literal('registerUser'),
    data: userSchema,
  }),
  z.object({
    type: z.literal('startCharging'),
    data: z.object({
      stationId: z.number(),
      userId: z.number(),
      battery_level: z.number(),
    }),
  }),
  z.object({
    type: z.literal('endCharging'),
    data: z.object({
      stationId: z.number(),
      userId: z.number(),
      battery_level: z.number(),
    }),
  }),
  z.object({
    type: z.literal('rechargeList'),
    data: z.object({
      userId: z.number(),
    }),
  }),
  z.object({
    type: z.literal('payment'),
    data: z.object({
      userId: z.number(),
      chargeId: z.number(),
      hasPaid: z.boolean(),
    }),
  }),
]);

const log = Logger.extend('Server');
const server = net.createServer(socket => {
  log.info('Client connected:', socket.remoteAddress + ':' + socket.remotePort);

  socket.on('data', d => {
    // verifica se os dados estão no formato esperado
    const data = connectionSchema.safeParse(JSON.parse(d.toString()));

    if (!data.success) {
      // return error
      // invalid data format
      socket.write(
        JSON.stringify({
          message: 'erro',
          success: false,
          error: JSON.stringify(data.error, null, 2),
        } satisfies ErrorResponse<unknown>),
      );
      return;
    }

    const router = createRouter()
      .add('reserve', data => {
        // Remover carro da lista de sugestões

        const result = addReservation(
          STATIONS,
          USERS,
          data.stationId,
          data.userId,
        );
        return {
          message: result.message,
          success: result.success,
          data: undefined,
        } satisfies Response<unknown>;
      })
      .add('getSuggestions', getSuggestions(MAX_RADIUS, STATIONS))
      .add('registerStation', registerStation(STATIONS))
      .add('registerUser', registerUser(USERS))
      .add('startCharging', startCharging(STATIONS, USERS, CHARGES))
      .add('endCharging', endCharging(STATIONS, USERS, CHARGES))
      .add('rechargeList', rechargeList(USERS, CHARGES))
      .add('payment', payment(USERS, CHARGES));

    const response = router.all()[data.data.type]?.(data.data.data);

    // log.info(`Received: ${data}`);
    socket.write(JSON.stringify(response));
  });

  socket.on('end', () => {
    log.debug('Client disconnected');
  });

  socket.on('error', err => {
    log.error(`Socket error: ${err.message}`);
  });
});

server.listen(PORT, HOST, () => {
  log.info(`Server listening on ${HOST}:${PORT}`);
});

server.on('error', err => {
  log.error(`Server error: ${err.message}`);
});

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
