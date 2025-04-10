import { useRef } from 'react';
import type { Charge } from '../../../../../../src/main.types.js';
import { Text } from 'ink';
import React from 'react';
import {
	scrollToItemPosition,
	ScrollView,
} from '../../../../../shared/index.js';
import { ChargeItem } from './ChargeItem.js';
import type { ScrollViewRef } from '../../../../../shared/index.js';

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
						scrollToItemPosition(8, index, scrollRef.current);
					}}
				/>
			))}
		</ScrollView>
	);
}
