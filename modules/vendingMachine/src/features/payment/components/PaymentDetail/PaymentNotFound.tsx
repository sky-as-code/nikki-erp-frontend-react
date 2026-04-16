import { Center, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export const PaymentNotFound: React.FC = () => {
	const { t: translate } = useTranslation();

	return (
		<Center h='100%' w='100%' p='xl' bg='gray.0'>
			<Stack align='center' gap='md'>
				<IconAlertCircle size={48} color='red' />
				<Title order={4}>{translate('nikki.vendingMachine.payment.messages.not_found.title')}</Title>
				<Text c='dimmed'>{translate('nikki.vendingMachine.payment.messages.not_found.message')}</Text>
			</Stack>
		</Center>
	);
};
