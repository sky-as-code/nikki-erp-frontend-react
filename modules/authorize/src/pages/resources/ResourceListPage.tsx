import {
	ActionIcon,
	Breadcrumbs,
	Button,
	Group,
	Paper,
	Stack,
	TagsInput,
	Text,
	Tooltip,
	Typography,
} from '@mantine/core';
import { AutoTable, ConfirmDialog, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconEdit, IconEye, IconPlus, IconRefresh, IconTrash, IconUpload } from '@tabler/icons-react';
import React from 'react';

import { ResourceDetailModal } from './ResourceDetailModal';
import { ResourceFormDialog } from './ResourceFormDialog';
import { AuthorizeDispatch, resourceActions, selectResourceState } from '../../appState';
import resourceSchema from '../../features/resources/resource-schema.json';
import { Resource } from '../../features/resources/types';


type ResourceFormDialogState = { mode: 'create' | 'edit'; resource?: Resource };

function useResourceDetailHandlers(resources: Resource[]) {
	const [detailModalOpened, setDetailModalOpened] = React.useState(false);
	const [selectedResourceName, setSelectedResourceName] = React.useState<string | null>(null);

	const selectedResource = React.useMemo(() => {
		if (!selectedResourceName) return undefined;
		return resources.find((resource) => resource.name === selectedResourceName);
	}, [selectedResourceName, resources]);

	const handleViewDetail = React.useCallback((resourceName: string) => {
		setSelectedResourceName(resourceName);
		setDetailModalOpened(true);
	}, []);

	const closeDetailModal = React.useCallback(() => {
		setDetailModalOpened(false);
		setSelectedResourceName(null);
	}, []);

	return {
		selectedResource,
		handleViewDetail,
		detailModalOpened,
		closeDetailModal,
	};
}

