import {
	ActionIcon,
	Group,
	Text,
	Tooltip,
} from '@mantine/core';
import { AutoTable } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Resource } from '@/features/resources/types';


export interface ResourceTableProps {
	columns: string[];
	resources: Resource[];
	isLoading: boolean;
	schema: ModelSchema;
	onViewDetail: (resourceName: string) => void;
	onEdit: (resourceName: string) => void;
	onDelete: (resourceId: string) => void;
}

function renderNameColumn(
	row: Record<string, unknown>,
	onViewDetail: (resourceName: string) => void,
) {
	const resourceName = row.name as string;
	return (
		<Text
			style={{ cursor: 'pointer', textDecoration: 'underline' }}
			onClick={(e) => {
				e.preventDefault();
				onViewDetail(resourceName);
			}}
		>
			{String(row.name || '')}
		</Text>
	);
}

function renderActionsColumn(
	row: Record<string, unknown>,
	onEdit: (resourceName: string) => void,
	onDelete: (resourceId: string) => void,
	translate: (key: string) => string,
) {
	const resourceId = row.id as string;
	const resourceName = row.name as string;
	return (
		<Group gap='xs' justify='flex-end'>
			<Tooltip label={translate('nikki.general.actions.edit')}>
				<ActionIcon
					variant='subtle'
					color='gray'
					onClick={() => onEdit(resourceName)}
				>
					<IconEdit size={16} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label={translate('nikki.general.actions.delete')}>
				<ActionIcon
					variant='subtle'
					color='red'
					onClick={() => onDelete(resourceId)}
				>
					<IconTrash size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
}

export const ResourceTable: React.FC<ResourceTableProps> = ({
	columns,
	resources,
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
			data={resources as unknown as Record<string, unknown>[]}
			schema={schema}
			isLoading={isLoading}
			columnRenderers={{
				name: (row) => renderNameColumn(row, onViewDetail),
				actions: (row) => renderActionsColumn(row, onEdit, onDelete, translate),
			}}
		/>
	);
};

