import { Paper, Stack } from '@mantine/core';
import { ConfirmModal, Headers, Actions } from '@nikkierp/ui/components';
import { useMicroAppDispatch } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthorizeDispatch } from '@/appState';
import { EntitlementTable, entitlementSchema, useEntitlementDelete, useEntitlementList } from '@/features/entitlements';
import { useAuthorizePermissions } from '@/hooks/useAuthorizePermissions';


function EntitlementListPageBody(): React.ReactNode {
	const { t: translate } = useTranslation();
	const { entitlements, isLoadingList, resources, actions } = useEntitlementList.data();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const deleteHandler = useEntitlementDelete(entitlements, dispatch);
	const { handleViewDetail, handleEdit, handleCreate, handleRefresh } = useEntitlementList.handlers();
	const permissions = useAuthorizePermissions();

	const columns = ['name', 'description', 'actionId', 'resourceId', 'actions'];
	const schema = entitlementSchema as ModelSchema;

	return (
		<>
			<Stack gap='md'>
				<Headers titleKey='nikki.authorize.entitlement.title' />
				<Actions
					onCreate={permissions.entitlement.canCreate ? handleCreate : undefined}
					onRefresh={handleRefresh}
				/>
				<Paper className='p-4'>
					<EntitlementTable
						columns={columns}
						data={entitlements}
						resourcesData={resources}
						actionsData={actions}
						isLoading={isLoadingList}
						schema={schema}
						onViewDetail={handleViewDetail}
						onEdit={permissions.entitlement.canUpdate ? handleEdit : undefined}
						onDelete={permissions.entitlement.canDelete ? deleteHandler.handleDeleteRequest : undefined}
					/>
				</Paper>
			</Stack>

			<ConfirmModal
				opened={deleteHandler.deleteModalOpened}
				onClose={deleteHandler.closeDeleteModal}
				onConfirm={deleteHandler.confirmDelete}
				title={translate('nikki.authorize.entitlement.title_delete')}
				message={
					deleteHandler.entitlementToDelete
						? translate('nikki.general.messages.delete_confirm_name', { name: deleteHandler.entitlementToDelete.name })
						: translate('nikki.general.messages.delete_confirm')
				}
				cancelLabel={translate('nikki.general.actions.cancel')}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
}

const EntitlementListPageWithTitle: React.FC = () => {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.entitlement.title');
	}, [translate]);
	return <EntitlementListPageBody />;
};

export const EntitlementListPage: React.FC = EntitlementListPageWithTitle;
