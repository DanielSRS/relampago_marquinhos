import React, { useEffect } from 'react';
import { AppRegistry } from '../../shared/index.js';
import { useApp, useInput, Text } from 'ink';
import { RegisterStation } from './Pages/register-station/register-station.js';
import {
	saveStatinoToStorage,
	SharedData,
	updateStation,
} from './store/shared-data.js';
import { use$ } from '@legendapp/state/react';
import { StationInfo } from './Pages/station-info/station-info.js';

export default function App() {
	const { exit } = useApp();
	const station = use$(SharedData.station);

	useEffect(() => {
		if (!station) {
			return;
		}
		const timer = setInterval(() => {
			updateStation();
		}, 3000);
		return () => {
			clearInterval(timer);
		};
	}, [station]); // Pass in empty array to run effect only once!

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
	if (station === undefined) {
		return <Text>Loading...</Text>;
	}

	/**
	 * Se não houver usuário salvo no armazenamento, exibe a tela de registro
	 */
	if (station === null) {
		return <RegisterStation onStationCreated={saveStatinoToStorage} />;
	}

	/**
	 * Se houver usuário salvo no armazenamento, exibe navegação principal
	 * do app. A navegação é feita por abar, onde cada aba é uma página
	 * diferente do app.
	 */
	return <StationInfo station={station} />;
}

AppRegistry.registerComponent('Car', App);
