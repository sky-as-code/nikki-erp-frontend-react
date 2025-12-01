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

import { Entitlement } from '../../types';


export interface EntitlementTableProps {
	columns: string[];
	entitlements: Entitlement[];
	isLoading: boolean;
	schema: ModelSchema;
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
	entitlements,
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
			data={entitlements as unknown as Record<string, unknown>[]}
			schema={schema}
			isLoading={isLoading}
			columnRenderers={{
				name: (row) => renderNameColumn(row, onViewDetail),
				actions: (row) => renderActionsColumn(row, onEdit, onDelete, translate),
			}}
		/>
	);
};

