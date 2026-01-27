import { Stack } from '@mantine/core';
import { BreadcrumbsHeader, NotFound, LoadingState } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import {
	RoleAddEntitlementsForm,
	useRoleAddEntitlementsData,
	useRoleAddEntitlements,
} from '@/features/roles';
import { useAuthorizePermissions } from '@/hooks/useAuthorizePermissions';


function RoleAddEntitlementsPageBody(): React.ReactNode {
	const { role, entitlements, resources, isLoading } = useRoleAddEntitlementsData();
	const handlers = useRoleAddEntitlements(role, entitlements);
	const { t: translate } = useTranslation();
	const location = useLocation();
	const permissions = useAuthorizePermissions();

	if (isLoading) return <LoadingState messageKey='nikki.authorize.role.messages.loading' />;
	if (!role) return <NotFound messageKey='nikki.authorize.role.messages.not_found' onGoBack={handlers.handleGoBack} />;

	// Build breadcrumbs for 3 layers: Roles > Role Detail > Add Entitlements
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
		if (roleIdIndex >= 0 && roleIdIndex < pathSegments.length) {
			items.push({
				title: role.name,
				path: '/' + pathSegments.slice(0, roleIdIndex + 1).join('/'),
			});
		}
		return items;
	}, [location.pathname, role, translate]);

	return (
		<Stack gap='md'>
			<BreadcrumbsHeader
				currentTitle={translate('nikki.authorize.role.entitlements.add_title')}
				items={breadcrumbItems}
			/>
			<RoleAddEntitlementsForm
				role={role}
				availableEntitlements={handlers.availableEntitlements}
				selectedEntitlements={handlers.selectedEntitlements}
				onMoveToSelected={handlers.handleMoveToSelected}
				onMoveToAvailable={handlers.handleMoveToAvailable}
				resources={resources}
				onScopeRefChange={() => {}}
				searchQuery={handlers.searchQuery}
				onSearchQueryChange={handlers.setSearchQuery}
				onSearch={() => {}}
				onConfirm={handlers.handleConfirm}
				onCancel={handlers.handleGoBack}
				isSubmitting={handlers.isSubmitting}
				showConfirm={permissions.role.canAddEntitlement}
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

