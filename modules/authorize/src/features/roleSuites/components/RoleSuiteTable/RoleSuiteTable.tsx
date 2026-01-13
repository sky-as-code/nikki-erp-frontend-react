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



export interface RoleSuiteTableProps extends AutoTableProps {
	onViewDetail: (roleSuiteId: string) => void;
	onEdit: (roleSuiteId: string) => void;
	onDelete: (roleSuiteId: string) => void;
}

function renderNameColumn(
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

function renderOrgDisplayNameColumn(row: Record<string, unknown>) {
	const orgDisplayName = row.orgDisplayName as string | undefined;
	return <Text>{orgDisplayName || '-'}</Text>;
}

function renderActionsColumn(
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

export const RoleSuiteTable: React.FC<RoleSuiteTableProps> = ({
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
				orgDisplayName: (row) => renderOrgDisplayNameColumn(row),
				actions: (row) => renderActionsColumn(row, onEdit, onDelete, translate),
			}}
		/>
	);
};

