import { Badge, Text } from '@mantine/core';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';

import { ALL_ACTIONS_VALUE, ALL_RESOURCES_VALUE } from '@/features/entitlements/helpers/entitlementFormValidation';


export function renderNameColumn(
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

export function renderResourceIdColumn(
	row: Record<string, unknown>,
	resourceMap: Map<string, string>,
	translate: (key: string) => string,
) {
	const resourceId = row.resourceId as string | undefined;

	if (!resourceId || resourceId === ALL_RESOURCES_VALUE) {
		return (
			<Badge color='yellow' variant='light' size='lg' tt='none'>
				{translate('nikki.authorize.entitlement.fields.resource_all')}
			</Badge>
		);
	}

	const resourceName = resourceMap.get(resourceId) || resourceId;
	return (
		<Badge color='indigo' variant='light' size='lg' tt='none'>
			{resourceName}
		</Badge>
	);
}

export function renderActionIdColumn(
	row: Record<string, unknown>,
	actionMap: Map<string, string>,
	translate: (key: string) => string,
) {
	const actionId = row.actionId as string | undefined;

	if (!actionId || actionId === ALL_ACTIONS_VALUE) {
		return (
			<Badge color='orange' variant='light' size='lg' tt='none'>
				{translate('nikki.authorize.entitlement.fields.action_all')}
			</Badge>
		);
	}

	const actionName = actionMap.get(actionId) || actionId;
	return (
		<Badge color='teal' variant='light' size='lg' tt='none'>
			{actionName}
		</Badge>
	);
}

export function renderActionsColumn(
	row: Record<string, unknown>,
	onEdit: ((entitlementId: string) => void) | undefined,
	onDelete: ((entitlementId: string) => void) | undefined,
	translate: (key: string) => string,
) {
	const entitlementId = row.id as string;
	return (
		<Group gap='xs' justify='flex-end'>
			{onEdit && (
				<Tooltip label={translate('nikki.general.actions.edit')}>
					<ActionIcon
						variant='subtle'
						color='gray'
						onClick={() => onEdit(entitlementId)}
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
						onClick={() => onDelete(entitlementId)}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</Tooltip>
			)}
		</Group>
	);
}