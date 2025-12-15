import { Button, Group } from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface GrantRequestListActionsProps {
	onCreate: () => void;
	onRefresh: () => void;
}

export const GrantRequestListActions: React.FC<GrantRequestListActionsProps> = ({ onCreate, onRefresh }) => {
	const { t: translate } = useTranslation();
	return (
		<Group>
			<Button
				leftSection={<IconPlus size={16} />}
				onClick={onCreate}
			>
				{translate('nikki.general.actions.create')}
			</Button>
			<Button
				variant='outline'
				leftSection={<IconRefresh size={16} />}
				onClick={onRefresh}
			>
				{translate('nikki.general.actions.refresh')}
			</Button>
		</Group>
	);
};

