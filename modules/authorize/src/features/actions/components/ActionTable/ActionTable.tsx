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

import { Resource } from '../../../resources/types';
import { Action } from '../../types';


export interface ActionTableProps {
	columns: string[];
	actions: Action[];
	resources: Resource[];
	isLoading: boolean;
	schema: ModelSchema;
	onViewDetail: (actionId: string) => void;
	onEdit: (actionId: string) => void;
	onDelete: (actionId: string) => void;
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

function renderResourceIdColumn(
	row: Record<string, unknown>,
	resourceMap: Map<string, string>,
) {
	const resourceId = row.resourceId as string;
	const resourceName = resourceMap.get(resourceId) || resourceId;
	return <Text>{resourceName}</Text>;
}

function renderActionsColumn(
	row: Record<string, unknown>,
	onEdit: (actionId: string) => void,
	onDelete: (actionId: string) => void,
	translate: (key: string) => string,
) {
	const actionId = row.id as string;
	return (
		<Group gap='xs' justify='flex-end'>
			<Tooltip label={translate('nikki.general.actions.edit')}>
				<ActionIcon
					variant='subtle'
					color='gray'
					onClick={() => onEdit(actionId)}
				>
					<IconEdit size={16} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label={translate('nikki.general.actions.delete')}>
				<ActionIcon
					variant='subtle'
					color='red'
					onClick={() => onDelete(actionId)}
				>
					<IconTrash size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
}

export const ActionTable: React.FC<ActionTableProps> = ({
	columns,
	actions,
	resources,
	isLoading,
	schema,
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	const resourceMap = React.useMemo(() => {
		const map = new Map<string, string>();
		resources.forEach((r) => {
			map.set(r.id, r.name);
		});
		return map;
	}, [resources]);

	return (
		<AutoTable
			columns={columns}
			data={actions as unknown as Record<string, unknown>[]}
			schema={schema}
			isLoading={isLoading}
			columnRenderers={{
				name: (row) => renderNameColumn(row, onViewDetail),
				resourceId: (row) => renderResourceIdColumn(row, resourceMap),
				actions: (row) => renderActionsColumn(row, onEdit, onDelete, translate),
			}}
		/>
	);
};
