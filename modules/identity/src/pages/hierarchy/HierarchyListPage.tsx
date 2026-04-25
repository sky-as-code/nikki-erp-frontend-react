import { Group, Paper, SegmentedControl } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectHierarchyList } from '../../appState/hierarchy';
import { selectSearchUsers } from '../../appState/user';
import { ListPageLayout } from '../../components/ListPageLayout';
import { HierarchyTable, HierarchyOrgChart } from '../../features/hierarchy/components';
import { useHierarchyListHandlers } from '../../features/hierarchy/hooks';
import { useIdentityPermissions } from '../../hooks';


export function HierarchyListPageBody(): React.ReactNode {
	const listHierarchy = useMicroAppSelector(selectHierarchyList);
	const listUser = useMicroAppSelector(selectSearchUsers);
	const [view, setView] = React.useState<'table' | 'orgChart'>('table');
	const { t } = useTranslation();
	const isLoading = listHierarchy.status === 'pending' || listUser.status === 'pending';
	const permissions = useIdentityPermissions();

	const { handleCreate, handleRefresh } = useHierarchyListHandlers();

	return (
		<ListPageLayout
			title={t('nikki.identity.hierarchy.title')}
			searchPlaceholder={t('nikki.identity.hierarchy.searchPlaceholder')}
			onCreate={permissions.orgUnit.canCreate ? handleCreate : undefined}
			onRefresh={handleRefresh}
		>
			{() => (
				<>
					<Group justify='flex-end'>
						<SegmentedControl
							value={view}
							onChange={(value) => setView(value as 'table' | 'orgChart')}
							data={[
								{ label: 'Table', value: 'table' },
								{ label: 'Org Chart', value: 'orgChart' },
							]}
						/>
					</Group>
					{view === 'table' ? (
						<HierarchyTable
							hierarchies={listHierarchy?.data}
							isLoading={isLoading}
						/>
					) : (
						<Paper withBorder>
							<HierarchyOrgChart
								hierarchies={listHierarchy?.data}
								usersByHierarchy={listUser?.data}
							/>
						</Paper>
					)}
				</>
			)}
		</ListPageLayout>
	);
}

export const HierarchyListPage: React.FC = withWindowTitle('Hierarchy List', HierarchyListPageBody);
