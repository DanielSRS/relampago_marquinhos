import React, { useRef } from 'react';
import { Text } from 'ink';
import { Logger } from '../../../utils/utils.js';
import { Suggestion } from './suggestion.js';
import { ScrollView } from '../../../components/ScrollView/ScrollView.js';
import { calculateDistance } from '../../../../../../src/location.js';
import type { ScrollViewRef } from '../../../components/ScrollView/ScrollView.js';
import type { Position, Station } from '../../../../../../src/main.types.js';

export const SuggestionsList = (props: {
	suggestions: Station[];
	location: Position;
	onSelectStation?: (station: Station) => void;
}) => {
	const { suggestions, onSelectStation, location } = props;
	const scrollRef = useRef<ScrollViewRef>(null);
	if (suggestions.length === 0) {
		return <Text>Sem sugestões</Text>;
	}
	return (
		<ScrollView ref={scrollRef}>
			{suggestions.map((station, index) => (
				<Suggestion
					key={index}
					station={station}
					distance={calculateDistance(station.location, location).toFixed(2)}
					onFocus={() => {
						if (!scrollRef.current) {
							return;
						}
						const startOffset = scrollRef.current.getScrollOffset();
						// const viewportHeight = scrollRef.current.getViewportSize();
						const itemOffset = index * 6;
						Logger.error('Item offset: ', startOffset, itemOffset);
						if (startOffset < itemOffset) {
							scrollRef.current.scrollTo(index * 6);
						}
						if (itemOffset + 6 < startOffset) {
							scrollRef.current.scrollTo(index * 6);
						}
					}}
					onPress={() => {
						Logger.info('Selected station: ', station);
						onSelectStation?.(station);
					}}
				/>
			))}
		</ScrollView>
	);
};
