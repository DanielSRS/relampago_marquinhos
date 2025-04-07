import { consoleTransport, logger } from 'react-native-logs';

type ConsoleTransport = typeof consoleTransport;
const remoteTransoport: ConsoleTransport = props => {
	fetch('http://127.0.0.1:3519/__log__remote__', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(props),
	}).catch(() => {});
};

const _Logger = logger.createLogger({
	transport: remoteTransoport,
	transportOptions: {
		colors: {
			info: 'blueBright',
			warn: 'yellowBright',
			error: 'redBright',
		},
	},
});

export const Logger: ReturnType<typeof logger.createLogger<ConsoleTransport>> =
	_Logger;
