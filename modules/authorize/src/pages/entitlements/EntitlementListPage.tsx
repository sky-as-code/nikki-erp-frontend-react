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
import { AutoTable, ConfirmModal, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector, useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconEdit, IconEye, IconPlus, IconRefresh, IconTrash, IconUpload } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router';

import { EntitlementDetailModal } from './EntitlementDetailModal';
import { AuthorizeDispatch, entitlementActions, selectEntitlementState } from '../../appState';
import entitlementSchema from '../../features/entitlements/entitlement-schema.json';
import { Entitlement } from '../../features/entitlements/types';


function useEntitlementListHandlers() {
	const navigate = useNavigate();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { entitlementDetail, isLoadingDetail } = useMicroAppSelector(selectEntitlementState);
	const [detailModalOpened, setDetailModalOpened] = React.useState(false);
	const [selectedEntitlementId, setSelectedEntitlementId] = React.useState<string | null>(null);
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [entitlementToDelete, setEntitlementToDelete] = React.useState<string | null>(null);

	const selectedEntitlement = React.useMemo(() => {
		if (!selectedEntitlementId) return undefined;
		if (selectedEntitlementId === entitlementDetail?.id) {
			return entitlementDetail;
		}
		return undefined;
	}, [selectedEntitlementId, entitlementDetail]);

	React.useEffect(() => {
		if (selectedEntitlementId && detailModalOpened) {
			dispatch(entitlementActions.getEntitlement(selectedEntitlementId));
		}
	}, [selectedEntitlementId, detailModalOpened, dispatch]);

	const handleViewDetail = (entitlementId: string) => {
		setSelectedEntitlementId(entitlementId);
		setDetailModalOpened(true);
	};

	const handleEdit = (entitlementId: string) => {
		navigate(`${entitlementId}/edit`);
	};

	const handleDelete = (entitlementId: string) => {
		setEntitlementToDelete(entitlementId);
		setDeleteModalOpened(true);
	};

	const confirmDelete = () => {
		if (entitlementToDelete) {
			// TODO: Dispatch delete action
			console.log('Delete entitlement:', entitlementToDelete);
			setDeleteModalOpened(false);
			setEntitlementToDelete(null);
		}
	};

	const closeDetailModal = () => {
		setDetailModalOpened(false);
		setSelectedEntitlementId(null);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpened(false);
		setEntitlementToDelete(null);
	};

	return {
		navigate,
		dispatch,
		selectedEntitlement,
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

function EntitlementListPageBody(): React.ReactNode {
	const { entitlements, isLoadingList } = useMicroAppSelector(selectEntitlementState);
	const schema = entitlementSchema as ModelSchema;
	const columns = ['name', 'description', 'actionId', 'resourceId', 'assignmentsCount', 'rolesCount', 'actions'];
	const {
		navigate,
		dispatch,
		selectedEntitlement,
		isLoadingDetail,
		detailModalOpened,
		deleteModalOpened,
		handleViewDetail,
		handleEdit,
		handleDelete,
		confirmDelete,
		closeDetailModal,
		closeDeleteModal,
	} = useEntitlementListHandlers();

	React.useEffect(() => {
		dispatch(entitlementActions.listEntitlements());
	}, [dispatch]);

	return (
		<>
			<Stack gap='md'>
				<EntitlementListHeader />
				<EntitlementListActions
					onCreate={() => navigate('new')}
					onRefresh={() => dispatch(entitlementActions.listEntitlements())}
				/>
				<Paper className='p-4'>
					<EntitlementTable
						columns={columns}
						entitlements={entitlements}
						isLoading={isLoadingList}
						schema={schema}
						onViewDetail={handleViewDetail}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>
				</Paper>
			</Stack>

			<EntitlementDetailModal
				opened={detailModalOpened}
				onClose={closeDetailModal}
				entitlement={selectedEntitlement}
				isLoading={isLoadingDetail}
			/>

			<ConfirmModal
				opened={deleteModalOpened}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				title='Delete Entitlement'
				message='Are you sure you want to delete this entitlement? This action cannot be undone.'
				confirmLabel='Delete'
				confirmColor='red'
			/>
		</>
	);
}

function EntitlementListHeader(): React.ReactNode {
	return (
		<Group>
			<Breadcrumbs style={{
				minWidth: '30%',
			}}>
				<Typography>
					<h4>Entitlements</h4>
				</Typography>
			</Breadcrumbs>
			<TagsInput
				placeholder='Search'
				w='500px'
			/>
		</Group>
	);
}

interface EntitlementListActionsProps {
	onCreate: () => void;
	onRefresh: () => void;
}

function EntitlementListActions({ onCreate, onRefresh }: EntitlementListActionsProps): React.ReactNode {
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

interface EntitlementTableProps {
	columns: string[];
	entitlements: Entitlement[];
	isLoading: boolean;
	schema: ModelSchema;
	onViewDetail: (entitlementId: string) => void;
	onEdit: (entitlementId: string) => void;
	onDelete: (entitlementId: string) => void;
}

function EntitlementTable({
	columns,
	entitlements,
	isLoading,
	schema,
	onViewDetail,
	onEdit,
	onDelete,
}: EntitlementTableProps): React.ReactNode {
	return (
		<AutoTable
			columns={columns}
			data={entitlements as unknown as Record<string, unknown>[]}
			schema={schema}
			isLoading={isLoading}
			columnRenderers={{
				name: (row: Record<string, unknown>) => {
					const entitlementId = row.id as string;
					return (
						<Text
							style={{ cursor: 'pointer', textDecoration: 'underline' }}
							onClick={(e) => {
								e.preventDefault();
								onViewDetail(entitlementId);
							}}
						>
							{String(row.name || '')}
						</Text>
					);
				},
				actions: (row: Record<string, unknown>) => {
					const entitlementId = row.id as string;
					return (
						<Group gap='xs' justify='flex-end'>
							<Tooltip label='View Details'>
								<ActionIcon
									variant='subtle'
									color='gray'
									onClick={() => onViewDetail(entitlementId)}
								>
									<IconEye size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label='Edit'>
								<ActionIcon
									variant='subtle'
									color='gray'
									onClick={() => onEdit(entitlementId)}
								>
									<IconEdit size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label='Delete'>
								<ActionIcon
									variant='subtle'
									color='red'
									onClick={() => onDelete(entitlementId)}
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


export const EntitlementListPage: React.FC = withWindowTitle('Entitlements', EntitlementListPageBody);
