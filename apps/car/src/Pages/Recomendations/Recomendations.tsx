import React, { useState } from 'react';
import { View, type ViewStyles } from '../../components/View/View.js';
import { Text, useInput } from 'ink';
import type {
	Station,
	Request,
	Position,
} from '../../../../../src/main.types.js';
import { Logger } from '../../utils/utils.js';
import { FLEX1, SERVER_HOST, SERVER_PORT } from '../../constants.js';
import { tcpRequest } from '../../tcp/tcp.js';
import { SuggestionsList } from './components/suggestions-list.js';

const log = Logger.extend('Recomendations');

interface RecomendationsProps {
	location: Position;
	onSelectStation: (station: Station) => void;
}

export function Recomendations(props: RecomendationsProps) {
	const { location, onSelectStation } = props;
	const [suggestions, setSuggestions] = useState<Station[]>([]);

	useInput(input => {
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
					location: location,
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
					location={location}
					onSelectStation={s => {
						// Atualiza as sugestões apos voltar da página de reserva
						// Caso o usuário tenha reservado algum posto
						if (suggestions.length > 0) {
							getSuggestions();
						}
						onSelectStation(s);
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

const container: ViewStyles = {
	flexBasis: 0,
	flexShrink: 1,
	flexGrow: 1,
	overflow: 'hidden',
	// borderStyle: 'round',
};
