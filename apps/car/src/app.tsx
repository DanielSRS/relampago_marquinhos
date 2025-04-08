import React, { useState } from 'react';
import { AppRegistry } from './appRegistry.js';
import { useApp, useInput } from 'ink';
import { type Station, type User } from '../../../src/main.types.js';
import { ReserveStation } from './Pages/ReserveStation/ReserveStation.js';
import { RegisterUser } from './Pages/RegisterUser/RegisterUser.js';
import { Recomendations } from './Pages/Recomendations/Recomendations.js';

const carLocation = {
	x: 10,
	y: 10,
};
// const log = Logger.extend('App');

export default function App() {
	const { exit } = useApp();
	const [user, setUser] = useState<User>();
	// const [screen, setScreen] = useState(0);
	const [selectedStation, setSelectedStation] = useState<Station>();
	useInput(input => {
		if (input === 'q') {
			exit();
		}
	});

	if (user === undefined) {
		return <RegisterUser onUserCreated={setUser} />;
	}

	if (!selectedStation) {
		return (
			<Recomendations
				location={carLocation}
				onSelectStation={setSelectedStation}
			/>
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

AppRegistry.registerComponent('Car', App);
