import { Button, Group } from '@mantine/core';
import { IconPlus, IconRefresh, IconUpload } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';


export interface EntitlementListActionsProps {
	onCreate: () => void;
	onRefresh: () => void;
}

export const EntitlementListActions: React.FC<EntitlementListActionsProps> = ({ onCreate, onRefresh }) => {
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
			<Button variant='outline' leftSection={<IconUpload size={16} />}>
				{translate('nikki.general.actions.import')}
			</Button>
		</Group>
	);
};

