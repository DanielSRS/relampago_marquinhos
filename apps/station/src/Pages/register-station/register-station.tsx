import React, { useState } from 'react';
import { Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { isTcpError, View } from '../../../../shared/index.js';
import Spinner from 'ink-spinner';
import { hasMouseEventEmitedRecently } from '../../../../shared/src/utils/mouse-events.js';
import { apiClient } from '../../../../shared/src/api/client.js';
import { FLEX1 } from '../../../../shared/src/utils/constants.js';
import type { Station } from '../../../../../src/main.types.js';

export function RegisterStation(props: {
	onStationCreated: (station: Station) => void;
}) {
	const { onStationCreated } = props;
	const [id, setId] = useState<number>();
	const [idField, setIdFiled] = useState('');
	const [tcpErrorMsg, settcpErrorMsg] = useState<string>();
	const [creatingUser, setCreatingUser] = useState(false);

	const createUser = async () => {
		if (id === undefined || typeof id !== 'number') {
			return;
		}
		// Start loading
		setCreatingUser(true);
		const response = await apiClient({
			type: 'registerStation',
			data: {
				id: id,
				reservations: [],
				state: 'avaliable',
				suggestions: [],
				location: {
					x: getRandomNumber(0, 200),
					y: getRandomNumber(0, 200),
				},
			},
		});
		setCreatingUser(false);

		// TCP connection error
		if (isTcpError(response)) {
			settcpErrorMsg(response.message);
			return;
		}

		if (!response.data.success) {
			settcpErrorMsg(response.data.message);
			return;
		}

		onStationCreated(response.data.data);

		// End loading
	};

	/**
	 * Show loading indicator while creating user
	 */
	if (creatingUser) {
		return (
			// Fill entire screen and center elements
			<View
				style={{ ...FLEX1, justifyContent: 'center', alignItems: 'center' }}>
				{/* Box with green border */}
				<View
					style={{
						padding: 2,
						borderStyle: 'round',
						borderColor: 'green',
						flexDirection: 'row',
						gap: 2,
					}}>
					{/* Description text with a loading indicator */}
					<Text>Creating Station</Text>
					<Spinner type="dots12" />
				</View>
			</View>
		);
	}

	return (
		<View style={FLEX1}>
			<View style={{ backgroundColor: 'red' }}>
				<Text>No registered Station!!!</Text>
			</View>

			{/* Id input */}
			{!id ? (
				<View>
					<Text>Input the station id: </Text>
					<TextInput
						value={idField}
						onChange={value => {
							if (hasMouseEventEmitedRecently()) {
								// log.debug('Mouse event detected, ignoring input');
								return;
							}
							setIdFiled(value);
						}}
						placeholder="It needs to be a number"
						onSubmit={value => {
							const parsed = parseInt(value);
							if (Number.isNaN(parsed)) {
								// erro
								return;
							}
							setId(parsed);
						}}
					/>
				</View>
			) : (
				<Text></Text>
			)}
			<Text>{tcpErrorMsg}</Text>

			{/* Create user */}
			{id ? (
				<SelectInput
					items={[
						{
							label: 'Criar station com id: ' + id,
							value: 'reserve',
						},
						{
							label: 'Cancelar',
							value: 'cancel',
						},
						tcpErrorMsg
							? {
									label: 'Tentar novamente',
									value: 'retry',
							  }
							: undefined,
					].filter(v => v !== undefined)}
					onSelect={item => {
						if (item.value === 'reserve') {
							createUser();
						}
						if (item.value === 'cancel') {
							setIdFiled('');
							setId(undefined);
						}
						if (item.value === 'retry') {
							setIdFiled('');
							setId(undefined);
						}
					}}
				/>
			) : (
				<Text></Text>
			)}
		</View>
	);
}

function getRandomNumber(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
