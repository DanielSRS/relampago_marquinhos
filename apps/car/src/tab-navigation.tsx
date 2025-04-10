import React, { useState } from 'react';
import { Text } from 'ink';
import { Tabs, Tab } from 'ink-tab';
import { FLEX1 } from './constants.js';
import { Recomendations } from './Pages/Recomendations/Recomendations.js';
import { Computed } from '@legendapp/state/react';
import { SharedData } from './store/shared-data.js';
import { ReserveStation } from './Pages/ReserveStation/ReserveStation.js';
import { Charging } from './Pages/Charging/Charging.js';
import { View } from '../../shared/index.js';
import { About } from './Pages/about/about.js';
import { General } from './Pages/geeneral/general.js';
import { PaymentRoutes } from './routes/payment-routes.js';

export function TabNavigation() {
	const [activeTabName, setActiveTabName] = useState<string>('general');

	// the handleTabChange method get two arguments:
	// - the tab name
	// - the React tab element
	function handleTabChange(
		name: string,
		// activeTab: React.ReactElement<typeof Tab>,
	) {
		// set the active tab name to do what you want with the content
		setActiveTabName(name);
	}

	return (
		<View style={FLEX1}>
			<Tabs
				onChange={handleTabChange}
				defaultValue="general"
				keyMap={{
					useTab: false,
				}}>
				<Tab name="general">General</Tab>
				<Tab name="foo">Charging</Tab>
				<Tab name="bar">Recomendations</Tab>
				<Tab name="baz">Pagamento</Tab>
				<Tab name="about">About</Tab>
			</Tabs>
			<TabContent activeTab={activeTabName} />
		</View>
	);
}

function TabContent(props: { activeTab: string }) {
	switch (props.activeTab) {
		case 'foo':
			return <Charging />;
			break;
		case 'bar':
			return (
				<Computed>
					{() => {
						const location = SharedData.car.location.get();
						const car = SharedData.car.get();
						const selectedStation = SharedData.selectedStation.get();
						if (!location || !car) {
							return null;
						}
						if (selectedStation) {
							return (
								<ReserveStation
									station={selectedStation}
									onGoBack={() => SharedData.selectedStation.set(undefined)}
									car={car}
								/>
							);
						}
						return (
							<Recomendations
								location={location}
								onSelectStation={SharedData.selectedStation.set}
							/>
						);
					}}
				</Computed>
			);
			break;
		case 'baz':
			return (
				<View style={{ ...FLEX1, paddingTop: 0 }}>
					<PaymentRoutes />
				</View>
			);
			break;
		case 'about':
			return <About />;
			break;
		case 'general':
			return (
				<Computed>{() => <General car={SharedData.car.get()!} />}</Computed>
			);
			break;
		default:
			return (
				<View style={{ ...FLEX1, backgroundColor: 'magenta' }}>
					<Text>ERRO!!!</Text>
				</View>
			);
			break;
	}
}
