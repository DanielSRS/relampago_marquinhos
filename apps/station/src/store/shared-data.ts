import { observable } from '@legendapp/state';
import { stationStorage } from './persisted.js';
import type {Station } from '../../../../src/main.types.js';
import { apiClient } from '../../../shared/src/api/client.js';

/**
 * User key for local storage
 */
const STATION_KEY = 'station';

export const SharedData = observable<{
	/**
	 * Usuário registrado
	 *
	 * undefined indica que a informação ainda não foi carregada
	 * null indica que o usuário não está registrado
	 */
	station: Station | null | undefined;
}>();

/**
 * Observa alterações nas informações do usuário salvas
 * no armazenamento local e atualiza o estado compartilhado
 */
const userStorageObserver = stationStorage.subscribe<Station>(STATION_KEY, event => {
	if (event.type === 'DELETED') {
		SharedData.station.set(null);
		return;
	}
	SharedData.station.set(event.newValue);
});
userStorageObserver.getInitialVelue().then(v => SharedData.station.set(v ?? null));

export const saveStatinoToStorage = (station: Station) => {
	stationStorage.setMapAsync(STATION_KEY, station);
};

export function deleteStation() {
	stationStorage.removeItemAsync(STATION_KEY);
}

export async function updateStation() {
	const res = await apiClient({
		type: 'getStationInfo',
		data: {
			id: SharedData.station.id.peek() ?? -1,
		},
	});
	if (res.type === 'success') {
		if (res.data.success) {
			saveStatinoToStorage(res.data.data);
		}
		return;
	}
}