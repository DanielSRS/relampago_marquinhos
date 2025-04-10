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
import { userStorage } from './persisted.js';

export const SharedData = observable<{
	/**
	 * Usuário registrado
	 *
	 * undefined indica que a informação ainda não foi carregada
	 * null indica que o usuário não está registrado
	 */
	car: Car | null | undefined;
	selectedStation: Station;
	// getSuggestions: () => void;
	suggestions: Station[];
	reservedStation: Station;
	battery_level: number;
	chargingCar: Charge;
	charges: Charge[];
}>();

/**
 * Observa alterações nas informações do usuário salvas
 * no armazenamento local e atualiza o estado compartilhado
 */
const userStorageObserver = userStorage.subscribe<Car>('user', event => {
	if (event.type === 'DELETED') {
		SharedData.car.set(null);
		return;
	}
	SharedData.car.set(event.newValue);
});
userStorageObserver.getInitialVelue().then(v => SharedData.car.set(v ?? null));

export const saveUserToStorage = (user: Car) => {
	userStorage.setMapAsync('user', user);
};

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
