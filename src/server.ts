import type { StationGroup, UserGroup, ChargeRecord } from './main.types.ts';
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

  socket.on('data', connection => {
    const router = createRouter()
      .add('reserve', reserve(STATIONS, USERS))
      .add('getSuggestions', getSuggestions(MAX_RADIUS, STATIONS))
      .add('registerStation', registerStation(STATIONS))
      .add('registerUser', registerUser(USERS))
      .add('startCharging', startCharging(STATIONS, USERS, CHARGES))
      .add('endCharging', endCharging(STATIONS, USERS, CHARGES))
      .add('rechargeList', rechargeList(USERS, CHARGES))
      .add('payment', payment(USERS, CHARGES));

    const response = router.validateAndDispach(connection);

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
