import { Button, Group } from '@mantine/core';
import { IconPlus, IconRefresh, IconUpload } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface ButtonListPageProps {
	onCreate: () => void;
	onRefresh: () => void;
}

export function ButtonListPage({ onCreate, onRefresh }: ButtonListPageProps): React.ReactElement {
	const { t } = useTranslation();

	return (
		<Group>
			<Button
				size='compact-md'
				leftSection={<IconPlus size={16} />}
				onClick={onCreate}
			>
				{t('nikki.identity.user.actions.create')}
			</Button>
			<Button
				size='compact-md'
				variant='outline'
				leftSection={<IconRefresh size={16} />}
				onClick={onRefresh}
			>
				{t('nikki.identity.user.actions.refresh')}
			</Button>
			<Button
				size='compact-md'
				variant='outline'
				leftSection={<IconUpload size={16} />}
			>
				{t('nikki.identity.user.actions.import')}
			</Button>
		</Group>
	);
}
