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

import type { Group as IdentityGroup, Org } from '@/features/identities';
import type { User } from '@/features/identities';


export interface RoleSuiteTableProps extends AutoTableProps {
	users?: User[];
	groups?: IdentityGroup[];
	orgs?: Org[];
	onViewDetail: (roleSuiteId: string) => void;
	onEdit?: (roleSuiteId: string) => void;
	onDelete?: (roleSuiteId: string) => void;
}

export const RoleSuiteTable: React.FC<RoleSuiteTableProps> = ({
	columns,
	data,
	isLoading,
	schema,
	users = [],
	groups = [],
	orgs = [],
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

	const orgMap = React.useMemo(() => {
		const map = new Map<string, string>();
		orgs.forEach((o) => {
			map.set(o.id, o.displayName);
		});
		return map;
	}, [orgs]);

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
				orgDisplayName: (row) => renderOrgNameColumn(row, orgMap),
				actions: (row) => renderActionsColumn(row, onEdit, onDelete, translate),
			}}
		/>
	);
};

