import { Stack, Paper } from '@mantine/core';
import { Headers, Actions, ConfirmModal } from '@nikkierp/ui/components';
import { useConfirmModal } from '@nikkierp/ui/hooks';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ResourceTable, resourceSchema, type Resource, useResourceList, useResourceDelete } from '@/features/resources';
import { useAuthorizePermissions } from '@/hooks/useAuthorizePermissions';


export const ResourceListPage: React.FC = () => {
	const navigate = useNavigate();
	const { t: translate } = useTranslation();
	const { resources, isLoadingList, handleRefresh } = useResourceList();
	const { isOpen, item, configOpenModal, handleCloseModal } = useConfirmModal<Resource>();
	const confirmDelete = useResourceDelete(handleRefresh);
	const permissions = useAuthorizePermissions();

	React.useEffect(() => {
		document.title = translate('nikki.authorize.resource.title');
	}, []);

	const handleOpenModal = (resourceId: string) => {
		const resource = resources.find((r: Resource) => r.id === resourceId);
		if (resource) {
			configOpenModal(resource);
		}
	};

	const handleDeleteConfirm = () => {
		if (item) confirmDelete(item);
		handleCloseModal();
	};

	const handleDetailOrEdit = (resourceName: string) => navigate(`${resourceName}`);
	const handleCreate = () => navigate('create');

	return (
		<Stack gap='md'>
			<Headers titleKey='nikki.authorize.resource.title' />
			<Actions onCreate={permissions.resource.canCreate ? handleCreate : undefined} onRefresh={handleRefresh} />
			<Paper className='p-4'>
				<ResourceTable
					columns={['name', 'description', 'resourceType', 'scopeType', 'actionsCount', 'actions']}
					data={resources}
					schema={resourceSchema as ModelSchema}
					isLoading={isLoadingList}
					onViewDetail={handleDetailOrEdit}
					onEdit={permissions.resource.canUpdate ? handleDetailOrEdit : undefined}
					onDelete={permissions.resource.canDelete ? handleOpenModal : undefined}
				/>
			</Paper>

			<ConfirmModal
				opened={isOpen}
				onClose={handleCloseModal}
				onConfirm={handleDeleteConfirm}
				title={translate('nikki.general.messages.delete_confirm')}
				message={
					item
						? translate('nikki.general.messages.delete_confirm_name', { name: item.name })
						: translate('nikki.general.messages.delete_confirm')
				}
				cancelLabel={translate('nikki.general.actions.cancel')}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</Stack>
	);
};
