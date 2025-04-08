import React, { useEffect, useRef, useState } from 'react';
import { View } from './components/View/View.js';
import { AppRegistry } from './appRegistry.js';
import { Text, useApp, useFocus, useInput } from 'ink';
import { tcpRequest } from './tcp/tcp.js';
import { Request, type Station, type User } from '../../../src/main.types.js';
import type { ViewStyles } from './components/View/View.js';
import { Logger } from './utils/utils.js';
import { calculateDistance } from '../../../src/location.js';
import {
	ScrollView,
	type ScrollViewRef,
} from './components/ScrollView/ScrollView.js';
import { ReserveStation } from './Pages/ReserveStation/ReserveStation.js';
import { RegisterUser } from './Pages/RegisterUser/RegisterUser.js';
import { FLEX1 } from './constants.js';

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
	const [user, setUser] = useState<User>();
	// const [screen, setScreen] = useState(0);
	const [selectedStation, setSelectedStation] = useState<Station>();
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

	if (user === undefined) {
		return <RegisterUser onUserCreated={setUser} />;
	}

	if (!selectedStation) {
		return (
			<View style={container}>
				<View
					style={{
						...FLEX1,
						// Header size
						marginTop: 9,
					}}>
					<SuggestionsList
						suggestions={suggestions}
						onSelectStation={s => {
							// Atualiza as sugestões apos voltar da página de reserva
							// Caso o usuário tenha reservado algum posto
							if (suggestions.length > 0) {
								getSuggestions();
							}
							setSelectedStation(s);
						}}
					/>
				</View>
				{/* Header */}
				<View
					style={{
						position: 'absolute',
						width: '100%',
						padding: 1,
						backgroundColor: 'black',
					}}>
					<View style={{ flexDirection: 'row' }}>
						{/* Position card */}
						<View style={{ padding: 1 }}>
							<View style={{ marginTop: -1 }}>
								<Text>Posição</Text>
							</View>
							<Text>x: {1}</Text>
							<Text>y: {1}</Text>
						</View>

						{/* Battery level*/}
						<View style={{ padding: 1 }}>
							<View style={{ marginTop: -1 }}>
								<Text>Nível da bateria</Text>
							</View>
							<Text>{1}%</Text>
						</View>
					</View>
					<View>
						<Text>
							Press <Text color={'red'}>q</Text> to exit
						</Text>
					</View>
					<View>
						<Text>
							Press <Text color={'blue'}>s</Text> to get suggestions
						</Text>
					</View>
				</View>
			</View>
		);
	}
	return (
		<ReserveStation
			station={selectedStation}
			onGoBack={() => setSelectedStation(undefined)}
			user={user}
		/>
	);
}

const Suggestion = (props: {
	station: Station;
	onPress?: () => void;
	onFocus?: () => void;
}) => {
	const { station, onPress, onFocus } = props;
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
			<Text>
				Distância: {calculateDistance(station.location, carLocation).toFixed(2)}
				u
			</Text>
			{/* <Text>Tipo: {station.type}</Text>
			<Text>Preço: {station.price}</Text> */}
		</View>
	);
};
const SuggestionsList = (props: {
	suggestions: Station[];
	onSelectStation?: (station: Station) => void;
}) => {
	const { suggestions, onSelectStation } = props;
	const scrollRef = useRef<ScrollViewRef>(null);
	if (suggestions.length === 0) {
		return <Text>Sem sugestões</Text>;
	}
	return (
		<ScrollView ref={scrollRef}>
			{suggestions.map((station, index) => (
				<Suggestion
					key={index}
					station={station}
					onFocus={() => {
						if (!scrollRef.current) {
							return;
						}
						const startOffset = scrollRef.current.getScrollOffset();
						// const viewportHeight = scrollRef.current.getViewportSize();
						const itemOffset = index * 6;
						Logger.error('Item offset: ', startOffset, itemOffset);
						if (startOffset < itemOffset) {
							scrollRef.current.scrollTo(index * 6);
						}
						if (itemOffset + 6 < startOffset) {
							scrollRef.current.scrollTo(index * 6);
						}
					}}
					onPress={() => {
						Logger.info('Selected station: ', station);
						onSelectStation?.(station);
					}}
				/>
			))}
		</ScrollView>
	);
};

const container: ViewStyles = {
	flexBasis: 0,
	flexShrink: 1,
	flexGrow: 1,
	overflow: 'hidden',
	// borderStyle: 'round',
};

AppRegistry.registerComponent('Car', App);
