import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';


const OWNER_TYPE_CONFIG: Record<string, { i18nKey: string; color: string }> = {
	user: {
		i18nKey: 'nikki.authorize.role.fields.owner_type.user',
		color: 'blue',
	},
	group: {
		i18nKey: 'nikki.authorize.role.fields.owner_type.group',
		color: 'violet',
	},
};


export function renderNameColumn(
	row: Record<string, unknown>,
	onViewDetail: (roleId: string) => void,
) {
	const roleId = row.id as string;
	return (
		<Text
			style={{ cursor: 'pointer', textDecoration: 'underline' }}
			onClick={(e) => {
				e.preventDefault();
				onViewDetail(roleId);
			}}
		>
			{String(row.name || '')}
		</Text>
	);
}

export function renderOwnerTypeColumn(
	row: Record<string, unknown>,
	translate: (key: string) => string,
) {
	const value = (row.ownerType as string) ?? '';
	const config = OWNER_TYPE_CONFIG[value];
	const label = config ? translate(config.i18nKey) : value;
	const color = config?.color ?? 'gray';
	return (
		<Badge color={color} variant='light' size='lg' tt='none'>
			{label}
		</Badge>
	);
}

export function renderBooleanColumn(
	row: Record<string, unknown>,
	fieldName: string,
	translate: (key: string) => string,
) {
	const value = row[fieldName] as boolean | undefined;
	const isTrue = value === true;
	const label = isTrue
		? translate('nikki.general.boolean.yes')
		: translate('nikki.general.boolean.no');
	const color = isTrue ? 'green' : 'red';
	return (
		<Badge color={color} variant='light' size='lg' tt='none'>
			{label}
		</Badge>
	);
}

export function renderOrgNameColumn(row: Record<string, unknown>) {
	const org = row.org as { name?: string } | undefined;
	const orgName = org?.name || row.orgDisplayName as string | undefined;
	return <Text>{orgName || '-'}</Text>;
}

export function renderOrgDisplayNameColumn(row: Record<string, unknown>) {
	const org = row.org as { name?: string } | undefined;
	const orgName = org?.name || row.orgDisplayName as string | undefined;
	return <Text>{orgName || '-'}</Text>;
}

export function renderOwnerRefColumn(
	row: Record<string, unknown>,
	userMap: Map<string, string>,
	groupMap: Map<string, string>,
) {
	const ownerType = row.ownerType as 'user' | 'group' | undefined;
	const ownerRef = row.ownerRef as string | undefined;

	if (!ownerRef) {
		return <Text>-</Text>;
	}

	if (ownerType === 'user') {
		const ownerName = userMap.get(ownerRef) || ownerRef;
		return <Text>{ownerName}</Text>;
	}

	if (ownerType === 'group') {
		const ownerName = groupMap.get(ownerRef) || ownerRef;
		return <Text>{ownerName}</Text>;
	}

	const ownerName = userMap.get(ownerRef) || groupMap.get(ownerRef) || ownerRef;
	return <Text>{ownerName}</Text>;
}

export function renderActionsColumn(
	row: Record<string, unknown>,
	onEdit: ((roleId: string) => void) | undefined,
	onDelete: ((roleId: string) => void) | undefined,
	translate: (key: string) => string,
) {
	const roleId = row.id as string;
	return (
		<Group gap='xs' justify='flex-end'>
			{onEdit && (
				<Tooltip label={translate('nikki.general.actions.edit')}>
					<ActionIcon
						variant='subtle'
						color='gray'
						onClick={() => onEdit(roleId)}
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
						onClick={() => onDelete(roleId)}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</Tooltip>
			)}
		</Group>
	);
}