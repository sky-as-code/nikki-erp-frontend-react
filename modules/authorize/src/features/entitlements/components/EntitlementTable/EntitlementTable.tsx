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

import type { Action } from '@/features/actions';
import type { Resource } from '@/features/resources';


export interface EntitlementTableProps extends AutoTableProps {
	resourcesData: Resource[];
	actionsData: Action[];
	onViewDetail: (entitlementId: string) => void;
	onEdit: (entitlementId: string) => void;
	onDelete: (entitlementId: string) => void;
}

function renderNameColumn(
	row: Record<string, unknown>,
	onViewDetail: (entitlementId: string) => void,
) {
	const entitlementId = row.id as string;
	return (
		<Text
			style={{ cursor: 'pointer', textDecoration: 'underline' }}
			onClick={(e) => {
				e.preventDefault();
				onViewDetail(entitlementId);
			}}
		>
			{String(row.name || '')}
		</Text>
	);
}

function renderResourceIdColumn(
	row: Record<string, unknown>,
	resourceMap: Map<string, string>,
	translate: (key: string) => string,
) {
	const resourceId = row.resourceId as string | undefined;
	if (!resourceId) {
		return <Text>{translate('nikki.authorize.entitlement.fields.resource_all')}</Text>;
	}
	const resourceName = resourceMap.get(resourceId) || resourceId;
	return <Text>{resourceName}</Text>;
}

function renderActionIdColumn(
	row: Record<string, unknown>,
	actionMap: Map<string, string>,
	translate: (key: string) => string,
) {
	const actionId = row.actionId as string | undefined;
	if (!actionId) {
		return <Text>{translate('nikki.authorize.entitlement.fields.action_all')}</Text>;
	}
	const actionName = actionMap.get(actionId) || actionId;
	return <Text>{actionName}</Text>;
}

function renderActionsColumn(
	row: Record<string, unknown>,
	onEdit: (entitlementId: string) => void,
	onDelete: (entitlementId: string) => void,
	translate: (key: string) => string,
) {
	const entitlementId = row.id as string;
	return (
		<Group gap='xs' justify='flex-end'>
			<Tooltip label={translate('nikki.general.actions.edit')}>
				<ActionIcon
					variant='subtle'
					color='gray'
					onClick={() => onEdit(entitlementId)}
				>
					<IconEdit size={16} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label={translate('nikki.general.actions.delete')}>
				<ActionIcon
					variant='subtle'
					color='red'
					onClick={() => onDelete(entitlementId)}
				>
					<IconTrash size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
}

export const EntitlementTable: React.FC<EntitlementTableProps> = ({
	columns,
	data,
	resourcesData,
	actionsData,
	isLoading,
	schema,
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	const resourceMap = React.useMemo(() => {
		const map = new Map<string, string>();
		resourcesData.forEach((r) => {
			map.set(r.id, r.name);
		});
		return map;
	}, [resourcesData]);

	const actionMap = React.useMemo(() => {
		const map = new Map<string, string>();
		actionsData.forEach((a) => {
			map.set(a.id, a.name);
		});
		return map;
	}, [actionsData]);

	return (
		<AutoTable
			columns={columns}
			data={data}
			schema={schema}
			isLoading={isLoading}
			columnRenderers={{
				name: (row) => renderNameColumn(row, onViewDetail),
				resourceId: (row) => renderResourceIdColumn(row, resourceMap, translate),
				actionId: (row) => renderActionIdColumn(row, actionMap, translate),
				actions: (row) => renderActionsColumn(row, onEdit, onDelete, translate),
			}}
		/>
	);
};

