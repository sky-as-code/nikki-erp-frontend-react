import { Paper, Stack } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	roleSuiteActions,
	selectRoleSuiteState,
} from '@/appState';
import {
	RoleSuiteListActions,
	RoleSuiteListHeader,
	RoleSuiteTable,
} from '@/features/roleSuite/components';
import roleSuiteSchema from '@/features/roleSuite/roleSuite-schema.json';

import { useUIState } from '../../../../shell/src/context/UIProviders';

import type { RoleSuite } from '@/features/roleSuite';


function useRoleSuiteDeleteHandler(roleSuites: RoleSuite[], dispatch: AuthorizeDispatch) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [roleSuiteToDelete, setRoleSuiteToDelete] = React.useState<RoleSuite | null>(null);

	const handleDeleteRequest = React.useCallback((roleSuiteId: string) => {
		const roleSuite = roleSuites.find((entry) => entry.id === roleSuiteId);
		if (!roleSuite) return;
		setRoleSuiteToDelete(roleSuite);
		setDeleteModalOpened(true);
	}, [roleSuites]);

	const confirmDelete = React.useCallback(() => {
		if (!roleSuiteToDelete) return;
		dispatch(roleSuiteActions.deleteRoleSuite({
			id: roleSuiteToDelete.id,
		})).then((result) => {
			if (result.meta.requestStatus === 'fulfilled') {
				notification.showInfo(
					translate('nikki.authorize.role_suite.messages.delete_success', { name: roleSuiteToDelete.name }),
					translate('nikki.general.messages.success'),
				);
				dispatch(roleSuiteActions.listRoleSuites());
			}
			else {
				const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.delete_failed');
				notification.showError(errorMessage, translate('nikki.general.messages.error'));
			}
			setDeleteModalOpened(false);
			setRoleSuiteToDelete(null);
		});
	}, [dispatch, roleSuiteToDelete, notification, translate]);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setRoleSuiteToDelete(null);
	}, []);

	return { deleteModalOpened, roleSuiteToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

function RoleSuiteListPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { roleSuites, isLoadingList } = useMicroAppSelector(selectRoleSuiteState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const deleteHandler = useRoleSuiteDeleteHandler(roleSuites, dispatch);

	const columns = ['name', 'description', 'ownerType', 'ownerRef', 'isRequestable', 'orgId', 'rolesCount', 'actions'];
	const schema = roleSuiteSchema as ModelSchema;

	React.useEffect(() => {
		dispatch(roleSuiteActions.listRoleSuites());
	}, [dispatch]);

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
				<RoleSuiteListHeader />
				<RoleSuiteListActions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
				/>
				<Paper className='p-4'>
					<RoleSuiteTable
						columns={columns}
						roleSuites={roleSuites}
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
				title={translate('nikki.authorize.role_suite.title_delete')}
				message={
					deleteHandler.roleSuiteToDelete
						? translate('nikki.general.messages.delete_confirm_name', { name: deleteHandler.roleSuiteToDelete.name })
						: translate('nikki.general.messages.delete_confirm')
				}
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

