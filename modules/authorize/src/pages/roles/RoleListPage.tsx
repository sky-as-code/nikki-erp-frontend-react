import { Paper, Stack } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import {
	AuthorizeDispatch,
	roleActions,
	selectRoleState,
} from '../../appState';
import {
	RoleListActions,
	RoleListHeader,
	RoleTable,
} from '../../features/roles/components';
import roleSchema from '../../features/roles/role-schema.json';
import { Role } from '../../features/roles/types';


function useRoleDeleteHandler(roles: Role[], dispatch: AuthorizeDispatch) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null);

	const handleDeleteRequest = React.useCallback((roleId: string) => {
		const role = roles.find((entry) => entry.id === roleId);
		if (!role) return;
		setRoleToDelete(role);
		setDeleteModalOpened(true);
	}, [roles]);

	const confirmDelete = React.useCallback(() => {
		if (!roleToDelete) return;
		dispatch(roleActions.deleteRole({
			id: roleToDelete.id,
		})).then((result) => {
			if (result.meta.requestStatus === 'fulfilled') {
				notification.showInfo(
					translate('nikki.authorize.role.messages.delete_success', { name: roleToDelete.name }),
					translate('nikki.general.messages.success'),
				);
				dispatch(roleActions.listRoles());
			}
			else {
				const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.delete_failed');
				notification.showError(errorMessage, translate('nikki.general.messages.error'));
			}
			setDeleteModalOpened(false);
			setRoleToDelete(null);
		});
	}, [dispatch, roleToDelete, notification, translate]);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setRoleToDelete(null);
	}, []);

	return { deleteModalOpened, roleToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

function RoleListPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { roles, isLoadingList } = useMicroAppSelector(selectRoleState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const deleteHandler = useRoleDeleteHandler(roles, dispatch);

	const columns = ['name', 'description', 'ownerType', 'ownerRef', 'isRequestable', 'orgId', 'entitlementsCount', 'assignmentsCount', 'actions'];
	const schema = roleSchema as ModelSchema;

	React.useEffect(() => {
		dispatch(roleActions.listRoles());
	}, [dispatch]);

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
		dispatch(roleActions.listRoles());
	}, [dispatch]);

	return (
		<>
			<Stack gap='md'>
				<RoleListHeader />
				<RoleListActions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
				/>
				<Paper className='p-4'>
					<RoleTable
						columns={columns}
						roles={roles}
						isLoading={isLoadingList}
						schema={schema}
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
				title={translate('nikki.authorize.role.title_delete')}
				message={
					deleteHandler.roleToDelete
						? translate('nikki.general.messages.delete_confirm_name', { name: deleteHandler.roleToDelete.name })
						: translate('nikki.general.messages.delete_confirm')
				}
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

