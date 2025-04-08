import { observable } from '@legendapp/state';
import type {
	Car,
	Station,
	Request,
	Position,
} from '../../../../src/main.types.js';
import { SERVER_HOST, SERVER_PORT } from '../constants.js';
import { tcpRequest } from '../tcp/tcp.js';

export const SharedData = observable<{
	car: Car;
	selectedStation: Station;
	// getSuggestions: () => void;
	suggestions: Station[];
	reservedStation: Station;
}>();

export async function getSuggestions(
	location: Position,
	onResult: (d: Station[]) => void,
) {
	const res = await tcpRequest(
		{
			type: 'getSuggestions',
			data: {
				id: 1,
				location: location,
			},
		} satisfies Request,
		SERVER_HOST,
		SERVER_PORT,
	);
	if (res.type === 'success') {
		// log.info('Suggestions: ', res.data);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onResult((res.data as any).data as Station[]);
		return;
	}
	// log.error('Error: ', res.message, res.error);
}
