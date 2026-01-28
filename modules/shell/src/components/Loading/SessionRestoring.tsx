import { Center, Loader, Stack, Text, Title } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';


export const SessionRestoring: React.FC = () => {
	const { t: translate } = useTranslation();

	return (
		<Center w='100%' h='100vh' bg='gray.0'>
			<Stack align='center' gap='xl' p='xl'>
				<Loader size='xl' variant='dots' />
				<Stack align='center' gap='xs'>
					<Title order={3} c='gray.8' fw={600}>
						{translate('nikki.shell.sessionRestoring.title', {
							defaultValue: 'Đang khôi phục phiên làm việc',
						})}
					</Title>
					<Text c='dimmed' size='sm' ta='center' maw={400}>
						{translate('nikki.shell.sessionRestoring.description', {
							defaultValue: 'Vui lòng đợi trong giây lát. Hệ thống đang khôi phục phiên làm việc của bạn...',
						})}
					</Text>
				</Stack>
			</Stack>
		</Center>
	);
};