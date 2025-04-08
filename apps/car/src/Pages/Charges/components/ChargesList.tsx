import { useRef } from 'react';
import type { Charge } from '../../../../../../src/main.types.js';
import {
	ScrollView,
	type ScrollViewRef,
} from '../../../components/ScrollView/ScrollView.js';
import { Text } from 'ink';
import React from 'react';
import { Logger } from '../../../utils/utils.js';
import { ChargeItem } from './ChargeItem.js';

interface ChargesListProps {
	charges: Charge[];
	onSelectCharge?: (charge: Charge) => void;
}

export function ChargesList(props: ChargesListProps) {
	const { charges } = props;
	const scrollRef = useRef<ScrollViewRef>(null);
	if (charges.length === 0) {
		return <Text>Sem recargas</Text>;
	}
	return (
		<ScrollView ref={scrollRef}>
			{charges.map((charge, index) => (
				<ChargeItem
					key={index}
					charge={charge}
					onFocus={() => {
						if (!scrollRef.current) {
							return;
						}
						const startOffset = scrollRef.current.getScrollOffset();
						// const viewportHeight = scrollRef.current.getViewportSize();
						const itemOffset = index * 8;
						Logger.error('Item offset: ', startOffset, itemOffset);
						if (startOffset < itemOffset) {
							scrollRef.current.scrollTo(index * 8);
						}
						if (itemOffset + 6 < startOffset) {
							scrollRef.current.scrollTo(index * 8);
						}
					}}
					onPress={() => {
						Logger.info('Selected charge: ', charge);
					}}
				/>
			))}
		</ScrollView>
	);
}
