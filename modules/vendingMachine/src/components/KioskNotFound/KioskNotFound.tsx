import { Center, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface KioskNotFoundProps {
	showBackButton?: boolean;
}

export const KioskNotFound: React.FC<KioskNotFoundProps> = () => {
	const { t: translate } = useTranslation();

	return (
		<Center
			h='100%'
			w='100%'
			p='xl'
			bg='gray.0'
		>
			<Stack align='center' gap='md'>
				<IconAlertCircle size={48} color='red' />
				<Title order={4}>{translate('nikki.vendingMachine.kiosk.messages.not_found.title')}</Title>
				<Text c='dimmed'>{translate('nikki.vendingMachine.kiosk.messages.not_found.message')}</Text>
			</Stack>
		</Center>
	);
};
