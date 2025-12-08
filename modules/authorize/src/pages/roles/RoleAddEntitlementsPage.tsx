import { Stack } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BackButton } from '@/features/roles/components/Button';
import { RoleAddEntitlementsForm } from '@/features/roles/components/RoleEntitlements';
import { RoleLoadingState, RoleNotFound } from '@/features/roles/components/RoleForm';

import { useRoleAddEntitlementsData, useRoleAddEntitlementsHandlers } from './hooks/useRoleAddEntitlements';


function RoleAddEntitlementsPageBody(): React.ReactNode {
	const { role, entitlements, resources, actions, isLoading } = useRoleAddEntitlementsData();
	const handlers = useRoleAddEntitlementsHandlers(role, entitlements);

	if (isLoading) return <RoleLoadingState />;
	if (!role) return <RoleNotFound onGoBack={handlers.handleGoBack} />;

	return (
		<Stack gap='md'>
			<BackButton onClick={handlers.handleGoBack} />
			<RoleAddEntitlementsForm
				role={role}
				availableEntitlements={handlers.availableEntitlements}
				selectedEntitlements={handlers.selectedEntitlements}
				onMoveToSelected={handlers.handleMoveToSelected}
				onMoveToAvailable={handlers.handleMoveToAvailable}
				resources={resources}
				actions={actions}
				selectedScopeRefs={handlers.selectedScopeRefs}
				onScopeRefChange={handlers.handleScopeRefChange}
				searchQuery={handlers.searchQuery}
				onSearchQueryChange={handlers.setSearchQuery}
				onSearch={() => {}}
				onConfirm={handlers.handleConfirm}
				onCancel={handlers.handleGoBack}
				isSubmitting={handlers.isSubmitting}
			/>
		</Stack>
	);
}

function RoleAddEntitlementsPageWithTitle(): React.ReactNode {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.role.entitlements.add_title');
	}, [translate]);
	return <RoleAddEntitlementsPageBody />;
}

export const RoleAddEntitlementsPage: React.FC = RoleAddEntitlementsPageWithTitle;

