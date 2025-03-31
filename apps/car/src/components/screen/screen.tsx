import React, { useEffect, useMemo } from 'react';

const enterAltScreenCommand = '\x1b[?1049h';
const leaveAltScreenCommand = '\x1b[?1049l';
// eslint-disable-next-line no-console
const enterAltScreen = () => console.log(enterAltScreenCommand);
// eslint-disable-next-line no-console
const leaveAltScreen = () => console.log(leaveAltScreenCommand);

interface ScreenProps {
	children: React.ReactNode;
}

export const Screen = (props: ScreenProps) => {
	const { children } = props;
	useMemo(() => {
		enterAltScreen();
	}, []);
	useEffect(() => {
		return leaveAltScreen;
	}, []);

	return children;
};
