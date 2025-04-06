import * as net from 'node:net';
import type { Request } from './main.types.ts';
import { Logger } from './utils.ts';

const HOST = 'localhost'; //server IP
const PORT = 8080; // server port

const args = process.argv.slice(2);

const id = Number(args[0]);
const x = Number(args[1]);
const y = Number(args[2]);


const client = new net.Socket();

const log = Logger.extend('Station');

client.connect(PORT, HOST, () => {
  log.info(`Connected to server at ${HOST}:${PORT}`);

  const message: Request = {
    type: 'registerStation',
    data: {
      reservations: [],
      state: 'avaliable',
      suggestions: [],
      id: id,
      location: {
        x: x,
        y: y,
      },
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
