import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useNavigate } from 'react-router';

import { IdentityDispatch, organizationActions, selectOrganizationState } from '../../appState';
import { HeaderListPage } from '../../components/HeaderListPage/HeaderListPage';
import { ListActionListPage } from '../../components/ListActionBar';
import { OrganizationTable } from '../../features/organization/components';
import organizationSchema from '../../schemas/organization-schema.json';


function useOrganizationListHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(organizationActions.listOrganizations());
	}, [dispatch]);

	React.useEffect(() => {
		dispatch(organizationActions.listOrganizations());
	}, [dispatch]);

	return {
		handleCreate,
		handleRefresh,
	};
}

export function OrganizationListPageBody(): React.ReactElement {
	const { organizations, isLoadingList } = useMicroAppSelector(selectOrganizationState);
	const schema = organizationSchema as ModelSchema;
	const columns = ['displayName', 'legalName', 'phoneNumber', 'status', 'createdAt', 'updatedAt'];

	const { handleCreate, handleRefresh } = useOrganizationListHandlers();

	return (
		<Stack gap='md'>
			<HeaderListPage
				title='nikki.identity.organization.title'
				searchPlaceholder='nikki.identity.organization.searchPlaceholder'
			/>
			<ListActionListPage
				onCreate={handleCreate}
				onRefresh={handleRefresh}
			/>
			<OrganizationTable
				columns={columns}
				organizations={organizations}
				isLoading={isLoadingList}
				schema={schema}
			/>
		</Stack>
	);
}

export const OrganizationListPage: React.FC = withWindowTitle('Organization List', OrganizationListPageBody);
