import { Stack } from '@mantine/core';
import { Paper } from '@mantine/core';
import { Text } from '@mantine/core';
import { BackButton } from '@nikkierp/ui/components';
import { useTranslation } from 'react-i18next';



interface ActionNotFoundProps {
	onGoBack: () => void;
}

export const ActionNotFound: React.FC<ActionNotFoundProps> = ({ onGoBack }) => {
	const { t } = useTranslation();
	return (
		<Stack gap='md'>
			<BackButton onClick={onGoBack} />
			<Paper p='lg'>
				<Text c='dimmed'>{t('nikki.authorize.action.messages.not_found')}</Text>
			</Paper>
		</Stack>
	);
};
