import React, { useState } from 'react';
import { AppRegistry } from './appRegistry.js';
import { useApp, useInput } from 'ink';
import { type Station } from '../../../src/main.types.js';
import { ReserveStation } from './Pages/ReserveStation/ReserveStation.js';
import { RegisterUser } from './Pages/RegisterUser/RegisterUser.js';
import { Recomendations } from './Pages/Recomendations/Recomendations.js';
import { SharedData } from './store/shared-data.js';
import { use$ } from '@legendapp/state/react';

// const log = Logger.extend('App');

export default function App() {
	const { exit } = useApp();
	const car = use$(SharedData.car);
	// const [screen, setScreen] = useState(0);
	const [selectedStation, setSelectedStation] = useState<Station>();
	useInput(input => {
		if (input === 'q') {
			exit();
		}
	});

	if (car === undefined) {
		return (
			<RegisterUser
				onUserCreated={user => {
					SharedData.car.set({
						...user,
						location: {
							x: 0,
							y: 0,
						},
					});
				}}
			/>
		);
	}

	if (!selectedStation) {
		return (
			<Recomendations
				location={car.location}
				onSelectStation={setSelectedStation}
			/>
		);
	}
	return (
		<ReserveStation
			station={selectedStation}
			onGoBack={() => setSelectedStation(undefined)}
			user={car}
		/>
	);
}

AppRegistry.registerComponent('Car', App);
