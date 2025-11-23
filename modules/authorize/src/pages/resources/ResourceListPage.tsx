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
import { useNavigate } from 'react-router';

import { ResourceDetailModal } from './ResourceDetailModal';
import { AuthorizeDispatch, resourceActions, selectResourceState } from '../../appState';
import resourceSchema from '../../features/resources/resource-schema.json';
import { Resource } from '../../features/resources/types';


function useResourceListHandlers() {
	const navigate = useNavigate();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { resourceDetail, isLoadingDetail } = useMicroAppSelector(selectResourceState);
	const [detailModalOpened, setDetailModalOpened] = React.useState(false);
	const [selectedResourceId, setSelectedResourceId] = React.useState<string | null>(null);
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [resourceToDelete, setResourceToDelete] = React.useState<string | null>(null);

	const selectedResource = React.useMemo(() => {
		if (!selectedResourceId) return undefined;
		if (selectedResourceId === resourceDetail?.id) {
			return resourceDetail;
		}
		return undefined;
	}, [selectedResourceId, resourceDetail]);

	React.useEffect(() => {
		if (selectedResourceId && detailModalOpened) {
			dispatch(resourceActions.getResource(selectedResourceId));
		}
	}, [selectedResourceId, detailModalOpened, dispatch]);

	const handleViewDetail = (resourceId: string) => {
		setSelectedResourceId(resourceId);
		setDetailModalOpened(true);
	};

	const handleEdit = (resourceId: string) => {
		navigate(`${resourceId}/edit`);
	};

	const handleDelete = (resourceId: string) => {
		setResourceToDelete(resourceId);
		setDeleteModalOpened(true);
	};

	const confirmDelete = () => {
		if (resourceToDelete) {
			// TODO: Dispatch delete action
			console.log('Delete resource:', resourceToDelete);
			setDeleteModalOpened(false);
			setResourceToDelete(null);
		}
	};

	const closeDetailModal = () => {
		setDetailModalOpened(false);
		setSelectedResourceId(null);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpened(false);
		setResourceToDelete(null);
	};

	return {
		navigate,
		dispatch,
		selectedResource,
		isLoadingDetail,
		detailModalOpened,
		deleteModalOpened,
		handleViewDetail,
		handleEdit,
		handleDelete,
		confirmDelete,
		closeDetailModal,
		closeDeleteModal,
	};
}

function ResourceListPageBody(): React.ReactNode {
	const { resources, isLoadingList } = useMicroAppSelector(selectResourceState);
	const schema = resourceSchema as ModelSchema;
	const columns = ['name', 'description', 'resourceType', 'scopeType', 'actionsCount', 'actions'];
	const {
		navigate,
		dispatch,
		selectedResource,
		isLoadingDetail,
		detailModalOpened,
		deleteModalOpened,
		handleViewDetail,
		handleEdit,
		handleDelete,
		confirmDelete,
		closeDetailModal,
		closeDeleteModal,
	} = useResourceListHandlers();

	React.useEffect(() => {
		dispatch(resourceActions.listResources());
	}, [dispatch]);

	return (
		<>
			<Stack gap='md'>
				<ResourceListHeader />
				<ResourceListActions
					onCreate={() => navigate('new')}
					onRefresh={() => dispatch(resourceActions.listResources())}
				/>
				<Paper className='p-4'>
					<ResourceTable
						columns={columns}
						resources={resources}
						isLoading={isLoadingList}
						schema={schema}
						onViewDetail={handleViewDetail}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>
				</Paper>
			</Stack>

			<ResourceDetailModal
				opened={detailModalOpened}
				onClose={closeDetailModal}
				resource={selectedResource}
				isLoading={isLoadingDetail}
			/>

			<ConfirmDialog
				opened={deleteModalOpened}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				title='Delete Resource'
				message='Are you sure you want to delete this resource? This action cannot be undone.'
				confirmLabel='Delete'
				confirmColor='red'
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
	onViewDetail: (resourceId: string) => void;
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
					const resourceId = row.id as string;
					return (
						<Text
							style={{ cursor: 'pointer', textDecoration: 'underline' }}
							onClick={(e) => {
								e.preventDefault();
								onViewDetail(resourceId);
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
									onClick={() => onViewDetail(resourceId)}
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
