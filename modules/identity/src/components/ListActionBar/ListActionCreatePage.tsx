import { Button, Group as MantineGroup } from '@mantine/core';
import { IconCancel, IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';


interface ListActionCreatePageProps {
	isLoading: boolean;
}

export function ListActionCreatePage({ isLoading }: ListActionCreatePageProps): React.ReactElement {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const onCancel = () => {
		navigate(-1);
	};


	return (
		<MantineGroup justify='flex-end' gap='md' p='md'>
			<Button
				leftSection={<IconCancel size={16} />}
				size='md'
				variant='default'
				onClick={onCancel}
			>
				{t('nikki.identity.user.actions.cancel')}
			</Button>
			<Button
				type='submit'
				leftSection={<IconCheck size={18} />}
				size='md'
				loading={isLoading}
				disabled={isLoading}
				variant='filled'
			>
				{t('nikki.identity.user.actions.create')}
			</Button>
		</MantineGroup>
	);
}