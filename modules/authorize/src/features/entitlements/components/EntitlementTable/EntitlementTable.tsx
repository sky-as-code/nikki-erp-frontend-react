import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	renderNameColumn,
	renderResourceIdColumn,
	renderActionIdColumn,
	renderActionsColumn,
} from './renderColumns';

import type { Action } from '@/features/actions';
import type { Resource } from '@/features/resources';


export interface EntitlementTableProps extends AutoTableProps {
	resourcesData: Resource[];
	actionsData: Action[];
	onViewDetail: (entitlementId: string) => void;
	onEdit: (entitlementId: string) => void;
	onDelete: (entitlementId: string) => void;
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
		resourcesData?.forEach((r) => {
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

