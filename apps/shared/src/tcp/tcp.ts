import * as net from 'node:net';
import { Logger } from '../utils/utils.js';

export type TCPResponse =
  | {
      /**
       * Connexão tcp feita com sucesso
       */
      type: 'success';
      data: object;
    }
  | {
      /**
       * Houve falha na conexão tcp
       */
      type: 'error';
      message: string;
      error: unknown;
    };

const log = Logger.extend('tcpRequest');

export const tcpRequest = (data: object, host: string, port: number) => {
  return new Promise<TCPResponse>(resolve => {
    let done = false;
    const client = new net.Socket();
    client.connect(port, host, () => {
      // log.info(`Connected to server at ${HOST}:${PORT}`);
      client.write(JSON.stringify(data));
      // log.info(`Sent: `, data);
    });

    client.on('data', data => {
      // log.info(`Received: `, JSON.parse(data.toString()));
      if (typeof data === 'object' && data !== null) {
        resolve({
          type: 'success',
          data: JSON.parse(data.toString()),
        });
      } else {
        resolve({
          type: 'error',
          message: 'Invalid data received',
          error: new Error('Expected object, received: ' + typeof data),
        });
      }
      done = true;
      client.end();
    });

    client.on('error', err => {
      resolve({
        type: 'error',
        message: 'An error happened',
        error: err,
      });
      log.error(`Error: `, err);
    });

    client.on('close', hadError => {
      if (done) {
        return;
      }
      if (hadError) {
        resolve({
          type: 'error',
          message: 'Connection closed with error',
          error: new Error('Connection closed with error'),
        });
        log.error('Connection closed with error');
        return;
      }
      resolve({
        type: 'error',
        message: 'Server closed connection',
        error: new Error('Server closed connection'),
      });
      log.error('Connection closed');
    });
  });
};
