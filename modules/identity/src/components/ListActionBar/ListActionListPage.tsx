import { Button, Group } from '@mantine/core';
import { IconPlus, IconRefresh, IconUpload, IconUserMinus, IconUserPlus } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


interface ListActionListPageProps {
	onCreate?: () => void;
	onRefresh: () => void;
	onAddUser?: () => void;
	onRemoveUser?: () => void;
}

export function ListActionListPage({
	onCreate, onRefresh, onAddUser, onRemoveUser,
}: ListActionListPageProps): React.ReactElement {
	const { t } = useTranslation();

	return (
		<Group>
			<Button
				size='compact-md'
				leftSection={<IconPlus size={16} />}
				onClick={onCreate}
				disabled={!onCreate}
			>
				{t('nikki.identity.user.actions.create')}
			</Button>
			{onAddUser && (
				<Button
					size='compact-md'
					variant='outline'
					leftSection={<IconUserPlus size={16} />}
					onClick={onAddUser}
				>
					{t('nikki.identity.organization.actions.addUsers')}
				</Button>
			)}
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
