import { Loader, Text } from '@mantine/core';
import { Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';


export const ActionLoadingState: React.FC = () => {
	const { t: translate } = useTranslation();
	return (
		<Stack align='center' justify='center' h={400}>
			<Loader size='lg' />
			<Text c='dimmed'>{translate('nikki.authorize.action.messages.loading')}</Text>
		</Stack>
	);
};
