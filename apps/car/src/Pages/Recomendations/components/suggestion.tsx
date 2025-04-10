import React from 'react';
import { useEffect } from 'react';
import { useFocus, useInput, Text } from 'ink';
import { use$ } from '@legendapp/state/react';
import { SharedData } from '../../../store/shared-data.js';
import type { Station } from '../../../../../../src/main.types.js';
import { View } from '../../../../../shared/index.js';

export const Suggestion = (props: {
	station: Station;
	onPress?: () => void;
	onFocus?: () => void;
	distance: string | number;
}) => {
	const { station, onPress, onFocus, distance } = props;
	const reservedStation = use$(SharedData.reservedStation);
	const isThisReserved = station.id === reservedStation?.id;
	const { isFocused } = useFocus();

	useEffect(() => {
		if (isFocused) {
			onFocus?.();
		}
	}, [isFocused]);

	useInput((_input, key) => {
		if (key.return && isFocused) {
			onPress?.();
		}
	});

	return (
		<View
			style={{
				borderStyle: 'round',
				borderColor: isFocused ? 'green' : undefined,
				backgroundColor: isThisReserved ? 'greenBright' : undefined,
			}}>
			<Text>Nome: {station.id}</Text>
			<Text>Estado: {station.state}</Text>
			<Text>Fila: {station.reservations.length}</Text>
			<Text>Distância: {distance}u</Text>
			{/* <Text>Tipo: {station.type}</Text>
			<Text>Preço: {station.price}</Text> */}
		</View>
	);
};
