import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import {
	AuthorizeDispatch,
	resourceActions,
	roleActions,
	selectResourceState,
	selectRoleState,
} from '@/appState';
import { createEntitlementKey } from '@/utils';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Entitlement } from '@/features/entitlements';
import type { Role } from '@/features/roles';


function buildEntitlementInputs(selected: Entitlement[]) {
	return selected.map((ent) => ({
		entitlementId: ent.id,
		scopeRef: ent.scopeRef || undefined,
	}));
}

function handleRemoveSuccess(
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	role: Role,
	handleGoBack: () => void,
) {
	const msg = translate('nikki.authorize.role.messages.remove_entitlements_success');
	notification.showInfo(msg, translate('nikki.general.messages.success'));
	dispatch(roleActions.getRole(role.id));
	handleGoBack();
}

function handleRemoveError(
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	payload: unknown,
) {
	const errorMsg = typeof payload === 'string'
		? payload
		: translate('nikki.general.errors.update_failed');
	notification.showError(errorMsg, translate('nikki.general.messages.error'));
}

export function useRoleRemoveEntitlementsData() {
	const { roleId } = useParams<{ roleId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { roles, roleDetail, isLoadingDetail, isLoadingList } = useMicroAppSelector(selectRoleState);
	const { resources } = useMicroAppSelector(selectResourceState);

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
		if (roles.length === 0) dispatch(roleActions.listRoles());
	}, [dispatch, roles.length]);

	React.useEffect(() => {
		dispatch(resourceActions.listResources());
	}, [dispatch]);

	return {
		role,
		resources,
		isLoading: isLoadingDetail || isLoadingList,
	};
}

function useEntitlementSelection(assignedEntitlements: Entitlement[], searchQuery: string) {
	const [selectedEntitlementKeys, setSelectedEntitlementKeys] = React.useState<Set<string>>(new Set());

	const availableEntitlements = React.useMemo(() => {
		const lower = searchQuery.toLowerCase();
		const filtered = assignedEntitlements.filter((ent) => ent.name.toLowerCase().includes(lower));
		return filtered.filter((ent) => !selectedEntitlementKeys.has(createEntitlementKey(ent)));
	}, [assignedEntitlements, searchQuery, selectedEntitlementKeys]);

	const selectedEntitlements = React.useMemo(() => {
		return assignedEntitlements.filter((ent) => selectedEntitlementKeys.has(createEntitlementKey(ent)));
	}, [assignedEntitlements, selectedEntitlementKeys]);

	const handleMoveToSelected = React.useCallback((entitlement: Entitlement) => {
		setSelectedEntitlementKeys((prev) => new Set(prev).add(createEntitlementKey(entitlement)));
	}, []);

	const handleMoveToAvailable = React.useCallback((entitlement: Entitlement) => {
		setSelectedEntitlementKeys((prev) => {
			const next = new Set(prev);
			next.delete(createEntitlementKey(entitlement));
			return next;
		});
	}, []);

	return {
		selectedEntitlements,
		availableEntitlements,
		handleMoveToSelected,
		handleMoveToAvailable,
	};
}

function useRemoveConfirmHandler(
	role: Role | undefined,
	selectedEntitlements: Entitlement[],
	assignedEntitlements: Entitlement[],
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	handleGoBack: () => void,
) {
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleConfirm = React.useCallback(async () => {
		if (!role) return;

		setIsSubmitting(true);
		const inputs = buildEntitlementInputs(selectedEntitlements);
		const result = await dispatch(roleActions.removeEntitlementsFromRole({
			roleId: role.id, etag: role.etag || '', entitlementInputs: inputs,
		}));

		if (result.meta.requestStatus === 'fulfilled') {
			handleRemoveSuccess(dispatch, notification, translate, role, handleGoBack);
		}
		else {
			handleRemoveError(notification, translate, result.payload);
		}

		setIsSubmitting(false);
	}, [dispatch, notification, role, selectedEntitlements, translate, handleGoBack]);

	return { isSubmitting, handleConfirm };
}

function useNavigationHandlers() {
	const navigate = useNavigate();
	const location = useLocation();

	const handleGoBack = React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);

	return { handleGoBack };
}

export function useRoleRemoveEntitlementsHandlers(role: Role | undefined) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [searchQuery, setSearchQuery] = React.useState('');
	const { handleGoBack } = useNavigationHandlers();

	const assignedEntitlements = role?.entitlements ?? [];
	const {
		selectedEntitlements,
		availableEntitlements,
		handleMoveToSelected,
		handleMoveToAvailable,
	} = useEntitlementSelection(assignedEntitlements, searchQuery);

	const { isSubmitting, handleConfirm } = useRemoveConfirmHandler(
		role, selectedEntitlements, assignedEntitlements,
		dispatch, notification, translate, handleGoBack,
	);

	return {
		selectedEntitlements,
		availableEntitlements,
		searchQuery,
		setSearchQuery,
		isSubmitting,
		handleMoveToSelected,
		handleMoveToAvailable,
		handleConfirm,
		handleCancel: handleGoBack,
	};
}
