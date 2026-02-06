import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	renderNameColumn,
	renderResourceIdColumn,
	renderActionIdColumn,
	renderActionsColumn,
} from './renderColumns';

import { Entitlement } from '@/features/entitlements/types';


export interface EntitlementTableProps extends AutoTableProps {
	onViewDetail: (entitlementId: string) => void;
	onEdit?: (entitlementId: string) => void;
	onDelete?: (entitlementId: string) => void;
}

export const EntitlementTable: React.FC<EntitlementTableProps> = ({
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
				resourceId: (row) => renderResourceIdColumn(row as unknown as Entitlement, translate),
				actionId: (row) => renderActionIdColumn(row as unknown as Entitlement, translate),
				actions: (row) => renderActionsColumn(row, onEdit, onDelete, translate),
			}}
		/>
	);
};

