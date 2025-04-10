import React from 'react';
import { AppRegistry } from '../../shared/index.js';
import { useApp, useInput, Text } from 'ink';
import { RegisterUser } from './Pages/RegisterUser/RegisterUser.js';
import { saveUserToStorage, SharedData } from './store/shared-data.js';
import { use$ } from '@legendapp/state/react';
import { TabNavigation } from './tab-navigation.js';

export default function App() {
	const { exit } = useApp();
	const car = use$(SharedData.car);

	/**
	 * Adicionando listener para o evento de pressionar a tecla "q"
	 * para sair do aplicativo.
	 */
	useInput(input => {
		if (input === 'q') {
			exit();
		}
	});

	/**
	 * Buscando no amazenamento informações do usuário
	 */
	if (car === undefined) {
		return <Text>Loading...</Text>;
	}

	/**
	 * Se não houver usuário salvo no armazenamento, exibe a tela de registro
	 */
	if (car === null) {
		return (
			<RegisterUser
				onUserCreated={user => {
					saveUserToStorage({
						...user,
						location: {
							x: getRandomNumber(0, 200),
							y: getRandomNumber(0, 200),
						},
					});
					SharedData.battery_level.set(getRandomNumber(20, 95));
				}}
			/>
		);
	}

	/**
	 * Se houver usuário salvo no armazenamento, exibe navegação principal
	 * do app. A navegação é feita por abar, onde cada aba é uma página
	 * diferente do app.
	 */
	return <TabNavigation />;
}

function getRandomNumber(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

AppRegistry.registerComponent('Car', App);
