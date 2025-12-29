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
	resourceActions,
	selectActionState,
	selectResourceState,
} from '@/appState';
import actionSchema from '@/features/actions/action-schema.json';
import {
	ActionListActions,
	ActionListHeader,
	ActionTable,
} from '@/features/actions/components';

import { useUIState } from '../../../../shell/src/context/UIProviders';

import type { Action } from '@/features/actions';


function useActionDeleteHandler(actions: Action[], dispatch: AuthorizeDispatch) {
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [actionToDelete, setActionToDelete] = React.useState<Action | null>(null);

	const handleDeleteRequest = React.useCallback((actionId: string) => {
		const action = actions.find((entry) => entry.id === actionId);
		if (!action) return;
		setActionToDelete(action);
		setDeleteModalOpened(true);
	}, [actions]);

	const confirmDelete = React.useCallback(() => {
		if (!actionToDelete) return;
		dispatch(actionActions.deleteAction({
			actionId: actionToDelete.id,
		})).then((result) => {
			if (result.meta.requestStatus === 'fulfilled') {
				notification.showInfo(
					translate('nikki.authorize.action.messages.delete_success', { name: actionToDelete.name }),
					translate('nikki.general.messages.success'),
				);

				dispatch(actionActions.listActions(undefined));
			}
			else {
				const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.delete_failed');
				notification.showError(errorMessage, translate('nikki.general.messages.error'));
			}

			setDeleteModalOpened(false);
			setActionToDelete(null);
		});
	}, [dispatch, actionToDelete, notification, translate]);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setActionToDelete(null);
	}, []);

	return { deleteModalOpened, actionToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

function ActionListPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { actions, isLoadingList } = useMicroAppSelector(selectActionState);
	const { resources } = useMicroAppSelector(selectResourceState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const deleteHandler = useActionDeleteHandler(actions, dispatch);

	const columns = ['name', 'description', 'resourceId', 'actions'];
	const schema = actionSchema as ModelSchema;

	React.useEffect(() => {
		dispatch(actionActions.listActions(undefined));
		if (resources.length === 0) {
			dispatch(resourceActions.listResources());
		}
	}, [dispatch, resources.length]);

	const handleViewDetail = React.useCallback((actionId: string) => {
		const action = actions.find((a: Action) => a.id === actionId);
		if (action) {
			navigate(`${action.id}`);
		}
	}, [navigate, actions]);

	const handleEdit = React.useCallback((actionId: string) => {
		const action = actions.find((a: Action) => a.id === actionId);
		if (action) {
			navigate(`${action.id}`);
		}
	}, [navigate, actions]);

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(actionActions.listActions(undefined));
	}, [dispatch]);

	return (
		<>
			<Stack gap='lq'>
				<ActionListHeader />
				<ActionListActions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
				/>
				<Paper className='p-4'>
					<ActionTable
						columns={columns}
						data={actions}
						resourcesData={resources}
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
				title={translate('nikki.authorize.action.title_delete')}
				message={
					deleteHandler.actionToDelete
						? translate('nikki.general.messages.delete_confirm_name', { name: deleteHandler.actionToDelete.name })
						: translate('nikki.general.messages.delete_confirm')
				}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
}

const ActionListPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.action.title');
	}, [translate]);
	return <ActionListPageBody />;
};

export const ActionListPage: React.FC = ActionListPageWithTitle;
