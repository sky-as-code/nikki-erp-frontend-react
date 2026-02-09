import { ActionIcon, Badge, Tooltip, Text, Group } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';


const RESOURCE_TYPE_CONFIG: Record<string, { i18nKey: string; color: string }> = {
	nikki_application: {
		i18nKey: 'nikki.authorize.resource.fields.resource_type.nikki_application',
		color: 'indigo',
	},
	custom: {
		i18nKey: 'nikki.authorize.resource.fields.resource_type.custom',
		color: 'dark',
	},
};

const SCOPE_TYPE_CONFIG: Record<string, { i18nKey: string; color: string }> = {
	domain: {
		i18nKey: 'nikki.authorize.resource.fields.scope_type.domain',
		color: 'grape',
	},
	org: {
		i18nKey: 'nikki.authorize.resource.fields.scope_type.org',
		color: 'teal',
	},
	hierarchy: {
		i18nKey: 'nikki.authorize.resource.fields.scope_type.hierarchy',
		color: 'dark',
	},
	private: {
		i18nKey: 'nikki.authorize.resource.fields.scope_type.private',
		color: 'gray',
	},
};


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

export function renderResourceTypeColumn(
	row: Record<string, unknown>,
	translate: (key: string) => string,
) {
	const value = (row.resourceType as string) ?? '';
	const config = RESOURCE_TYPE_CONFIG[value];
	const label = config ? translate(config.i18nKey) : value;
	const color = config?.color ?? 'gray';
	return (
		<Badge color={color} variant='light' size='lg' tt='none'>
			{label}
		</Badge>
	);
}

export function renderScopeTypeColumn(
	row: Record<string, unknown>,
	translate: (key: string) => string,
) {
	const value = (row.scopeType as string) ?? '';
	const config = SCOPE_TYPE_CONFIG[value];
	const label = config ? translate(config.i18nKey) : value;
	const color = config?.color ?? 'gray';
	return (
		<Badge color={color} variant='light' size='lg' tt='none'>
			{label}
		</Badge>
	);
}

export function renderActionsColumn(
	row: Record<string, unknown>,
	onEdit: ((resourceName: string) => void) | undefined,
	onDelete: ((resourceId: string) => void) | undefined,
	translate: (key: string) => string,
) {
	return (
		<Group gap='xs' justify='flex-end'>
			{onEdit && (
				<Tooltip label={translate('nikki.general.actions.edit')}>
					<ActionIcon variant='subtle' color='gray' onClick={() => onEdit(row.name as string)}>
						<IconEdit size={16} />
					</ActionIcon>
				</Tooltip>
			)}
			{onDelete && (
				<Tooltip label={translate('nikki.general.actions.delete')}>
					<ActionIcon variant='subtle' color='red' onClick={() => onDelete(row.id as string)}>
						<IconTrash size={16} />
					</ActionIcon>
				</Tooltip>
			)}
		</Group>
	);
}
