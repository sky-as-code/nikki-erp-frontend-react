import { Button, Group } from '@mantine/core';
import { IconPlus, IconRefresh, IconUpload } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface RoleListActionsProps {
	onCreate: () => void;
	onRefresh: () => void;
}

export const RoleListActions: React.FC<RoleListActionsProps> = ({ onCreate, onRefresh }) => {
	const { t: translate } = useTranslation();
	return (
		<Group>
			<Button
				size='compact-md'
				leftSection={<IconPlus size={16} />}
				onClick={onCreate}
			>
				{translate('nikki.general.actions.create')}
			</Button>
			<Button
				size='compact-md'
				variant='outline'
				leftSection={<IconRefresh size={16} />}
				onClick={onRefresh}
			>
				{translate('nikki.general.actions.refresh')}
			</Button>
			<Button size='compact-md' variant='outline' leftSection={<IconUpload size={16} />}>
				{translate('nikki.general.actions.import')}
			</Button>
		</Group>
	);
};

