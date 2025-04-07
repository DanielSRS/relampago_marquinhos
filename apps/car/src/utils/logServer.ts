/* eslint-disable no-console */
import http from 'node:http';
import { consoleTransport } from 'react-native-logs';

const hostname = '127.0.0.1';
const port = 3519;

const logPath = '/__log__remote__';

const server = http.createServer((req, res) => {
	if (req.method === 'POST' && req.url === logPath) {
		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		});
		req.on('end', () => {
			try {
				const jsonData = JSON.parse(body);
				res.statusCode = 200;
				// console.log(jsonData);
				consoleTransport(jsonData);
				res.setHeader('Content-Type', 'application/json');
				res.end('ok');
			} catch (err) {
				if (err) {
					//
				}
				res.statusCode = 400;
				console.log(400);
				res.setHeader('Content-Type', 'application/json');
				res.end('ok');
			}
		});
	} else {
		res.statusCode = 404;
		console.log({
			m: req.method,
			u: req.url,
			s: 404,
		});
		res.setHeader('Content-Type', 'text/plain');
		res.end('Not Found\n');
	}
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
