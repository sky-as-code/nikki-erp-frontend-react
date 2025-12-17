import { Paper, Stack } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	actionActions,
	entitlementActions,
	resourceActions,
	selectActionState,
	selectEntitlementState,
	selectResourceState,
} from '@/appState';
import {
	EntitlementListActions,
	EntitlementListHeader,
	EntitlementTable,
} from '@/features/entitlements/components';
import entitlementSchema from '@/features/entitlements/entitlement-schema.json';
import { Entitlement } from '@/features/entitlements/types';

import { useUIState } from '../../../../shell/src/context/UIProviders';


function useEntitlementDeleteHandler(entitlements: Entitlement[], dispatch: AuthorizeDispatch) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [entitlementToDelete, setEntitlementToDelete] = React.useState<Entitlement | null>(null);

	const handleDeleteRequest = React.useCallback((entitlementId: string) => {
		const entitlement = entitlements.find((entry) => entry.id === entitlementId);
		if (!entitlement) return;
		setEntitlementToDelete(entitlement);
		setDeleteModalOpened(true);
	}, [entitlements]);

	const confirmDelete = React.useCallback(() => {
		if (!entitlementToDelete) return;
		dispatch(entitlementActions.deleteEntitlement(entitlementToDelete.id)).then((result) => {
			if (result.meta.requestStatus === 'fulfilled') {
				notification.showInfo(
					translate('nikki.authorize.entitlement.messages.delete_success', { name: entitlementToDelete.name }),
					translate('nikki.general.messages.success'),
				);
				dispatch(entitlementActions.listEntitlements());
			}
			else {
				const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.delete_failed');
				notification.showError(errorMessage, translate('nikki.general.messages.error'));
			}
			setDeleteModalOpened(false);
			setEntitlementToDelete(null);
		});
	}, [dispatch, entitlementToDelete, notification, translate]);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setEntitlementToDelete(null);
	}, []);

	return { deleteModalOpened, entitlementToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

function EntitlementListPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { entitlements, isLoadingList } = useMicroAppSelector(selectEntitlementState);
	const { resources } = useMicroAppSelector(selectResourceState);
	const { actions } = useMicroAppSelector(selectActionState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const deleteHandler = useEntitlementDeleteHandler(entitlements, dispatch);

	const columns = ['name', 'description', 'actionId', 'resourceId', 'rolesCount', 'actions'];
	const schema = entitlementSchema as ModelSchema;

	React.useEffect(() => {
		dispatch(entitlementActions.listEntitlements());
		if (resources.length === 0) {
			dispatch(resourceActions.listResources());
		}
		if (actions.length === 0) {
			dispatch(actionActions.listActions(undefined));
		}
	}, [dispatch, resources.length, actions.length]);

	const handleViewDetail = React.useCallback((entitlementId: string) => {
		navigate(entitlementId);
	}, [navigate]);

	const handleEdit = React.useCallback((entitlementId: string) => {
		navigate(entitlementId);
	}, [navigate]);

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(entitlementActions.listEntitlements());
	}, [dispatch]);

	return (
		<>
			<Stack gap='md'>
				<EntitlementListHeader />
				<EntitlementListActions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
				/>
				<Paper className='p-4'>
					<EntitlementTable
						columns={columns}
						data={entitlements}
						resourcesData={resources}
						actionsData={actions}
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
				title={translate('nikki.authorize.entitlement.title_delete')}
				message={
					deleteHandler.entitlementToDelete
						? translate('nikki.general.messages.delete_confirm_name', { name: deleteHandler.entitlementToDelete.name })
						: translate('nikki.general.messages.delete_confirm')
				}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
}

const EntitlementListPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.entitlement.title');
	}, [translate]);
	return <EntitlementListPageBody />;
};

export const EntitlementListPage: React.FC = EntitlementListPageWithTitle;
