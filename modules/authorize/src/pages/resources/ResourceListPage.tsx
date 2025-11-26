import { Paper, Stack } from '@mantine/core';
import { ConfirmModal, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import {
	AuthorizeDispatch,
	resourceActions,
	selectResourceState,
} from '../../appState';
import {
	ResourceListActions,
	ResourceListHeader,
	ResourceTable,
	ResourceDetailModal,
	ResourceFormModal,
} from '../../features/resources/components';
import { useResourceListHandlers } from '../../features/resources/hooks/useResourceListHandlers';
import resourceSchema from '../../features/resources/resource-schema.json';
import { Resource } from '../../features/resources/types';


function ResourceListPageBody(): React.ReactNode {
	const { resources, isLoadingList } = useMicroAppSelector(selectResourceState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const deleteHandlers = useResourceListHandlers.delete(resources, dispatch);
	const detailHandlers = useResourceListHandlers.detail(resources);
	const formTypeHandlers = useResourceListHandlers.formType(resources);

	const columns = ['name', 'description', 'resourceType', 'scopeType', 'actionsCount', 'actions'];
	const schema = resourceSchema as ModelSchema;

	React.useEffect(() => {
		dispatch(resourceActions.listResources());
	}, [dispatch]);

	return (
		<ResourceListView
			columns={columns}
			schema={schema}
			resources={resources}
			isLoadingList={isLoadingList}
			onRefresh={() => dispatch(resourceActions.listResources())}
			detailHandlers={detailHandlers}
			formTypeHandlers={formTypeHandlers}
			deleteHandlers={deleteHandlers}
		/>
	);
}

interface ResourceListViewProps {
	columns: string[];
	schema: ModelSchema;
	resources: Resource[];
	isLoadingList: boolean;
	onRefresh: () => void;
	detailHandlers: ReturnType<typeof useResourceListHandlers['detail']>;
	formTypeHandlers: ReturnType<typeof useResourceListHandlers['formType']>;
	deleteHandlers: ReturnType<typeof useResourceListHandlers['delete']>;
}

function ResourceListView({
	columns,
	schema,
	resources,
	isLoadingList,
	onRefresh,
	detailHandlers,
	formTypeHandlers,
	deleteHandlers,
}: ResourceListViewProps): React.ReactNode {
	return (
		<>
			<Stack gap='md'>
				<ResourceListHeader />
				<ResourceListActions
					onCreate={formTypeHandlers.openCreateModal}
					onRefresh={onRefresh}
				/>
				<Paper className='p-4'>
					<ResourceTable
						columns={columns}
						resources={resources}
						isLoading={isLoadingList}
						schema={schema}
						onViewDetail={detailHandlers.handleViewDetail}
						onEdit={formTypeHandlers.openEditModal}
						onDelete={deleteHandlers.handleDeleteRequest}
					/>
				</Paper>
			</Stack>

			<ResourceDetailModal
				opened={detailHandlers.detailModalOpened}
				onClose={detailHandlers.closeDetailModal}
				resource={detailHandlers.selectedResource}
				isLoading={false}
			/>

			<ConfirmModal
				opened={deleteHandlers.deleteModalOpened}
				onClose={deleteHandlers.closeDeleteModal}
				onConfirm={deleteHandlers.confirmDelete}
				title='Delete Resource'
				message={deleteHandlers.resourceToDelete ? `Are you sure you want to delete ${deleteHandlers.resourceToDelete.name}? This action cannot be undone.` : 'Are you sure you want to delete this resource? This action cannot be undone.'}
				confirmLabel='Delete'
				confirmColor='red'
			/>

			<ResourceFormModal
				opened={Boolean(formTypeHandlers.formModalState)}
				mode={formTypeHandlers.formModalState?.mode ?? 'create'}
				resource={formTypeHandlers.formModalState?.resource}
				onClose={formTypeHandlers.closeFormModal}
			/>
		</>
	);
}

export const ResourceListPage: React.FC = withWindowTitle('Resources', ResourceListPageBody);
