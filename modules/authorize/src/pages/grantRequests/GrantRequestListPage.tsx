import { Paper, Stack } from '@mantine/core';
import { ConfirmModal, Headers, Actions } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	grantRequestActions,
	selectGrantRequestState,
} from '@/appState';
import { GrantRequestTable, grantRequestSchema, useGrantRequestDelete } from '@/features/grantRequests';


function GrantRequestListPageBody(): React.ReactNode {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { grantRequests, isLoadingList } = useMicroAppSelector(selectGrantRequestState);
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const deleteHandler = useGrantRequestDelete(grantRequests, dispatch);

	const columns = [
		'requestor',
		'receiver',
		'target',
		'status',
		'orgDisplayName',
		'actions',
	];
	const schema = grantRequestSchema as ModelSchema;

	React.useEffect(() => {
		dispatch(grantRequestActions.listGrantRequests());
	}, [dispatch]);

	const handleViewDetail = React.useCallback((requestId: string) => {
		navigate(requestId);
	}, [navigate]);

	const handleCreate = React.useCallback(() => {
		navigate('create');
	}, [navigate]);

	const handleRefresh = React.useCallback(() => {
		dispatch(grantRequestActions.listGrantRequests());
	}, [dispatch]);

	return (
		<>
			<Stack gap='md'>
				<Headers titleKey='nikki.authorize.grant_request.title' />
				<Actions
					onCreate={handleCreate}
					onRefresh={handleRefresh}
					showImport={false}
				/>
				<Paper className='p-4'>
					<GrantRequestTable
						columns={columns}
						data={grantRequests}
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
				title={translate('nikki.authorize.grant_request.title_delete')}
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

const GrantRequestListPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.grant_request.title');
	}, [translate]);
	return <GrantRequestListPageBody />;
};

export const GrantRequestListPage: React.FC = GrantRequestListPageWithTitle;
