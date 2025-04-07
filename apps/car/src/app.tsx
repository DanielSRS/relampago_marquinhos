import React, { useState } from 'react';
import { View } from './components/View/View.js';
import { AppRegistry } from './appRegistry.js';
import { Text, useApp, useInput } from 'ink';
import { tcpRequest } from './tcp/tcp.js';
import { Request, type Station } from '../../../src/main.types.js';
import type { ViewStyles } from './components/View/View.js';
import { Logger } from './utils/utils.js';
import { calculateDistance } from '../../../src/location.js';
import { ScrollView } from './components/ScrollView/ScrollView.js';

const SERVER_HOST = 'localhost'; //server IP
const SERVER_PORT = 8080; // server port

const carLocation = {
	x: 10,
	y: 10,
};
const log = Logger.extend('App');
export default function App() {
	const { exit } = useApp();
	const [suggestions, setSuggestions] = useState<Station[]>([]);
	useInput(input => {
		if (input === 'q') {
			exit();
		}
		if (input === 's') {
			getSuggestions();
		}
	});

	async function getSuggestions() {
		const res = await tcpRequest(
			{
				type: 'getSuggestions',
				data: {
					id: 1,
					location: carLocation,
				},
			} satisfies Request,
			SERVER_HOST,
			SERVER_PORT,
		);
		if (res.type === 'success') {
			// log.info('Suggestions: ', res.data);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			setSuggestions((res.data as any).data as Station[]);
			return;
		}
		log.error('Error: ', res.message, res.error);
	}

	return (
		<View style={container}>
			<View style={{ flexDirection: 'row' }}>
				{/* Position card */}
				<View style={{ borderStyle: 'round' }}>
					<View style={{ marginTop: -1 }}>
						<Text>Posição</Text>
					</View>
					<Text>x: {1}</Text>
					<Text>y: {1}</Text>
				</View>

				{/* Battery level*/}
				<View style={{ borderStyle: 'round' }}>
					<View style={{ marginTop: -1 }}>
						<Text>Nível da bateria</Text>
					</View>
					<Text>{1}%</Text>
				</View>
			</View>
			<Text>
				Press <Text color={'red'}>q</Text> to exit
			</Text>
			<Text>
				Press <Text color={'blue'}>s</Text> to get suggestions
			</Text>
			<SuggestionsList suggestions={suggestions} />
		</View>
	);
}

const Suggestion = (props: { station: Station }) => {
	const { station } = props;
	return (
		<View style={{ borderStyle: 'round', borderColor: 'red' }}>
			<Text>Nome: {station.id}</Text>
			<Text>Estado: {station.state}</Text>
			<Text>Fila: {station.reservations.length}</Text>
			<Text>
				Distância: {calculateDistance(station.location, carLocation).toFixed(2)}
				u
			</Text>
			{/* <Text>Tipo: {station.type}</Text>
			<Text>Preço: {station.price}</Text> */}
		</View>
	);
};
const SuggestionsList = (props: { suggestions: Station[] }) => {
	const { suggestions } = props;
	if (suggestions.length === 0) {
		return <Text>Sem sugestões</Text>;
	}
	return (
		<ScrollView>
			{suggestions.map((station, index) => (
				<Suggestion key={index} station={station} />
			))}
		</ScrollView>
	);
};

const container: ViewStyles = {
	flexBasis: 0,
	flexShrink: 1,
	flexGrow: 1,
	overflow: 'hidden',
	borderStyle: 'round',
};

AppRegistry.registerComponent('Car', App);
