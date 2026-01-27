import {
	ActionIcon,
	Group,
	Text,
	Tooltip,
} from '@mantine/core';
import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Resource } from '@/features/resources';


export interface ActionTableProps extends AutoTableProps {
	onViewDetail: (actionId: string) => void;
	onEdit?: (actionId: string) => void;
	onDelete?: (actionId: string) => void;
}


function renderNameColumn(
	row: Record<string, unknown>,
	onViewDetail: (actionId: string) => void,
) {
	const actionId = row.id as string;
	return (
		<Text
			style={{ cursor: 'pointer', textDecoration: 'underline' }}
			onClick={(e) => {
				e.preventDefault();
				onViewDetail(actionId);
			}}
		>
			{String(row.name || '')}
		</Text>
	);
}

function renderResourceColumn(
	row: Record<string, unknown>,
) {
	const resourceName = (row.resource as Resource)?.name as string;
	return <Text>{resourceName || ''}</Text>;
}

function renderActionsColumn(
	row: Record<string, unknown>,
	onEdit: ((actionId: string) => void) | undefined,
	onDelete: ((actionId: string) => void) | undefined,
	translate: (key: string) => string,
) {
	const actionId = row.id as string;
	return (
		<Group gap='xs' justify='flex-end'>
			{onEdit && (
				<Tooltip label={translate('nikki.general.actions.edit')}>
					<ActionIcon
						variant='subtle'
						color='gray'
						onClick={() => onEdit(actionId)}
					>
						<IconEdit size={16} />
					</ActionIcon>
				</Tooltip>
			)}
			{onDelete && (
				<Tooltip label={translate('nikki.general.actions.delete')}>
					<ActionIcon
						variant='subtle'
						color='red'
						onClick={() => onDelete(actionId)}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</Tooltip>
			)}
		</Group>
	);
}

export const ActionTable: React.FC<ActionTableProps> = ({
	columns,
	data,
	isLoading,
	schema,
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	return (
		<AutoTable
			columns={columns}
			data={data}
			schema={schema}
			isLoading={isLoading}
			columnRenderers={{
				name: (row) => renderNameColumn(row, onViewDetail),
				resource: (row) => renderResourceColumn(row),
				actions: (row) => renderActionsColumn(row, onEdit, onDelete, translate),
			}}
		/>
	);
};
