import { Paper, Stack } from '@mantine/core';
import { GLOBAL_CONTEXT_SLUG } from '@nikkierp/shell/constants';
import { useActiveOrgWithDetails } from '@nikkierp/shell/userContext';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
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
	selectOrgList,
	selectRoleSuiteState,
	selectUserList,
} from '@/appState';
import { RoleSuiteTable, roleSuiteSchema, useRoleSuiteDelete } from '@/features/roleSuites';
import { useAuthorizePermissions } from '@/hooks/useAuthorizePermissions';


// eslint-disable-next-line max-lines-per-function
function RoleSuiteListPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { roleSuites, isLoadingList } = useMicroAppSelector(selectRoleSuiteState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { orgSlug } = useActiveOrgModule();
	const activeOrg = useActiveOrgWithDetails();
	const globalSlug = GLOBAL_CONTEXT_SLUG;
	const isGlobalContext = orgSlug === globalSlug;
	const currentOrgId = activeOrg?.id;
	const users = useMicroAppSelector(selectUserList);
	const groups = useMicroAppSelector(selectGroupList);
	const orgs = useMicroAppSelector(selectOrgList);
	const deleteHandler = useRoleSuiteDelete(roleSuites, dispatch);
	const permissions = useAuthorizePermissions();

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
		if (isGlobalContext) {
			dispatch(roleSuiteActions.listRoleSuites({}));
		}
		else {
			dispatch(roleSuiteActions.listRoleSuites({ orgId: currentOrgId, includeDomainInOrg: true }));
		}
		if (users.length === 0) {
			dispatch(identityActions.listUsers());
		}
		if (groups.length === 0) {
			dispatch(identityActions.listGroups());
		}
		if (orgs.length === 0) {
			dispatch(identityActions.listOrgs());
		}
	}, [dispatch, users.length, groups.length, orgs.length, isGlobalContext, currentOrgId]);

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
		if (isGlobalContext) {
			dispatch(roleSuiteActions.listRoleSuites({}));
		}
		else {
			dispatch(roleSuiteActions.listRoleSuites({ orgId: currentOrgId, includeDomainInOrg: true }));
		}
	}, [dispatch, isGlobalContext, currentOrgId]);

	const canMutateRowInContext = React.useCallback((row: Record<string, unknown>) => {
		if (isGlobalContext) return true;
		const rowOrgId = row.orgId as string | undefined;
		return Boolean(currentOrgId) && rowOrgId === currentOrgId;
	}, [isGlobalContext, currentOrgId]);

	return (
		<>
			<Stack gap='md'>
				<Headers titleKey='nikki.authorize.role_suite.title' />
				<Actions
					onCreate={permissions.roleSuite.canCreate ? handleCreate : undefined}
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
						orgs={orgs}
						onViewDetail={handleViewDetail}
						onEdit={permissions.roleSuite.canUpdate ? handleEdit : undefined}
						onDelete={permissions.roleSuite.canDelete ? deleteHandler.handleDeleteRequest : undefined}
						canEditRow={canMutateRowInContext}
						canDeleteRow={canMutateRowInContext}
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

