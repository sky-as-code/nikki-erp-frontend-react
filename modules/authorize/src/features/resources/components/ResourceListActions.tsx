import { Button, Group } from '@mantine/core';
import { IconPlus, IconRefresh, IconUpload } from '@tabler/icons-react';
import React from 'react';


export interface ResourceListActionsProps {
	onCreate: () => void;
	onRefresh: () => void;
}

export const ResourceListActions: React.FC<ResourceListActionsProps> = ({ onCreate, onRefresh }) => {
	return (
		<Group>
			<Button
				size='compact-md'
				leftSection={<IconPlus size={16} />}
				onClick={onCreate}
			>
				Create
			</Button>
			<Button
				size='compact-md'
				variant='outline'
				leftSection={<IconRefresh size={16} />}
				onClick={onRefresh}
			>
				Refresh
			</Button>
			<Button size='compact-md' variant='outline' leftSection={<IconUpload size={16} />}>Import</Button>
		</Group>
	);
};


