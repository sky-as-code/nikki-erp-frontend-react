import { ActionIcon, Tooltip, Text, Group } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';


export function renderNameColumn(
	row: Record<string, unknown>,
	onViewDetail: (resourceName: string) => void,
) {
	return (
		<Text
			style={{ cursor: 'pointer', textDecoration: 'underline' }}
			onClick={() => onViewDetail(row.name as string)}
		>
			{String(row.name || '')}
		</Text>
	);
}

export function renderActionsColumn(
	row: Record<string, unknown>,
	onEdit: (resourceName: string) => void,
	onDelete: (resourceId: string) => void,
	translate: (key: string) => string,
) {
	return (
		<Group gap='xs' justify='flex-end'>
			<Tooltip label={translate('nikki.general.actions.edit')}>
				<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(row.name as string)}>
					<IconEdit size={16} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label={translate('nikki.general.actions.delete')}>
				<ActionIcon variant='subtle' color='red' onClick={() => onDelete(row.id as string)}>
					<IconTrash size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
}
