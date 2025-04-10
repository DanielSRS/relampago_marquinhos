import React from 'react';
import { Logger, PositionCard, View } from '../../../../shared/index.js';
import { FLEX1 } from '../../../../shared/src/utils/constants.js';
import type { Car } from '../../../../../src/main.types.js';
import { useInput } from 'ink';
import { saveUserToStorage, SharedData } from '../../store/shared-data.js';

interface GeneralProps {
	car: Car;
}

/**
 * Exibe informações gerais do carro
 */
export function General(props: GeneralProps) {
	const { car } = props;
	useInput(input => {
		/**
		 * Move the car up
		 */
		if (input === 'w') {
			Logger.info('Going up');
			const currentY = SharedData.car.location.y.peek() ?? 0;
			const nextY = currentY < 150 ? currentY + 1 : 150;
			SharedData.car.location.y.set(nextY);
			saveUserToStorage(SharedData.car.peek()!);
		}
		/**
		 * Move the car down
		 */
		if (input === 's') {
			Logger.info('Going down');
			const currentY = SharedData.car.location.y.peek() ?? 0;
			const nextY = currentY > 0 ? currentY - 1 : 0;
			SharedData.car.location.y.set(nextY);
			saveUserToStorage(SharedData.car.peek()!);
		}
		/**
		 * Move the car left
		 */
		if (input === 'a') {
			Logger.info('Going left');
			const currentX = SharedData.car.location.x.peek() ?? 0;
			const nextX = currentX > 0 ? currentX - 1 : 0;
			SharedData.car.location.x.set(nextX);
			saveUserToStorage(SharedData.car.peek()!);
		}
		/**
		 * Move the car right
		 */
		if (input === 'd') {
			Logger.info('Going right');
			const currentX = SharedData.car.location.x.peek() ?? 0;
			const nextX = currentX < 200 ? currentX + 1 : 200;
			SharedData.car.location.x.set(nextX);
			saveUserToStorage(SharedData.car.peek()!);
		}
	});

	Logger.warn('It should render once');

	return (
		<View style={FLEX1}>
			<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
				<PositionCard position={car.location} />
			</View>
			{}
		</View>
	);
}
