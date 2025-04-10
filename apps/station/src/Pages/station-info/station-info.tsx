import React from 'react';
import { PositionCard, View } from '../../../../shared/index.js';
import { FLEX1 } from '../../../../shared/src/utils/constants.js';
import { Text } from 'ink';
import type { Station } from '../../../../../src/main.types.js';

interface StationInfoProps {
	station: Station;
}

/**
 * Exibe informações gerais do carro
 */
export function StationInfo(props: StationInfoProps) {
	const { station } = props;

	return (
		<View style={FLEX1}>
			<View>
				<Text>ID: {station.id}</Text>
				<Text>Reservations: {station.reservations.length}</Text>
				<Text>State: {station.state}</Text>
				<Text>Suggestions count {station.suggestions.length}</Text>
			</View>
			<PositionCard position={station.location} />
			{}
		</View>
	);
}
