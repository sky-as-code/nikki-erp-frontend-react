import { Paper, Stack, Text } from '@mantine/core';
import { BackButton } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';



interface RoleNotFoundProps {
	onGoBack: () => void;
}

export const RoleNotFound: React.FC<RoleNotFoundProps> = ({ onGoBack }) => {
	const { t } = useTranslation();
	return (
		<Stack gap='md'>
			<BackButton onClick={onGoBack} />
			<Paper p='lg'>
				<Text c='dimmed'>{t('nikki.authorize.role.messages.not_found')}</Text>
			</Paper>
		</Stack>
	);
};

