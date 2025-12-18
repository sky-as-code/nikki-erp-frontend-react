import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface GrantRequestNotFoundProps {
	onGoBack: () => void;
}

export const GrantRequestNotFound: React.FC<GrantRequestNotFoundProps> = ({ onGoBack }) => {
	const { t: translate } = useTranslation();
	return (
		<Center style={{ minHeight: '200px' }}>
			<Stack align='center' gap='md'>
				<IconAlertCircle size={48} color='red' />
				<Title order={4}>{translate('nikki.general.messages.not_found')}</Title>
				<Text c='dimmed'>{translate('nikki.authorize.grant_request.messages.not_found')}</Text>
				<Button onClick={onGoBack}>{translate('nikki.general.actions.back')}</Button>
			</Stack>
		</Center>
	);
};

