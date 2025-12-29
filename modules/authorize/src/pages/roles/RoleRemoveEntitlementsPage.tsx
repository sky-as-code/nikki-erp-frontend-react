import { Stack } from '@mantine/core';
import { BreadcrumbsHeader } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import {
	RoleRemoveEntitlementsForm,
	RoleLoadingState,
	RoleNotFound,
} from '@/features/roles/components';

import {
	useRoleRemoveEntitlementsData,
	useRoleRemoveEntitlementsHandlers,
} from './hooks';


function RoleRemoveEntitlementsPageBody(): React.ReactNode {
	const { role, resources, isLoading } = useRoleRemoveEntitlementsData();
	const { t: translate } = useTranslation();
	const location = useLocation();
	const handlers = useRoleRemoveEntitlementsHandlers(role);

	// Build breadcrumbs for 3 layers: Roles > Role Detail > Remove Entitlements
	const breadcrumbItems = React.useMemo(() => {
		const pathSegments = location.pathname.split('/').filter(Boolean);
		const rolesIndex = pathSegments.findIndex((seg) => seg === 'roles');
		const roleIdIndex = rolesIndex >= 0 ? rolesIndex + 1 : -1;

		const items = [];
		if (rolesIndex >= 0) {
			items.push({
				title: translate('nikki.authorize.role.title'),
				path: '/' + pathSegments.slice(0, rolesIndex + 1).join('/'),
			});
		}
		if (role && roleIdIndex >= 0 && roleIdIndex < pathSegments.length) {
			items.push({
				title: role.name,
				path: '/' + pathSegments.slice(0, roleIdIndex + 1).join('/'),
			});
		}
		return items;
	}, [location.pathname, role, translate]);

	if (isLoading) return <RoleLoadingState />;
	if (!role) return <RoleNotFound onGoBack={handlers.handleCancel} />;

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
				searchQuery={handlers.searchQuery}
				onSearchQueryChange={handlers.setSearchQuery}
				onSearch={() => {}}
				onConfirm={handlers.handleConfirm}
				onCancel={handlers.handleCancel}
				isSubmitting={handlers.isSubmitting}
			/>
		</Stack>
	);
}

function RoleRemoveEntitlementsPageWithTitle(): React.ReactNode {
	const { t: translate } = useTranslation();
	React.useEffect(() => {
		document.title = translate('nikki.authorize.role.entitlements.remove_title');
	}, [translate]);
	return <RoleRemoveEntitlementsPageBody />;
}

export const RoleRemoveEntitlementsPage: React.FC = RoleRemoveEntitlementsPageWithTitle;

