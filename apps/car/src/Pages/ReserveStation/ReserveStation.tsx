import React, { useState } from 'react';
import { Text, useInput } from 'ink';
import type {
	Station,
	Request,
	User,
	Charge,
	Response,
} from '../../../../../src/main.types.js';
import { calculateDistance } from '../../../../../src/location.js';
import { tcpRequest, View } from '../../../../shared/index.js';
import SelectInput from 'ink-select-input';
import { SharedData } from '../../store/shared-data.js';
import { Logger } from '../../../../shared/index.js';
import { SERVER_HOST, SERVER_PORT } from '../../constants.js';
import type { TCPResponse } from '../../../../shared/index.js';

const carLocation = {
	x: 10,
	y: 10,
};

const FLEX1 = { flexBasis: 0, flexGrow: 1, flexShrink: 1 } as const;

export function ReserveStation(props: {
	station: Station;
	user: User;
	onGoBack: () => void;
}) {
	const { station, onGoBack, user } = props;
	const [response, setResponse] = useState<TCPResponse>();
	const isAvaliable = station.state === 'avaliable';

	useInput((input, key) => {
		if (key.backspace) {
			onGoBack();
		}
		if (input === 'v') {
			onGoBack();
		}
	});

	const startCharging = async () => {
		// Start loading
		const res = await tcpRequest(
			{
				type: 'startCharging',
				data: {
					stationId: station.id,
					userId: user.id,
					battery_level: SharedData.battery_level.peek() ?? 50,
				},
			} satisfies Request,
			SERVER_HOST,
			SERVER_PORT,
		);
		if (res.type === 'success') {
			const apiResponse = res.data as Response<Charge>;
			if (apiResponse.success) {
				SharedData.chargingCar.set(apiResponse.data);
				SharedData.reservedStation.set(undefined);
			} else {
				Logger.error('startCharging api error: ', apiResponse);
			}
		} else {
			Logger.error('startCharging tcp error: ', res.message, res.error);
		}
		// End loading
	};

	const reserve = async () => {
		// Start loading
		const res = await tcpRequest(
			{
				type: 'reserve',
				data: {
					stationId: station.id,
					userId: user.id,
				},
			} satisfies Request,
			SERVER_HOST,
			SERVER_PORT,
		);
		if (res.type === 'success') {
			const apiResponse = res.data as {
				message: string;
				success: boolean;
			};
			if (apiResponse.success) {
				SharedData.reservedStation.set(station);
			}
		}
		setResponse(res);
		// End loading
	};

	return (
		<View style={FLEX1}>
			<View style={{ backgroundColor: 'red', padding: 1 }}>
				<Text>{'<--'} Press v to go back</Text>
			</View>
			{/* Station info */}
			<View
				style={
					{
						// borderStyle: 'round',
						// borderColor: isFocused ? 'green' : undefined,
					}
				}>
				<Text>Nome: {station.id}</Text>
				<Text>Estado: {station.state}</Text>
				<Text>Fila: {station.reservations.length}</Text>
				<Text>
					Distância:{' '}
					{calculateDistance(station.location, carLocation).toFixed(2)}u
				</Text>
				{/* <Text>Tipo: {station.type}</Text>
						<Text>Preço: {station.price}</Text> */}
			</View>
			<SelectInput
				items={[
					{
						label: 'Reservar',
						value: 'reserve',
					},
					isAvaliable
						? {
								label: 'Iniciar recarga',
								value: 'charge',
						  }
						: undefined,
					{
						label: 'Cancelar',
						value: 'cancel',
					},
				].filter(v => v !== undefined)}
				onSelect={item => {
					if (item.value === 'reserve') {
						reserve();
					}
					if (item.value === 'charge') {
						startCharging();
					}
				}}
			/>

			{/* Resopnse */}
			<View style={{ backgroundColor: 'red', paddingLeft: 1, paddingRight: 1 }}>
				<Text>Response</Text>
			</View>
			<View style={FLEX1}>
				{!!response ? (
					JSON.stringify(response, null, 2)
						.split('\n')
						.map(line => <Text>{line}</Text>)
				) : (
					<Text></Text>
				)}
			</View>
		</View>
	);
}
