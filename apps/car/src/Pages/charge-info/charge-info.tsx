import React from 'react';
import type { Charge } from '../../../../../src/main.types.js';
import { View } from '../../../../shared/index.js';
import { Text } from 'ink';
import { FLEX1 } from '../../../../shared/src/utils/constants.js';

interface ChargeInfoProps {
	charge: Charge;
}
export function ChargeInfo(props: ChargeInfoProps) {
	const { charge } = props;

	return (
		<View style={{ ...FLEX1, borderStyle: 'round' }}>
			<View
				style={{
					// borderStyle: 'round',
					backgroundColor: 'black',
					padding: 1,
				}}>
				<Text>Id: {charge.chargeId}</Text>
				<Text>Start: {new Date(charge.startTime).toLocaleString()}</Text>
				<Text>End: {new Date(charge.endTime).toLocaleString()}</Text>
				<Text>Cost: {charge.cost}</Text>
				<Text>Paid: {charge.hasPaid}</Text>
				<Text>Station: {charge.stationId}</Text>
			</View>
			{}
		</View>
	);
}
