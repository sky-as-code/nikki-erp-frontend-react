'use client';

import { Center, Loader } from '@mantine/core';

export const LoadingSpinner = () => {
	return (
		<Center h='100vh'>
			<Loader size='lg' />
		</Center>
	);
};