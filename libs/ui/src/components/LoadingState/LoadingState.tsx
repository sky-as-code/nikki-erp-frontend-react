import { Center, Loader, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface LoadingStateProps {
	messageKey?: string;
	minHeight?: string | number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
	messageKey = 'nikki.general.messages.loading',
	minHeight = 400,
}) => {
	const { t: translate } = useTranslation();
	return (
		<Center style={{ minHeight }}>
			<Stack align='center' gap='md'>
				<Loader size='lg' />
				<Text c='dimmed'>{translate(messageKey)}</Text>
			</Stack>
		</Center>
	);
};

