import React from 'react';
import { Navigator } from '../../../shared/index.js';
import { ChargesPage } from '../Pages/Charges/Charges.nav.js';

export function PaymentRoutes() {
	const screens = {
		charger: ChargesPage,
	};

	return <Navigator initialRouteName="charger" screens={screens} />;
}