function useResourceDeleteHandlers(resources: Resource[], dispatch: AuthorizeDispatch) {
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [resourceToDelete, setResourceToDelete] = React.useState<Resource | null>(null);

	const handleDeleteRequest = React.useCallback((resourceId: string) => {
		const resource = resources.find((entry) => entry.id === resourceId);
		if (!resource) {
			return;
		}
		setResourceToDelete(resource);
		setDeleteModalOpened(true);
	}, [resources]);

	const confirmDelete = React.useCallback(() => {
		if (!resourceToDelete) {
			return;
		}
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

	return {
		deleteModalOpened,
		resourceToDelete,
		handleDeleteRequest,
		confirmDelete,
		closeDeleteModal,
	};
}

function useResourceFormHandlers(resources: Resource[]) {
	const [formDialogState, setFormDialogState] = React.useState<ResourceFormDialogState | null>(null);

	const openCreateDialog = React.useCallback(() => {
		setFormDialogState({
			mode: 'create',
		});
	}, []);

	const openEditDialog = React.useCallback((resourceId: string) => {
		const resource = resources.find((entry) => entry.id === resourceId);
		if (!resource) {
			return;
		}
		setFormDialogState({
			mode: 'edit',
			resource,
		});
	}, [resources]);

	const closeFormDialog = React.useCallback(() => {
		setFormDialogState(null);
	}, []);

	return {
		formDialogState,
		openCreateDialog,
		openEditDialog,
		closeFormDialog,
	};
}

function ResourceListPageBody(): React.ReactNode {
	const { resources, isLoadingList } = useMicroAppSelector(selectResourceState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const viewHandlers = useResourceDetailHandlers(resources);
	const formHandlers = useResourceFormHandlers(resources);
	const deleteHandlers = useResourceDeleteHandlers(resources, dispatch);

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
			viewHandlers={viewHandlers}
			formHandlers={formHandlers}
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
	viewHandlers: ReturnType<typeof useResourceDetailHandlers>;
	formHandlers: ReturnType<typeof useResourceFormHandlers>;
	deleteHandlers: ReturnType<typeof useResourceDeleteHandlers>;
}

function ResourceListView({
	columns,
	schema,
	resources,
	isLoadingList,
	onRefresh,
	viewHandlers,
	formHandlers,
	deleteHandlers,
}: ResourceListViewProps): React.ReactNode {
	return (
		<>
			<Stack gap='md'>
				<ResourceListHeader />
				<ResourceListActions
					onCreate={formHandlers.openCreateDialog}
					onRefresh={onRefresh}
				/>
				<Paper className='p-4'>
					<ResourceTable
						columns={columns}
						resources={resources}
						isLoading={isLoadingList}
						schema={schema}
						onViewDetail={viewHandlers.handleViewDetail}
						onEdit={formHandlers.openEditDialog}
						onDelete={deleteHandlers.handleDeleteRequest}
					/>
				</Paper>
			</Stack>

			<ResourceDetailModal
				opened={viewHandlers.detailModalOpened}
				onClose={viewHandlers.closeDetailModal}
				resource={viewHandlers.selectedResource}
				isLoading={false}
			/>

			<ConfirmDialog
				opened={deleteHandlers.deleteModalOpened}
				onClose={deleteHandlers.closeDeleteModal}
				onConfirm={deleteHandlers.confirmDelete}
				title='Delete Resource'
				message={deleteHandlers.resourceToDelete ? `Are you sure you want to delete ${deleteHandlers.resourceToDelete.name}? This action cannot be undone.` : 'Are you sure you want to delete this resource? This action cannot be undone.'}
				confirmLabel='Delete'
				confirmColor='red'
			/>

			<ResourceFormDialog
				opened={Boolean(formHandlers.formDialogState)}
				mode={formHandlers.formDialogState?.mode ?? 'create'}
				resource={formHandlers.formDialogState?.resource}
				onClose={formHandlers.closeFormDialog}
			/>
		</>
	);
}

function ResourceListHeader(): React.ReactNode {
	return (
		<Group>
			<Breadcrumbs style={{
				minWidth: '30%',
			}}>
				<Typography>
					<h4>Resources</h4>
				</Typography>
			</Breadcrumbs>
			<TagsInput
				placeholder='Search'
				w='500px'
			/>
		</Group>
	);
}

interface ResourceListActionsProps {
	onCreate: () => void;
	onRefresh: () => void;
}

function ResourceListActions({ onCreate, onRefresh }: ResourceListActionsProps): React.ReactNode {
	return (
		<Group>
			<Button
				size='compact-md'
				leftSection={<IconPlus size={16} />}
				onClick={onCreate}
			>
				Create
			</Button>
			<Button
				size='compact-md'
				variant='outline'
				leftSection={<IconRefresh size={16} />}
				onClick={onRefresh}
			>
				Refresh
			</Button>
			<Button size='compact-md' variant='outline' leftSection={<IconUpload size={16} />}>Import</Button>
		</Group>
	);
}

interface ResourceTableProps {
	columns: string[];
	resources: Resource[];
	isLoading: boolean;
	schema: ModelSchema;
	onViewDetail: (resourceName: string) => void;
	onEdit: (resourceId: string) => void;
	onDelete: (resourceId: string) => void;
}

function ResourceTable({
	columns,
	resources,
	isLoading,
	schema,
	onViewDetail,
	onEdit,
	onDelete,
}: ResourceTableProps): React.ReactNode {
	return (
		<AutoTable
			columns={columns}
			data={resources as unknown as Record<string, unknown>[]}
			schema={schema}
			isLoading={isLoading}
			columnRenderers={{
				name: (row: Record<string, unknown>) => {
					const resourceName = row.name as string;
					return (
						<Text
							style={{ cursor: 'pointer', textDecoration: 'underline' }}
							onClick={(e) => {
								e.preventDefault();
								onViewDetail(resourceName);
							}}
						>
							{String(row.name || '')}
						</Text>
					);
				},
				actions: (row: Record<string, unknown>) => {
					const resourceId = row.id as string;
					return (
						<Group gap='xs' justify='flex-end'>
							<Tooltip label='View Details'>
								<ActionIcon
									variant='subtle'
									color='gray'
									onClick={() => onViewDetail(row.name as string)}
								>
									<IconEye size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label='Edit'>
								<ActionIcon
									variant='subtle'
									color='gray'
									onClick={() => onEdit(resourceId)}
								>
									<IconEdit size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label='Delete'>
								<ActionIcon
									variant='subtle'
									color='red'
									onClick={() => onDelete(resourceId)}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
						</Group>
					);
				},
			}}
		/>
	);
}


export const ResourceListPage: React.FC = withWindowTitle('Resources', ResourceListPageBody);
