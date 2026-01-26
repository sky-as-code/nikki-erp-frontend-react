import { Paper, Stack } from '@mantine/core';
import { ConfirmModal, Headers, Actions } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	identityActions,
	roleSuiteActions,
	selectGroupList,
	selectRoleSuiteState,
	selectUserList,
} from '@/appState';
import { RoleSuiteTable, roleSuiteSchema, useRoleSuiteDelete } from '@/features/roleSuites';


function RoleSuiteListPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { roleSuites, isLoadingList } = useMicroAppSelector(selectRoleSuiteState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const users = useMicroAppSelector(selectUserList);
	const groups = useMicroAppSelector(selectGroupList);
	const deleteHandler = useRoleSuiteDelete(roleSuites, dispatch);

	const columns = [
		'name',
		'description',
		'ownerType',
		'ownerRef',
		'isRequestable',
		'isRequiredAttachment',
		'isRequiredComment',
		'orgDisplayName',
		'actions',
	];
	const schema = roleSuiteSchema as ModelSchema;

	React.useEffect(() => {
		dispatch(roleSuiteActions.listRoleSuites());
		if (users.length === 0) {
			dispatch(identityActions.listUsers());
		}
		if (groups.length === 0) {
			dispatch(identityActions.listGroups());
		}
	}, [dispatch, users.length, groups.length]);

	const handleViewDetail = React.useCallback((roleSuiteId: string) => {
		navigate(roleSuiteId);
	}, [navigate]);

	const handleEdit = React.useCallback((roleSuiteId: string) => {
		navigate(roleSuiteId);
	}, [navigate]);

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(roleSuiteActions.listRoleSuites());
	}, [dispatch]);

	return (
		<>
			<Stack gap='md'>
				<Headers titleKey='nikki.authorize.role_suite.title' />
				<Actions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
				/>
				<Paper className='p-4'>
					<RoleSuiteTable
						columns={columns}
						data={roleSuites}
						isLoading={isLoadingList}
						schema={schema}
						users={users}
						groups={groups}
						onViewDetail={handleViewDetail}
						onEdit={handleEdit}
						onDelete={deleteHandler.handleDeleteRequest}
					/>
				</Paper>
			</Stack>

			<ConfirmModal
				opened={deleteHandler.deleteModalOpened}
				onClose={deleteHandler.closeDeleteModal}
				onConfirm={deleteHandler.confirmDelete}
				title={translate('nikki.authorize.role_suite.title_delete')}
				message={
					deleteHandler.roleSuiteToDelete
						? translate('nikki.general.messages.delete_confirm_name', { name: deleteHandler.roleSuiteToDelete.name })
						: translate('nikki.general.messages.delete_confirm')
				}
				cancelLabel={translate('nikki.general.actions.cancel')}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
}

const RoleSuiteListPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.role_suite.title');
	}, [translate]);
	return <RoleSuiteListPageBody />;
};

export const RoleSuiteListPage: React.FC = RoleSuiteListPageWithTitle;

