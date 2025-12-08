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

import { Role } from '@/features/roles/types';


export interface RoleTableProps {
	columns: string[];
	roles: Role[];
	isLoading: boolean;
	schema: ModelSchema;
	onViewDetail: (roleId: string) => void;
	onEdit: (roleId: string) => void;
	onDelete: (roleId: string) => void;
}

function renderNameColumn(
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

function renderActionsColumn(
	row: Record<string, unknown>,
	onEdit: (roleId: string) => void,
	onDelete: (roleId: string) => void,
	translate: (key: string) => string,
) {
	const roleId = row.id as string;
	return (
		<Group gap='xs' justify='flex-end'>
			<Tooltip label={translate('nikki.general.actions.edit')}>
				<ActionIcon
					variant='subtle'
					color='gray'
					onClick={() => onEdit(roleId)}
				>
					<IconEdit size={16} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label={translate('nikki.general.actions.delete')}>
				<ActionIcon
					variant='subtle'
					color='red'
					onClick={() => onDelete(roleId)}
				>
					<IconTrash size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
}

export const RoleTable: React.FC<RoleTableProps> = ({
	columns,
	roles,
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
			data={roles as unknown as Record<string, unknown>[]}
			schema={schema}
			isLoading={isLoading}
			columnRenderers={{
				name: (row) => renderNameColumn(row, onViewDetail),
				actions: (row) => renderActionsColumn(row, onEdit, onDelete, translate),
			}}
		/>
	);
};

