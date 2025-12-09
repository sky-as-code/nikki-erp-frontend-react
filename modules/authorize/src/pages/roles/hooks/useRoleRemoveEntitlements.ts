import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import {
	AuthorizeDispatch,
	actionActions,
	resourceActions,
	roleActions,
	selectActionState,
	selectResourceState,
	selectRoleState,
} from '@/appState';

import type { Entitlement } from '@/features/entitlements';
import type { Role } from '@/features/roles';


export function useRoleRemoveEntitlementsData() {
	const { roleId } = useParams<{ roleId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { roles, roleDetail, isLoadingDetail, isLoadingList } = useMicroAppSelector(selectRoleState);
	const { resources } = useMicroAppSelector(selectResourceState);
	const { actions } = useMicroAppSelector(selectActionState);

	const role = React.useMemo(() => {
		if (!roleId) return undefined;
		if (roleDetail?.id === roleId) return roleDetail;
		return roles.find((r: Role) => r.id === roleId);
	}, [roleId, roles, roleDetail]);

	React.useEffect(() => {
		if (roleId) {
			dispatch(roleActions.getRole(roleId));
		}
	}, [dispatch, roleId]);

	React.useEffect(() => {
		dispatch(roleActions.listRoles());
	}, [dispatch]);

	React.useEffect(() => {
		dispatch(resourceActions.listResources());
		dispatch(actionActions.listActions(undefined));
	}, [dispatch]);

	return {
		role,
		resources,
		actions,
		isLoading: isLoadingDetail || isLoadingList,
	};
}


export function useRoleRemoveEntitlementsHandlers(role: Role | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const { t: translate } = useTranslation();
	const [selectedEntitlements, setSelectedEntitlements] = React.useState<Entitlement[]>([]);
	const [searchQuery, setSearchQuery] = React.useState('');
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const assignedEntitlements = role?.entitlements ?? [];

	const availableEntitlements = React.useMemo(() => {
		const lower = searchQuery.toLowerCase();
		const filtered = assignedEntitlements.filter((ent) => ent.name.toLowerCase().includes(lower));
		const selectedIds = new Set(selectedEntitlements.map((e) => e.id));
		return filtered.filter((ent) => !selectedIds.has(ent.id));
	}, [assignedEntitlements, searchQuery, selectedEntitlements]);

	const handleMoveToSelected = React.useCallback((id: string) => {
		const ent = availableEntitlements.find((e) => e.id === id);
		if (ent) setSelectedEntitlements((prev) => [...prev, ent]);
	}, [availableEntitlements]);

	const handleMoveToAvailable = React.useCallback((id: string) => {
		setSelectedEntitlements((prev) => prev.filter((e) => e.id !== id));
	}, []);

	const handleConfirm = React.useCallback(() => {
		// UI-only placeholder: simulate submit and reset
		setIsSubmitting(true);
		setTimeout(() => setIsSubmitting(false), 400);
	}, []);

	const handleCancel = React.useCallback(() => {
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}, [navigate, location]);

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

	return {
		selectedEntitlements,
		availableEntitlements,
		searchQuery,
		setSearchQuery,
		isSubmitting,
		handleMoveToSelected,
		handleMoveToAvailable,
		handleConfirm,
		handleCancel,
		translate,
		breadcrumbItems,
	};
}

