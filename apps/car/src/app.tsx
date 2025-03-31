import React from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { AppRegistry } from './appRegistry.js';

export default function App() {
	const { exit } = useApp();
	useInput(input => {
		if (input === 'q') {
			exit();
		}
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			// borderColor="red"
			flexBasis={0}
			flexGrow={1}
			flexShrink={1}
			overflow="hidden">
			<Text>
				Press <Text color={'red'}>q</Text> to exit
			</Text>
		</Box>
	);
}

AppRegistry.registerComponent('Car', App);
