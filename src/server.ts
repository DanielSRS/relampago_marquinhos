import { z } from 'zod';
import type { ErrorResponse, StationGroup, Response } from './main.types.ts';
import { curry, Logger } from './utils.ts';

import * as net from 'node:net';
import { createRouter } from './server/router.ts';
import { getSuggestions } from './server/routes/stationSuggetions.ts';

const HOST = 'localhost';
const PORT = 8080;
const MAX_RADIUS = 8000;

const addReservation = curry(
  (
    stations: StationGroup,
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

    // verificar se ja tem reserva
    const hasReservationOnThisStation = station.reservations.includes(idUser);

    const hasAnyOtherReservation = Object.entries(stations).reduce(
      (prev, station) => {
        return station[1].reservations.includes(idUser) || prev;
      },
      false,
    );

    if (hasAnyOtherReservation) {
      return {
        success: false,
        message: 'There is already a reservation',
      };
    }

    // Verificar se carro tem reserva em algum posto
    if (!hasReservationOnThisStation) {
      // faz a reseva
      station.reservations.push(idUser);
    }

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

const locatioonSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const carSchema = z.object({
  id: z.number(),
  location: locatioonSchema,
});

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

        const result = addReservation(STATIONS, data.stationId, data.userId);
        return {
          message: result.message,
          success: result.success,
          data: undefined,
        } satisfies Response<unknown>;
      })
      .add('getSuggestions', getSuggestions(MAX_RADIUS, STATIONS));

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
