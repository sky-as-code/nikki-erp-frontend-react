import { Paper, Stack, Text } from '@mantine/core';
import { BackButton } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';



interface EntitlementNotFoundProps {
	onGoBack: () => void;
}

export const EntitlementNotFound: React.FC<EntitlementNotFoundProps> = ({ onGoBack }) => {
	const { t: translate } = useTranslation();
	return (
		<Stack gap='md'>
			<BackButton onClick={onGoBack} />
			<Paper p='lg'>
				<Text c='dimmed'>{translate('nikki.authorize.entitlement.messages.not_found')}</Text>
			</Paper>
		</Stack>
	);
};

