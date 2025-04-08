import React from 'react';
import { View } from '../../../components/View/View.js';
import { useEffect } from 'react';
import { useFocus, useInput, Text } from 'ink';
import type { Station } from '../../../../../../src/main.types.js';

export const Suggestion = (props: {
	station: Station;
	onPress?: () => void;
	onFocus?: () => void;
	distance: string | number;
}) => {
	const { station, onPress, onFocus, distance } = props;
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
