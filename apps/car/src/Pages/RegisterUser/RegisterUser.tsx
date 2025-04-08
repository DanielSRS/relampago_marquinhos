import React, { useState } from 'react';
import { Text } from 'ink';
import { View } from '../../components/View/View.js';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { tcpRequest } from '../../tcp/tcp.js';
import type { Request, User, Response } from '../../../../../src/main.types.js';

const FLEX1 = { flexBasis: 0, flexGrow: 1, flexShrink: 1 } as const;
const SERVER_HOST = 'localhost'; //server IP
const SERVER_PORT = 8080; // server port

export function RegisterUser(props: { onUserCreated: (user: User) => void }) {
	const { onUserCreated } = props;
	const [id, setId] = useState<number>();
	const [tcpErrorMsg, settcpErrorMsg] = useState<string>();

	const createUser = async () => {
		if (id === undefined || typeof id !== 'number') {
			return;
		}
		// Start loading
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

		// TCP connection error
		if (res.type === 'error') {
			settcpErrorMsg(res.message);
			return;
		}

		// Usuário já criado
		onUserCreated((res.data as Response<User>).data);

		// End loading
	};

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
						value={''}
						onChange={value => {
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

			{/* Create user */}
			{id ? (
				<SelectInput
					items={[
						{
							label: 'Criar usuário',
							value: 'reserve',
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
					}}
				/>
			) : (
				<Text></Text>
			)}
		</View>
	);
}
