import { Paper, Stack } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	resourceActions,
	selectResourceState,
} from '../../appState';
import {
	ResourceListActions,
	ResourceListHeader,
	ResourceTable,
} from '../../features/resources/components';
import resourceSchema from '../../features/resources/resource-schema.json';
import { Resource } from '../../features/resources/types';


function useResourceDeleteHandler(resources: Resource[], dispatch: AuthorizeDispatch) {
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [resourceToDelete, setResourceToDelete] = React.useState<Resource | null>(null);

	const handleDeleteRequest = React.useCallback((resourceId: string) => {
		const resource = resources.find((entry) => entry.id === resourceId);
		if (!resource) return;
		setResourceToDelete(resource);
		setDeleteModalOpened(true);
	}, [resources]);

	const confirmDelete = React.useCallback(() => {
		if (!resourceToDelete) return;
		dispatch(resourceActions.deleteResource({
			name: resourceToDelete.name,
		})).then(() => {
			setDeleteModalOpened(false);
			setResourceToDelete(null);
		});
	}, [dispatch, resourceToDelete]);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setResourceToDelete(null);
	}, []);

	return { deleteModalOpened, resourceToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

function ResourceListPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { resources, isLoadingList } = useMicroAppSelector(selectResourceState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const deleteHandler = useResourceDeleteHandler(resources, dispatch);

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
				<ResourceListHeader />
				<ResourceListActions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
				/>
				<Paper className='p-4'>
					<ResourceTable
						columns={columns}
						resources={resources}
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
