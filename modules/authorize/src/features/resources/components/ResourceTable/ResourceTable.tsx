import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { renderNameColumn, renderActionsColumn } from './renderColumns';


export interface ResourceTableProps extends AutoTableProps {
	onViewDetail: (resourceId: string) => void;
	onEdit: (resourceId: string) => void;
	onDelete: (resourceId: string) => void;
}

export const ResourceTable: React.FC<ResourceTableProps> = ({
	columns,
	data,
	schema,
	isLoading,
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
				actions: (row) => renderActionsColumn(row, onEdit, onDelete, translate),
			}}
		/>
	);
};
