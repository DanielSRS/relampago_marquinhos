import { observable } from '@legendapp/state';
import type { Car, Station } from '../../../../src/main.types.js';

export const SharedData = observable<{
	car: Car;
	selectedStation: Station;
}>();
