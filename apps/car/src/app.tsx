import React from 'react';
import { View } from './components/View/View.js';
import { AppRegistry } from './appRegistry.js';
import { Text, useApp, useInput } from 'ink';
import type { ViewStyles } from './components/View/View.js';

export default function App() {
	const { exit } = useApp();
	useInput(input => {
		if (input === 'q') {
			exit();
		}
	});

	return (
		<View style={container}>
			<Text>
				Press <Text color={'red'}>q</Text> to exit
			</Text>
		</View>
	);
}

const container: ViewStyles = {
	flexBasis: 0,
	flexShrink: 1,
	flexGrow: 1,
	overflow: 'hidden',
	borderStyle: 'round',
};

AppRegistry.registerComponent('Car', App);
