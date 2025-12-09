import { Stack } from '@mantine/core';
import { BreadcrumbsHeader } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { RoleRemoveEntitlementsForm } from '@/features/roles/components/RoleEntitlements';
import { RoleLoadingState, RoleNotFound } from '@/features/roles/components/RoleForm';

import { useRoleRemoveEntitlementsData, useRoleRemoveEntitlementsHandlers } from './hooks/useRoleRemoveEntitlements';


export const RoleRemoveEntitlementsPage: React.FC = () => {
	const { role, resources, actions, isLoading } = useRoleRemoveEntitlementsData();
	const handlers = useRoleRemoveEntitlementsHandlers(role);
	const { t: translate } = useTranslation();

	if (isLoading) return <RoleLoadingState />;
	if (!role) return <RoleNotFound onGoBack={handlers.handleCancel} />;

	const breadcrumbItems = handlers.breadcrumbItems;

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role.entitlements.remove_title')}
				items={breadcrumbItems}
			/>
			<RoleRemoveEntitlementsForm
				role={role}
				availableEntitlements={handlers.availableEntitlements}
				selectedEntitlements={handlers.selectedEntitlements}
				onMoveToSelected={handlers.handleMoveToSelected}
				onMoveToAvailable={handlers.handleMoveToAvailable}
				resources={resources}
				actions={actions}
				searchQuery={handlers.searchQuery}
				onSearchQueryChange={handlers.setSearchQuery}
				onSearch={() => {}}
				onConfirm={handlers.handleConfirm}
				onCancel={handlers.handleCancel}
				isSubmitting={handlers.isSubmitting}
			/>
		</Stack>
	);
};

