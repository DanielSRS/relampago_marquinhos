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
							x: 0,
							y: 0,
						},
					});
				}}
			/>
		);
	}

	return <TabNavigation />;
}

AppRegistry.registerComponent('Car', App);
