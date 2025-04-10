import React from 'react';
import { Text, useInput } from 'ink';
import type { Station, Position } from '../../../../../src/main.types.js';
// import { Logger } from '../../utils/utils.js';
import { FLEX1 } from '../../constants.js';
import { SuggestionsList } from './components/suggestions-list.js';
import { Computed, use$ } from '@legendapp/state/react';
import { getSuggestions, SharedData } from '../../store/shared-data.js';
import { View } from '../../../../shared/index.js';
import type { ViewStyles } from '../../../../shared/index.js';

// const log = Logger.extend('Recomendations');

interface RecomendationsProps {
	location: Position;
	onSelectStation: (station: Station) => void;
}

export function Recomendations(props: RecomendationsProps) {
	const { location, onSelectStation } = props;
	const suggestions = use$(SharedData.suggestions) ?? [];

	const retrieveSuggestions = () => {
		getSuggestions(location, SharedData.suggestions.set);
	};

	useInput(input => {
		if (input === 's') {
			retrieveSuggestions();
		}
	});

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
						setTimeout(() => {
							retrieveSuggestions();
						}, 500);
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
						<Computed>
							{() => {
								const pos = SharedData.car.location.get();
								const x = pos?.x ?? -1;
								const y = pos?.y ?? -1;
								return (
									<>
										<Text>x: {x}</Text>
										<Text>y: {y}</Text>
									</>
								);
							}}
						</Computed>
					</View>

					{/* Battery level*/}
					<View style={{ padding: 1 }}>
						<View style={{ marginTop: -1 }}>
							<Text>Nível da bateria</Text>
						</View>
						<Computed>
							{() => <Text>{SharedData.car.batteryLevel.get()}%</Text>}
						</Computed>
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
