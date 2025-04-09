import React, { useState } from 'react';
import { Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { tcpRequest, View } from '../../../../shared/index.js';
import Spinner from 'ink-spinner';
import { hasMouseEventEmitedRecently } from '../../../../shared/src/utils/mouse-events.js';
import { FLEX1, SERVER_HOST, SERVER_PORT } from '../../constants.js';
import type { Request, User, Response } from '../../../../../src/main.types.js';

// const log = Logger.extend('RegisterUser');

export function RegisterUser(props: { onUserCreated: (user: User) => void }) {
	const { onUserCreated } = props;
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
		const res = await tcpRequest(
			{
				type: 'registerUser',
				data: {
					id: id,
				},
			} satisfies Request,
			SERVER_HOST,
			SERVER_PORT,
		);
		setCreatingUser(false);

		// TCP connection error
		if (res.type === 'error') {
			settcpErrorMsg(res.error + '');
			return;
		}

		// Usuário já criado
		onUserCreated((res.data as Response<User>).data);

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
					<Text>Creating user</Text>
					<Spinner type="dots12" />
				</View>
			</View>
		);
	}

	return (
		<View style={FLEX1}>
			<View style={{ backgroundColor: 'red' }}>
				<Text>No registered user!!!</Text>
			</View>

			{/* Id input */}
			{!id ? (
				<View>
					<Text>Input the user id: </Text>
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
							label: 'Criar usuário com id: ' + id,
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
					}}
				/>
			) : (
				<Text></Text>
			)}
		</View>
	);
}
