import { Paper, Stack } from '@mantine/core';
import { ConfirmModal, Headers, Actions } from '@nikkierp/ui/components';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';


import { AuthorizeDispatch } from '@/appState';
import { ActionTable, actionSchema, useActionDelete, useActionList } from '@/features/actions';


function ActionListPageBody(): React.ReactNode {
	const { t: translate } = useTranslation();
	const { actions, isLoadingList } = useActionList.data();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const deleteHandler = useActionDelete(actions, dispatch);
	const { handleViewDetail, handleEdit, handleCreate, handleRefresh } = useActionList.handlers(actions);

	const columns = ['name', 'description', 'resource', 'actions'];
	const schema = actionSchema as ModelSchema;

	return (
		<>
			<Stack gap='md'>
				<Headers titleKey='nikki.authorize.action.title' />
				<Actions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
				/>
				<Paper className='p-4'>
					<ActionTable
						columns={columns}
						data={actions}
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
				cancelLabel={translate('nikki.general.actions.cancel')}
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
