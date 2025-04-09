import { Box, useStdout } from 'ink';
import React, { useLayoutEffect, useState } from 'react';

type Props = React.PropsWithChildren;

export const ResizableRootContainer: React.FC<Props> = props => {
	const [columns, rows] = useStdoutDimensions();
	return (
		<Box width={columns} height={rows}>
			{props.children}
		</Box>
	);
};

const useStdoutDimensions = (): [number, number] => {
	const { stdout } = useStdout();
	const [dimensions, setDimensions] = useState<[number, number]>([
		stdout.columns,
		stdout.rows,
	]);

	useLayoutEffect(() => {
		const handler = () => {
			setDimensions([stdout.columns, stdout.rows]);
		};
		stdout.on('resize', handler);
		return () => {
			stdout.off('resize', handler);
		};
	}, [stdout]);

	return dimensions;
};
