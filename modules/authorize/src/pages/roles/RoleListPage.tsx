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
	roleActions,
	selectGroupList,
	selectRoleState,
	selectUserList,
} from '@/appState';
import { RoleTable, roleSchema, useRoleDelete } from '@/features/roles';
import { useAuthorizePermissions } from '@/hooks/useAuthorizePermissions';


// eslint-disable-next-line max-lines-per-function
function RoleListPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { roles, isLoadingList } = useMicroAppSelector(selectRoleState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { orgSlug } = useActiveOrgModule();
	const activeOrg = useActiveOrgWithDetails();
	const globalSlug = GLOBAL_CONTEXT_SLUG;
	const isGlobalContext = orgSlug === globalSlug;
	const currentOrgId = activeOrg?.id;

	const users = useMicroAppSelector(selectUserList);
	const groups = useMicroAppSelector(selectGroupList);
	const deleteHandler = useRoleDelete(roles, dispatch);
	const permissions = useAuthorizePermissions();

	const columns = ['name', 'description', 'ownerType', 'ownerRef', 'isRequestable', 'isRequiredAttachment', 'isRequiredComment', 'entitlementsCount', 'orgDisplayName', 'actions'];
	const schema = roleSchema as ModelSchema;

	React.useEffect(() => {
		if (isGlobalContext) {
			dispatch(roleActions.listRoles({}));
		}
		else {
			dispatch(roleActions.listRoles({ orgId: currentOrgId, includeDomainInOrg: true }));
		}
		if (users.length === 0) {
			dispatch(identityActions.listUsers());
		}
		if (groups.length === 0) {
			dispatch(identityActions.listGroups());
		}
	}, [dispatch, users.length, groups.length, isGlobalContext, currentOrgId]);

	const handleViewDetail = React.useCallback((roleId: string) => {
		navigate(roleId);
	}, [navigate]);

	const handleEdit = React.useCallback((roleId: string) => {
		navigate(roleId);
	}, [navigate]);

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		if (isGlobalContext) {
			dispatch(roleActions.listRoles({}));
		}
		else {
			dispatch(roleActions.listRoles({ orgId: currentOrgId, includeDomainInOrg: true }));
		}
	}, [dispatch, isGlobalContext, currentOrgId]);

	const canMutateRowInContext = React.useCallback((row: Record<string, unknown>) => {
		if (isGlobalContext) return true;
		const rowOrg = row.org as { id?: string } | undefined;
		const rowOrgId = (row.orgId as string | undefined) ?? rowOrg?.id;
		return Boolean(currentOrgId) && rowOrgId === currentOrgId;
	}, [isGlobalContext, currentOrgId]);

	return (
		<>
			<Stack gap='md'>
				<Headers titleKey='nikki.authorize.role.title' />
				<Actions
					onCreate={permissions.role.canCreate ? handleCreate : undefined}
					onRefresh={handleRefresh}
				/>
				<Paper className='p-4'>
					<RoleTable
						columns={columns}
						data={roles}
						isLoading={isLoadingList}
						schema={schema}
						users={users}
						groups={groups}
						onViewDetail={handleViewDetail}
						onEdit={permissions.role.canUpdate ? handleEdit : undefined}
						onDelete={permissions.role.canDelete ? deleteHandler.handleDeleteRequest : undefined}
						canEditRow={canMutateRowInContext}
						canDeleteRow={canMutateRowInContext}
					/>
				</Paper>
			</Stack>

			<ConfirmModal
				opened={deleteHandler.deleteModalOpened}
				onClose={deleteHandler.closeDeleteModal}
				onConfirm={deleteHandler.confirmDelete}
				title={translate('nikki.authorize.role.title_delete')}
				message={
					deleteHandler.roleToDelete
						? translate('nikki.general.messages.delete_confirm_name', { name: deleteHandler.roleToDelete.name })
						: translate('nikki.general.messages.delete_confirm')
				}
				cancelLabel={translate('nikki.general.actions.cancel')}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
}

const RoleListPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.role.title');
	}, [translate]);
	return <RoleListPageBody />;
};

export const RoleListPage: React.FC = RoleListPageWithTitle;
