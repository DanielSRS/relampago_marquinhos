import { z } from 'zod';
import type { StationGroup } from './main.types.ts';
import { curry } from './utils.ts';

import * as net from 'node:net';

const HOST = 'localhost';
const PORT = 8080;

const STATIONS: StationGroup = {};

const addReservation = curry(
  (stations: StationGroup, idStation: number, idUser: number): string => {
    const station = stations[idStation];

    if (!station) {
      // retutn error
      return 'station does not exist';
    }

    // verificar se ja tem reserva
    const hasReservation = station.reservations.includes(idUser);

    if (!hasReservation) {
      // faz a reseva
      station.reservations.push(idUser);
    }
    // retorna sucesso
    return 'rervated';
  },
);

export type Request = {
  type: 'reserve';
  data: {
    userId: number;
    stationId: number;
  };
};

export type Response<T> = {
  message: string;
  success: boolean;
  data: T;
};

export type ErrorResponse<T> = {
  message: string;
  success: boolean;
  error: T;
};

export const connectionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('reserve'),
    data: z.object({
      userId: z.number(),
      stationId: z.number(),
    }),
  }),
]);

const server = net.createServer(socket => {
  console.log(
    'Client connected:',
    socket.remoteAddress + ':' + socket.remotePort,
  );

  socket.on('data', d => {
    // verifica se os dados estão no formato esperado
    const data = connectionSchema.safeParse(d);

    if (!data.success) {
      // return error
      // invalid data format
      socket.write(
        JSON.stringify({
          message: 'erro',
          success: false,
          error: 'invalid data format',
        } satisfies ErrorResponse<unknown>),
      );
      return;
    }

    if (data.data.type === 'reserve') {
      socket.write(
        JSON.stringify({
          message: '',
          success: true,
          data: addReservation(
            STATIONS,
            data.data.data.stationId,
            data.data.data.userId,
          ),
        } satisfies Response<unknown>),
      );
      return;
    }
    console.log(`Received: ${data}`);

    const response = `Server received: ${data}`;
    socket.write(
      JSON.stringify({
        message: 'sucesso',
        success: true,
        data: response,
      } satisfies Response<string>),
    );
    console.log(`Sent: ${response}`);
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', err => {
    console.error(`Socket error: ${err.message}`);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});

server.on('error', err => {
  console.error(`Server error: ${err.message}`);
});
