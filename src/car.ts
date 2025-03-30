import * as net from 'node:net';
import type { Request } from './server.js';

const HOST = 'localhost'; //server IP
const PORT = 8080; // server port

const client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log(`Connected to server at ${HOST}:${PORT}`);

  const message: Request = {
    type: 'reserve',
    data: {
      stationId: 12,
      userId: 456,
    },
  };
  client.write(JSON.stringify(message));
  console.log(`Sent: ${message}`);
});

client.on('data', data => {
  console.log(`Received: ${data}`);
  client.end();
});

client.on('close', () => {
  console.log('Connection closed');
});

client.on('error', err => {
  console.error(`Error: ${err.message}`);
});
