import { observable } from '@legendapp/state';
import type {
	Car,
	Station,
	Request,
	Position,
	Charge,
} from '../../../../src/main.types.js';
import { SERVER_HOST, SERVER_PORT } from '../constants.js';
import { tcpRequest } from '../../../shared/index.js';
import { Logger } from '../../../shared/index.js';

export const SharedData = observable<{
	car: Car;
	selectedStation: Station;
	// getSuggestions: () => void;
	suggestions: Station[];
	reservedStation: Station;
	battery_level: number;
	chargingCar: Charge;
	charges: Charge[];
}>();

export async function getSuggestions(
	location: Position,
	onResult: (d: Station[]) => void,
) {
	const res = await tcpRequest(
		{
			type: 'getSuggestions',
			data: {
				id: SharedData.car.peek()?.id ?? -1,
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

export async function getCharges(onResult: (d: Charge[]) => void) {
	const res = await tcpRequest(
		{
			type: 'rechargeList',
			data: {
				userId: SharedData.car.peek()?.id ?? -1,
			},
		} satisfies Request,
		SERVER_HOST,
		SERVER_PORT,
	);
	if (res.type === 'success') {
		Logger.info('getCharges: ', res.data);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onResult((res.data as any).data as Charge[]);
		return;
	}
	Logger.error('getCharges Error: ', res.message, res.error);
}
