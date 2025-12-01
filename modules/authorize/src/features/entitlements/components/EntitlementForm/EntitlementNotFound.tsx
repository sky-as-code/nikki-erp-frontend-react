import { Paper, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BackButton } from '../Button/BackButton';


interface EntitlementNotFoundProps {
	onGoBack: () => void;
}

export const EntitlementNotFound: React.FC<EntitlementNotFoundProps> = ({ onGoBack }) => {
	const { t } = useTranslation();
	return (
		<Stack gap='md'>
			<BackButton onClick={onGoBack} />
			<Paper p='lg'>
				<Text c='dimmed'>{t('nikki.authorize.entitlement.messages.not_found')}</Text>
			</Paper>
		</Stack>
	);
};

