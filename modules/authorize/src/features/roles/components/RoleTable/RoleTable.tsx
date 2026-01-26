import { AutoTable, AutoTableProps } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	renderNameColumn,
	renderOwnerTypeColumn,
	renderOwnerRefColumn,
	renderBooleanColumn,
	renderOrgNameColumn,
	renderActionsColumn,
} from './renderColumns';

import type { Group as IdentityGroup } from '@/features/identities';
import type { User } from '@/features/identities';


export interface RoleTableProps extends AutoTableProps {
	users?: User[];
	groups?: IdentityGroup[];
	onViewDetail: (roleId: string) => void;
	onEdit: (roleId: string) => void;
	onDelete: (roleId: string) => void;
}

export const RoleTable: React.FC<RoleTableProps> = ({
	columns,
	data,
	isLoading,
	schema,
	users = [],
	groups = [],
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	const { t: translate } = useTranslation();

	const userMap = React.useMemo(() => {
		const map = new Map<string, string>();
		users.forEach((u) => {
			map.set(u.id, u.displayName);
		});
		return map;
	}, [users]);

	const groupMap = React.useMemo(() => {
		const map = new Map<string, string>();
		groups.forEach((g) => {
			map.set(g.id, g.name);
		});
		return map;
	}, [groups]);

	return (
		<AutoTable
			columns={columns}
			data={data}
			schema={schema}
			isLoading={isLoading}
			columnRenderers={{
				name: (row) => renderNameColumn(row, onViewDetail),
				ownerType: (row) => renderOwnerTypeColumn(row, translate),
				ownerRef: (row) => renderOwnerRefColumn(row, userMap, groupMap),
				isRequestable: (row) => renderBooleanColumn(row, 'isRequestable', translate),
				isRequiredAttachment: (row) => renderBooleanColumn(row, 'isRequiredAttachment', translate),
				isRequiredComment: (row) => renderBooleanColumn(row, 'isRequiredComment', translate),
				orgDisplayName: (row) => renderOrgNameColumn(row),
				actions: (row) => renderActionsColumn(row, onEdit, onDelete, translate),
			}}
		/>
	);
};

