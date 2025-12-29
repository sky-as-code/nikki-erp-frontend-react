import { Paper, Stack } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	revokeRequestActions,
	selectRevokeRequestState,
} from '@/appState';
import {
	RevokeRequestListActions,
	RevokeRequestListHeader,
	RevokeRequestTable,
} from '@/features/revoke_requests/components';
import revokeRequestSchema from '@/features/revoke_requests/revoke-request-schema.json';

import {
	useRevokeRequestDeleteHandler,
	useRevokeRequestList,
} from './hooks';


function RevokeRequestListPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { revokeRequests, isLoadingList } = useMicroAppSelector(selectRevokeRequestState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const deleteHandler = useRevokeRequestDeleteHandler(revokeRequests, dispatch);
	const { handleRefresh } = useRevokeRequestList();

	const columns = [
		'requestorName',
		'receiverName',
		'targetName',
		'actions',
	];
	const schema = revokeRequestSchema as ModelSchema;

	React.useEffect(() => {
		dispatch(revokeRequestActions.listRevokeRequests());
	}, [dispatch]);

	const handleViewDetail = React.useCallback((requestId: string) => {
		navigate(requestId);
	}, [navigate]);

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	return (
		<>
			<Stack gap='md'>
				<RevokeRequestListHeader />
				<RevokeRequestListActions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
				/>
				<Paper className='p-4'>
					<RevokeRequestTable
						columns={columns}
						data={revokeRequests}
						isLoading={isLoadingList}
						schema={schema}
						onViewDetail={handleViewDetail}
						onDelete={deleteHandler.handleDeleteRequest}
					/>
				</Paper>
			</Stack>

			<ConfirmModal
				opened={deleteHandler.deleteModalOpened}
				onClose={deleteHandler.closeDeleteModal}
				onConfirm={deleteHandler.confirmDelete}
				title={translate('nikki.authorize.revoke_request.title_delete')}
				message={
					deleteHandler.requestToDelete
						? translate('nikki.general.messages.delete_confirm_name', {
							name: deleteHandler.requestToDelete.target?.name || deleteHandler.requestToDelete.targetRef,
						})
						: translate('nikki.general.messages.delete_confirm')
				}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
}

const RevokeRequestListPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.revoke_request.title');
	}, [translate]);
	return <RevokeRequestListPageBody />;
};

export const RevokeRequestListPage: React.FC = RevokeRequestListPageWithTitle;
