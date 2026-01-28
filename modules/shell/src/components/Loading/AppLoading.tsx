import { Center, Loader, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';


export const AppLoading = () => {
	const { t: translate } = useTranslation();

	return (
		<Center w='100%' h='100%' mih='90vh' bg='gray.0'>
			<Stack align='center' gap='xl' p='xl'>
				<Loader size='xl' variant='dots' />
				<Stack align='center' gap='xs'>
					<Title order={3} c='gray.8' fw={600}>
						{translate('nikki.shell.appLoading.title', {
							defaultValue: 'Đang tải ứng dụng',
						})}
					</Title>
					<Text c='dimmed' size='sm' ta='center' maw={400}>
						{translate('nikki.shell.appLoading.description', {
							defaultValue: 'Vui lòng đợi trong giây lát. Ứng dụng đang được tải...',
						})}
					</Text>
				</Stack>
			</Stack>
		</Center>
	);
};
