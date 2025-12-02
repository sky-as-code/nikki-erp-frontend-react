import { Loader, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export const EntitlementLoadingState: React.FC = () => {
	const { t: translate } = useTranslation();
	return (
		<Stack align='center' justify='center' h={400}>
			<Loader size='lg' />
			<Text c='dimmed'>{translate('nikki.authorize.entitlement.messages.loading')}</Text>
		</Stack>
	);
};

