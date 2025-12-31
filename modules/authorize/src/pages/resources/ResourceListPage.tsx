import { Paper, Stack } from '@mantine/core';
import { ConfirmModal, Headers, Actions } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	resourceActions,
	selectResourceState,
} from '@/appState';
import {
	ResourceTable,
	resourceSchema,
} from '@/features/resources';

import { useResourceDelete } from './hooks';


function ResourceListPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { resources, isLoadingList } = useMicroAppSelector(selectResourceState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const deleteHandler = useResourceDelete.handler(resources, dispatch);

	const columns = ['name', 'description', 'resourceType', 'scopeType', 'actionsCount', 'actions'];
	const schema = resourceSchema as ModelSchema;

	React.useEffect(() => {
		dispatch(resourceActions.listResources());
	}, [dispatch]);

	const handleViewDetail = React.useCallback((resourceName: string) => {
		navigate(`${resourceName}`);
	}, [navigate]);

	const handleEdit = React.useCallback((resourceName: string) => {
		navigate(`${resourceName}`);
	}, [navigate]);

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(resourceActions.listResources());
	}, [dispatch]);

	return (
		<>
			<Stack gap='md'>
				<Headers titleKey='nikki.authorize.resource.title' />
				<Actions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
				/>
				<Paper className='p-4'>
					<ResourceTable
						columns={columns}
						data={resources}
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
				title={translate('nikki.authorize.resource.title_delete')}
				message={
					deleteHandler.resourceToDelete
						? translate('nikki.general.messages.delete_confirm_name', { name: deleteHandler.resourceToDelete.name })
						: translate('nikki.general.messages.delete_confirm')
				}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
}

const ResourceListPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.resource.title');
	}, [translate]);
	return <ResourceListPageBody />;
};

export const ResourceListPage: React.FC = ResourceListPageWithTitle;
