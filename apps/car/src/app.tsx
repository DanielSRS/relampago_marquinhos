import React from 'react';
import { AppRegistry } from './appRegistry.js';
import { useApp, useInput } from 'ink';
import { RegisterUser } from './Pages/RegisterUser/RegisterUser.js';
import { SharedData } from './store/shared-data.js';
import { use$ } from '@legendapp/state/react';
import { TabNavigation } from './tab-navigation.js';

// const log = Logger.extend('App');

export default function App() {
	const { exit } = useApp();
	const car = use$(SharedData.car);
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
							x: getRandomNumber(0, 200),
							y: getRandomNumber(0, 200),
						},
					});
					SharedData.battery_level.set( getRandomNumber(20, 95),);
				}}
			/>
		);
	}

	return <TabNavigation />;
}

function getRandomNumber(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

AppRegistry.registerComponent('Car', App);
