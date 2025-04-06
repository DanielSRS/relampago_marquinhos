import * as net from 'node:net';
import * as readline from 'node:readline';
import type { Request } from './main.types.ts';
import { Logger } from './utils.ts';

const HOST = 'localhost';
const PORT = 8080;

const log = Logger.extend('Station');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

async function start() {
  const id = Number(await ask('Enter station ID: '));
  const x = Number(await ask('Enter location X: '));
  const y = Number(await ask('Enter location Y: '));

  rl.close();

  const client = new net.Socket();

  client.connect(PORT, HOST, () => {
    log.info(`Connected to server at ${HOST}:${PORT}`);

    const message: Request = {
      type: 'registerStation',
      data: {
        reservations: [],
        state: 'avaliable',
        suggestions: [],
        id,
        location: { x, y },
      },
    };

    client.write(JSON.stringify(message));
    log.info(`Sent: `, message);
  });

  client.on('data', data => {
    log.info(`Received: `, JSON.parse(data.toString()));
    client.end();
  });

  client.on('close', () => log.info('Connection closed'));
  client.on('error', err => log.error(`Error: `, err));
}

start();
