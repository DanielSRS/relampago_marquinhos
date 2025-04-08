import { observable } from '@legendapp/state';
import type { Car } from '../../../../src/main.types.js';

export const SharedData = observable<{
	car: Car;
}>();
