import { Center, Loader, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export const GrantRequestLoadingState: React.FC = () => {
	const { t: translate } = useTranslation();
	return (
		<Center style={{ minHeight: '200px' }}>
			<Stack align='center' gap='md'>
				<Loader size='lg' />
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</Stack>
		</Center>
	);
};

