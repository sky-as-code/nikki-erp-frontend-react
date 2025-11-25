import { Paper, Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { IdentityDispatch, hierarchyActions, selectHierarchyState, userActions, selectUserState } from '../../appState';
import { HeaderListPage } from '../../components/HeaderListPage/HeaderListPage';
import { HierarchyTable, HierarchyOrgChart, HierarchyListActions } from '../../features/hierarchy/components';
import hierarchySchema from '../../schemas/hierarchy-schema.json';


function useHierarchyListHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { orgSlug } = useParams<{ orgSlug: string }>();

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(hierarchyActions.listHierarchies(orgSlug!));
	}, [dispatch, orgSlug]);

	React.useEffect(() => {
		dispatch(hierarchyActions.listHierarchies(orgSlug!));
	}, [dispatch, orgSlug]);

	React.useEffect(() => {
		dispatch(userActions.listUsers(orgSlug!));
	}, [dispatch, orgSlug]);
	return {
		handleCreate,
		handleRefresh,
	};
}

export function HierarchyListPageBody(): React.ReactNode {
	const { hierarchies, isLoadingList } = useMicroAppSelector(selectHierarchyState);
	const { users } = useMicroAppSelector(selectUserState);
	const schema = hierarchySchema as ModelSchema;
	const columns = ['id', 'name', 'createdAt', 'updatedAt'];
	const [view, setView] = React.useState<'table' | 'orgChart'>('table');

	const { handleCreate, handleRefresh } = useHierarchyListHandlers();

	return (
		<Stack gap='md'>
			<HeaderListPage
				title='nikki.identity.hierarchy.title'
				searchPlaceholder='nikki.identity.hierarchy.searchPlaceholder'
			/>
			<HierarchyListActions
				onCreate={handleCreate}
				onRefresh={handleRefresh}
				view={view}
				onViewChange={setView}
			/>

			{view === 'table' ? (
				<HierarchyTable
					columns={columns}
					hierarchies={hierarchies}
					isLoading={isLoadingList}
					schema={schema}
				/>
			) : (
				<Paper withBorder>
					<HierarchyOrgChart
						hierarchies={hierarchies}
						usersByHierarchy={users}
					/>
				</Paper>
			)}
		</Stack>
	);
}

export const HierarchyListPage: React.FC = withWindowTitle('Hierarchy List', HierarchyListPageBody);
