import { Loader, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export const RoleLoadingState: React.FC = () => {
	const { t } = useTranslation();
	return (
		<Stack align='center' justify='center' h={400}>
			<Loader size='lg' />
			<Text c='dimmed'>{t('nikki.authorize.role.messages.loading')}</Text>
		</Stack>
	);
};

