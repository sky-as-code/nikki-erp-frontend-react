import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { IdentityDispatch, groupActions, selectGroupState } from '../../appState';
import { ButtonListPage } from '../../components/ButtonListPage';
import { HeaderListPage } from '../../components/HeaderListPage/HeaderListPage';
import { GroupTable } from '../../features/groups/components';
import groupSchema from '../../schemas/group-schema.json';


function useGroupListHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { orgSlug } = useParams<{ orgSlug: string }>();

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		if (orgSlug) {
			dispatch(groupActions.listGroups(orgSlug));
		}
	}, [dispatch, orgSlug]);

	React.useEffect(() => {
		if (orgSlug) {
			dispatch(groupActions.listGroups(orgSlug));
		}
	}, [dispatch, orgSlug]);

	return {
		handleCreate,
		handleRefresh,
	};
}

export function GroupListPageBody(): React.ReactNode {
	const { groups, isLoadingList } = useMicroAppSelector(selectGroupState);
	const schema = groupSchema as ModelSchema;
	const columns = ['id', 'name', 'description', 'createdAt', 'updatedAt'];

	const { handleCreate, handleRefresh } = useGroupListHandlers();
	return (
		<Stack gap='md'>
			<HeaderListPage
				title='nikki.identity.group.title'
				searchPlaceholder='nikki.identity.group.searchPlaceholder'
			/>
			<ButtonListPage
				onCreate={handleCreate}
				onRefresh={handleRefresh}
			/>
			<GroupTable
				columns={columns}
				groups={groups}
				isLoading={isLoadingList}
				schema={schema}
			/>
		</Stack>
	);
}

export const GroupListPage: React.FC = withWindowTitle('Group List', GroupListPageBody);
