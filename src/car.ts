import * as net from 'node:net';
import type { Request } from './server.js';
import { Logger } from './utils.ts';

const HOST = 'localhost'; //server IP
const PORT = 8080; // server port

const client = new net.Socket();

const log = Logger.extend('Car');
client.connect(PORT, HOST, () => {
  log.info(`Connected to server at ${HOST}:${PORT}`);

  const message: Request = {
    type: 'reserve',
    data: {
      stationId: 12,
      userId: 456,
    },
  };
  client.write(JSON.stringify(message));
  log.info(`Sent: `, message);
});

client.on('data', data => {
  log.info(`Received: `, JSON.parse(data.toString()));
  client.end();
});

client.on('close', () => {
  log.info('Connection closed');
});

client.on('error', err => {
  log.error(`Error: `, err);
});
