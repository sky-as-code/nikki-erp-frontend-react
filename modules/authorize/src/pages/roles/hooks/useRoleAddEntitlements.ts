import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import {
	AuthorizeDispatch,
	entitlementActions,
	resourceActions,
	roleActions,
	selectEntitlementState,
	selectResourceState,
	selectRoleState,
} from '@/appState';
import { Role } from '@/features/roles/types';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Entitlement } from '@/features/entitlements/types';


// ============ Helper Functions ============
function findRoleById(roleId: string | undefined, roles: Role[], roleDetail: Role | undefined) {
	if (!roleId) return undefined;
	if (roleDetail?.id === roleId) return roleDetail;
	return roles.find((r) => r.id === roleId);
}

function computeAvailableEntitlements(
	allEntitlements: Entitlement[],
	roleEntitlements: Entitlement[] | undefined,
	selectedEntitlements: Entitlement[],
	searchQuery: string,
) {
	let result = allEntitlements;

	if (roleEntitlements) {
		const roleIds = new Set(roleEntitlements.map((e) => e.id));
		result = result.filter((e) => !roleIds.has(e.id));
	}

	const selectedIds = new Set(selectedEntitlements.map((e) => e.id));
	result = result.filter((e) => !selectedIds.has(e.id));

	if (searchQuery.trim()) {
		const query = searchQuery.toLowerCase();
		result = result.filter((e) => e.name.toLowerCase().includes(query));
	}

	return result;
}

function buildEntitlementInputs(selected: Entitlement[]) {
	return selected.map((ent) => ({ entitlementId: ent.id, scopeRef: ent.scopeRef || undefined }));
}


// ============ Data Hook ============
export function useRoleAddEntitlementsData() {
	const { roleId } = useParams<{ roleId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { roles, isLoadingList, roleDetail, isLoadingDetail } = useMicroAppSelector(selectRoleState);
	const { entitlements } = useMicroAppSelector(selectEntitlementState);
	const { resources } = useMicroAppSelector(selectResourceState);

	const role = React.useMemo(() => findRoleById(roleId, roles, roleDetail), [roleId, roles, roleDetail]);

	React.useEffect(() => {
		if (roleId && !role) dispatch(roleActions.getRole(roleId));
	}, [dispatch, roleId, role]);

	React.useEffect(() => {
		if (roles.length === 0) dispatch(roleActions.listRoles());
	}, [dispatch, roles.length]);

	React.useEffect(() => {
		dispatch(entitlementActions.listEntitlements());
		dispatch(resourceActions.listResources());
	}, [dispatch]);

	console.log('role', role);

	return { role, entitlements, resources, isLoading: isLoadingList || isLoadingDetail };
}


// ============ Handlers Hook ============
export function useRoleAddEntitlementsHandlers(role: Role | undefined, entitlements: Entitlement[]) {
	const [selectedEntitlements, setSelectedEntitlements] = React.useState<Entitlement[]>([]);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState('');

	const availableEntitlements = React.useMemo(
		() => computeAvailableEntitlements(entitlements, role?.entitlements, selectedEntitlements, searchQuery),
		[entitlements, role?.entitlements, selectedEntitlements, searchQuery],
	);

	const { handleGoBack, handleConfirm } = useRoleAddEntitlementsActions(
		role, selectedEntitlements, setIsSubmitting,
	);

	const handlers = useTransferHandlers(availableEntitlements, setSelectedEntitlements);

	return {
		selectedEntitlements, availableEntitlements, isSubmitting, searchQuery, setSearchQuery,
		handleGoBack, handleConfirm, ...handlers,
	};
}

function useTransferHandlers(
	availableEntitlements: Entitlement[],
	setSelectedEntitlements: React.Dispatch<React.SetStateAction<Entitlement[]>>,
) {
	const handleMoveToSelected = React.useCallback((entitlement: Entitlement) => {
		setSelectedEntitlements((prev) => [...prev, entitlement]);
	}, [setSelectedEntitlements]);

	const handleMoveToAvailable = React.useCallback((entitlement: Entitlement) => {
		setSelectedEntitlements((prev) => prev.filter((e) => e.id !== entitlement.id));
	}, [setSelectedEntitlements]);

	return { handleMoveToSelected, handleMoveToAvailable };
}


// ============ Actions Hook ============
function useRoleAddEntitlementsActions(
	role: Role | undefined,
	selectedEntitlements: Entitlement[],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	const navigate = useNavigate();
	const location = useLocation();

	const handleGoBack = React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);

	const handleConfirm = useConfirmHandler(
		role, selectedEntitlements, setIsSubmitting, handleGoBack,
	);

	return { handleGoBack, handleConfirm };
}

function handleAddEntitlementsSuccess(
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	role: Role,
	handleGoBack: () => void,
) {
	const msg = translate('nikki.authorize.role.messages.add_entitlements_success');
	notification.showInfo(msg, translate('nikki.general.messages.success'));
	dispatch(roleActions.getRole(role.id));
	handleGoBack();
}

function handleAddEntitlementsError(
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	payload: unknown,
) {
	const errorMsg = typeof payload === 'string'
		? payload
		: translate('nikki.general.errors.update_failed');
	notification.showError(errorMsg, translate('nikki.general.messages.error'));
}

function useConfirmHandler(
	role: Role | undefined,
	selectedEntitlements: Entitlement[],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
	handleGoBack: () => void,
) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	return React.useCallback(async () => {
		if (!role) return;

		setIsSubmitting(true);
		const inputs = buildEntitlementInputs(selectedEntitlements);
		const result = await dispatch(roleActions.addEntitlementsToRole({
			roleId: role.id, etag: role.etag || '', entitlementInputs: inputs,
		}));

		if (result.meta.requestStatus === 'fulfilled') {
			handleAddEntitlementsSuccess(dispatch, notification, translate, role, handleGoBack);
		}
		else {
			handleAddEntitlementsError(notification, translate, result.payload);
		}

		setIsSubmitting(false);
	}, [dispatch, notification, role, selectedEntitlements, translate, handleGoBack]);
}
