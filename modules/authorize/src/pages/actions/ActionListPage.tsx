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

import { ActionDetailModal } from './ActionDetailModal';
import { AuthorizeDispatch, actionActions, selectActionState } from '../../appState';
import actionSchema from '../../features/actions/action-schema.json';
import { Action } from '../../features/actions/types';


function useActionListHandlers() {
	const navigate = useNavigate();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { actionDetail, isLoadingDetail } = useMicroAppSelector(selectActionState);
	const [detailModalOpened, setDetailModalOpened] = React.useState(false);
	const [selectedActionId, setSelectedActionId] = React.useState<string | null>(null);
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [actionToDelete, setActionToDelete] = React.useState<string | null>(null);

	const selectedAction = React.useMemo(() => {
		if (!selectedActionId) return undefined;
		if (selectedActionId === actionDetail?.id) {
			return actionDetail;
		}
		return undefined;
	}, [selectedActionId, actionDetail]);

	React.useEffect(() => {
		if (selectedActionId && detailModalOpened) {
			dispatch(actionActions.getAction(selectedActionId));
		}
	}, [selectedActionId, detailModalOpened, dispatch]);

	const handleViewDetail = (actionId: string) => {
		setSelectedActionId(actionId);
		setDetailModalOpened(true);
	};

	const handleEdit = (actionId: string) => {
		navigate(`${actionId}/edit`);
	};

	const handleDelete = (actionId: string) => {
		setActionToDelete(actionId);
		setDeleteModalOpened(true);
	};

	const confirmDelete = () => {
		if (actionToDelete) {
			// TODO: Dispatch delete action
			console.log('Delete action:', actionToDelete);
			setDeleteModalOpened(false);
			setActionToDelete(null);
		}
	};

	const closeDetailModal = () => {
		setDetailModalOpened(false);
		setSelectedActionId(null);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpened(false);
		setActionToDelete(null);
	};

	return {
		navigate,
		dispatch,
		selectedAction,
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

function ActionListPageBody(): React.ReactNode {
	const { actions, isLoadingList } = useMicroAppSelector(selectActionState);
	const schema = actionSchema as ModelSchema;
	const columns = ['name', 'description', 'resourceId', 'entitlementsCount', 'actions'];
	const {
		navigate,
		dispatch,
		selectedAction,
		isLoadingDetail,
		detailModalOpened,
		deleteModalOpened,
		handleViewDetail,
		handleEdit,
		handleDelete,
		confirmDelete,
		closeDetailModal,
		closeDeleteModal,
	} = useActionListHandlers();

	React.useEffect(() => {
		dispatch(actionActions.listActions());
	}, [dispatch]);

	return (
		<>
			<Stack gap='md'>
				<ActionListHeader />
				<ActionListActions
					onCreate={() => navigate('new')}
					onRefresh={() => dispatch(actionActions.listActions())}
				/>
				<Paper className='p-4'>
					<ActionTable
						columns={columns}
						actions={actions}
						isLoading={isLoadingList}
						schema={schema}
						onViewDetail={handleViewDetail}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>
				</Paper>
			</Stack>

			<ActionDetailModal
				opened={detailModalOpened}
				onClose={closeDetailModal}
				action={selectedAction}
				isLoading={isLoadingDetail}
			/>

			<ConfirmModal
				opened={deleteModalOpened}
				onClose={closeDeleteModal}
				onConfirm={confirmDelete}
				title='Delete Action'
				message='Are you sure you want to delete this action? This action cannot be undone.'
				confirmLabel='Delete'
				confirmColor='red'
			/>
		</>
	);
}

function ActionListHeader(): React.ReactNode {
	return (
		<Group>
			<Breadcrumbs style={{
				minWidth: '30%',
			}}>
				<Typography>
					<h4>Actions</h4>
				</Typography>
			</Breadcrumbs>
			<TagsInput
				placeholder='Search'
				w='500px'
			/>
		</Group>
	);
}

interface ActionListActionsProps {
	onCreate: () => void;
	onRefresh: () => void;
}

function ActionListActions({ onCreate, onRefresh }: ActionListActionsProps): React.ReactNode {
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

interface ActionTableProps {
	columns: string[];
	actions: Action[];
	isLoading: boolean;
	schema: ModelSchema;
	onViewDetail: (actionId: string) => void;
	onEdit: (actionId: string) => void;
	onDelete: (actionId: string) => void;
}

function ActionTable({
	columns,
	actions,
	isLoading,
	schema,
	onViewDetail,
	onEdit,
	onDelete,
}: ActionTableProps): React.ReactNode {
	return (
		<AutoTable
			columns={columns}
			data={actions as unknown as Record<string, unknown>[]}
			schema={schema}
			isLoading={isLoading}
			columnRenderers={{
				name: (row: Record<string, unknown>) => {
					const actionId = row.id as string;
					return (
						<Text
							style={{ cursor: 'pointer', textDecoration: 'underline' }}
							onClick={(e) => {
								e.preventDefault();
								onViewDetail(actionId);
							}}
						>
							{String(row.name || '')}
						</Text>
					);
				},
				actions: (row: Record<string, unknown>) => {
					const actionId = row.id as string;
					return (
						<Group gap='xs' justify='flex-end'>
							<Tooltip label='View Details'>
								<ActionIcon
									variant='subtle'
									color='gray'
									onClick={() => onViewDetail(actionId)}
								>
									<IconEye size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label='Edit'>
								<ActionIcon
									variant='subtle'
									color='gray'
									onClick={() => onEdit(actionId)}
								>
									<IconEdit size={16} />
								</ActionIcon>
							</Tooltip>
							<Tooltip label='Delete'>
								<ActionIcon
									variant='subtle'
									color='red'
									onClick={() => onDelete(actionId)}
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


export const ActionListPage: React.FC = withWindowTitle('Actions', ActionListPageBody);
