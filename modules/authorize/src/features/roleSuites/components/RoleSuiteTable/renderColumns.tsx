import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';


const OWNER_TYPE_CONFIG: Record<string, { i18nKey: string; color: string }> = {
	user: {
		i18nKey: 'nikki.authorize.role_suite.fields.owner_type.user',
		color: 'blue',
	},
	group: {
		i18nKey: 'nikki.authorize.role_suite.fields.owner_type.group',
		color: 'violet',
	},
};


export function renderNameColumn(
	row: Record<string, unknown>,
	onViewDetail: (roleSuiteId: string) => void,
) {
	const roleSuiteId = row.id as string;
	return (
		<Text
			style={{ cursor: 'pointer', textDecoration: 'underline' }}
			onClick={(e) => {
				e.preventDefault();
				onViewDetail(roleSuiteId);
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
	const org = row.org as { name?: string; displayName?: string } | undefined;
	const orgName = org?.name || org?.displayName || row.orgDisplayName as string | undefined;
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
	onEdit: (roleSuiteId: string) => void,
	onDelete: (roleSuiteId: string) => void,
	translate: (key: string) => string,
) {
	const roleSuiteId = row.id as string;
	return (
		<Group gap='xs' justify='flex-end'>
			<Tooltip label={translate('nikki.general.actions.edit')}>
				<ActionIcon
					variant='subtle'
					color='gray'
					onClick={() => onEdit(roleSuiteId)}
				>
					<IconEdit size={16} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label={translate('nikki.general.actions.delete')}>
				<ActionIcon
					variant='subtle'
					color='red'
					onClick={() => onDelete(roleSuiteId)}
				>
					<IconTrash size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
}
