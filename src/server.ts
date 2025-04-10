import type {
  ErrorResponse,
  StationGroup,
  UserGroup,
  ChargeRecord,
} from './main.types.ts';
import { Logger } from './utils.ts';
import * as net from 'node:net';
import { createRouter } from './server/router.ts';
import { getSuggestions } from './server/routes/stationSuggetions.ts';
import { registerStation } from './server/routes/registerStation.ts';
import { registerUser } from './server/routes/registerCar.ts';
import { startCharging } from './server/routes/startCharging.ts';
import { endCharging } from './server/routes/endCharging.ts';
import { rechargeList } from './server/routes/rechargeList.ts';
import { payment } from './server/routes/payment.ts';
import { connectionSchema } from './schemas/connection.ts';
import { reserve } from './server/routes/reserve.ts';

const HOST = '0.0.0.0';
const PORT = 8080;
const MAX_RADIUS = 8000;

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
      .add('reserve', reserve(STATIONS, USERS))
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
