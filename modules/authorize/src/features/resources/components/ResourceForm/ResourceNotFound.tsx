import { Paper, Stack, Text } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BackButton } from '../Button/BackButton';


interface ResourceNotFoundProps {
	onGoBack: () => void;
}

export const ResourceNotFound: React.FC<ResourceNotFoundProps> = ({ onGoBack }) => {
	const { t } = useTranslation();
	return (
		<Stack gap='md'>
			<BackButton onClick={onGoBack} />
			<Paper p='lg'>
				<Text c='dimmed'>{t('nikki.authorize.resource.messages.not_found')}</Text>
			</Paper>
		</Stack>
	);
};

