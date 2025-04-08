import React, { useState } from 'react';
import { Text, useInput } from 'ink';
import { View } from '../../components/View/View.js';
import type { Station, Request, User } from '../../../../../src/main.types.js';
import { calculateDistance } from '../../../../../src/location.js';
import { tcpRequest, type TCPResponse } from '../../tcp/tcp.js';
import SelectInput from 'ink-select-input';

const carLocation = {
	x: 10,
	y: 10,
};

const SERVER_HOST = 'localhost'; //server IP
const SERVER_PORT = 8080; // server port

const FLEX1 = { flexBasis: 0, flexGrow: 1, flexShrink: 1 } as const;

export function ReserveStation(props: {
	station: Station;
	user: User;
	onGoBack: () => void;
}) {
	const { station, onGoBack, user } = props;
	const [response, setResponse] = useState<TCPResponse>();

	useInput((input, key) => {
		if (key.backspace) {
			onGoBack();
		}
		if (input === 'v') {
			onGoBack();
		}
	});

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
		setResponse(res);
		// End loading
	};

	return (
		<View style={FLEX1}>
			<View style={{ backgroundColor: 'red', padding: 1 }}>
				<Text>{'<--'} Press backspace to go back</Text>
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
					{
						label: 'Cancelar',
						value: 'cancel',
					},
				]}
				onSelect={item => {
					if (item.value === 'reserve') {
						reserve();
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
