import { Paper, Stack, Text } from '@mantine/core';
import { BackButton } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';



interface RoleSuiteNotFoundProps {
	onGoBack: () => void;
}

export const RoleSuiteNotFound: React.FC<RoleSuiteNotFoundProps> = ({ onGoBack }) => {
	const { t } = useTranslation();
	return (
		<Stack gap='md'>
			<BackButton onClick={onGoBack} />
			<Paper p='lg'>
				<Text c='dimmed'>{t('nikki.authorize.role_suite.messages.not_found')}</Text>
			</Paper>
		</Stack>
	);
};

