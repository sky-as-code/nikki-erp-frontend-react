import { Button, Center, Paper, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BackButton } from '../Button';


export interface NotFoundProps {
	onGoBack: () => void;
	titleKey?: string;
	messageKey: string;
	showBackButton?: boolean;
}

export const NotFound: React.FC<NotFoundProps> = ({
	onGoBack,
	titleKey,
	messageKey,
	showBackButton = true,
}) => {
	const { t: translate } = useTranslation();
	return (
		<Stack gap='md'>
			{showBackButton && <BackButton onClick={onGoBack} />}
			<Center style={{ minHeight: '200px' }}>
				<Stack align='center' gap='md'>
					<IconAlertCircle size={48} color='red' />
					{titleKey && <Title order={4}>{translate(titleKey)}</Title>}
					<Paper p='lg'>
						<Text c='dimmed'>{translate(messageKey)}</Text>
					</Paper>
					{showBackButton && (
						<Button onClick={onGoBack}>
							{translate('nikki.general.actions.back')}
						</Button>
					)}
				</Stack>
			</Center>
		</Stack>
	);
};

