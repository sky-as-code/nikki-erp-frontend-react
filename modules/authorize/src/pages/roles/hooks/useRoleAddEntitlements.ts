import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import {
	AuthorizeDispatch,
	actionActions,
	entitlementActions,
	resourceActions,
	roleActions,
	selectActionState,
	selectEntitlementState,
	selectResourceState,
	selectRoleState,
} from '@/appState';
import { Role } from '@/features/roles/types';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Entitlement } from '@/features/entitlements/types';


// ============ Helper Functions ============

function findRoleById(roleId: string | undefined, roles: Role[], roleDetail: Role | null) {
	if (!roleId) return undefined;
	const fromList = roles.find((r: Role) => r.id === roleId);
	return fromList ?? (roleDetail?.id === roleId ? roleDetail : undefined);
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

function buildEntitlementInputs(selected: Entitlement[], scopeRefs: Record<string, string>) {
	return selected.map((ent) => ({ entitlementId: ent.id, scopeRef: scopeRefs[ent.id] || undefined }));
}


// ============ Data Hook ============

export function useRoleAddEntitlementsData() {
	const { roleId } = useParams<{ roleId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { roles, isLoadingList, roleDetail, isLoadingDetail } = useMicroAppSelector(selectRoleState);
	const { entitlements } = useMicroAppSelector(selectEntitlementState);
	const { resources } = useMicroAppSelector(selectResourceState);
	const { actions } = useMicroAppSelector(selectActionState);

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
		dispatch(actionActions.listActions(undefined));
	}, [dispatch]);

	return { role, entitlements, resources, actions, isLoading: isLoadingList || isLoadingDetail };
}


// ============ Handlers Hook ============

export function useRoleAddEntitlementsHandlers(role: Role | undefined, entitlements: Entitlement[]) {
	const [selectedEntitlements, setSelectedEntitlements] = React.useState<Entitlement[]>([]);
	const [selectedScopeRefs, setSelectedScopeRefs] = React.useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState('');

	const availableEntitlements = React.useMemo(
		() => computeAvailableEntitlements(entitlements, role?.entitlements, selectedEntitlements, searchQuery),
		[entitlements, role?.entitlements, selectedEntitlements, searchQuery],
	);

	const { handleGoBack, handleConfirm } = useRoleAddEntitlementsActions(
		role, selectedEntitlements, selectedScopeRefs, setIsSubmitting,
	);

	const handlers = useTransferHandlers(availableEntitlements, setSelectedEntitlements, setSelectedScopeRefs);

	return {
		selectedEntitlements, selectedScopeRefs, availableEntitlements, isSubmitting, searchQuery, setSearchQuery,
		handleGoBack, handleConfirm, ...handlers,
	};
}

function useTransferHandlers(
	availableEntitlements: Entitlement[],
	setSelectedEntitlements: React.Dispatch<React.SetStateAction<Entitlement[]>>,
	setSelectedScopeRefs: React.Dispatch<React.SetStateAction<Record<string, string>>>,
) {
	const handleMoveToSelected = React.useCallback((id: string) => {
		const ent = availableEntitlements.find((e) => e.id === id);
		if (ent) setSelectedEntitlements((prev) => [...prev, ent]);
	}, [availableEntitlements, setSelectedEntitlements]);

	const handleMoveToAvailable = React.useCallback((id: string) => {
		setSelectedEntitlements((prev) => prev.filter((e) => e.id !== id));
		setSelectedScopeRefs((prev) => { const n = { ...prev }; delete n[id]; return n; });
	}, [setSelectedEntitlements, setSelectedScopeRefs]);

	const handleScopeRefChange = React.useCallback((id: string, val: string) => {
		setSelectedScopeRefs((prev) => ({ ...prev, [id]: val }));
	}, [setSelectedScopeRefs]);

	return { handleMoveToSelected, handleMoveToAvailable, handleScopeRefChange };
}


// ============ Actions Hook ============

function useRoleAddEntitlementsActions(
	role: Role | undefined,
	selectedEntitlements: Entitlement[],
	selectedScopeRefs: Record<string, string>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	const navigate = useNavigate();
	const location = useLocation();

	const handleGoBack = React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);

	const handleConfirm = useConfirmHandler(
		role, selectedEntitlements, selectedScopeRefs, setIsSubmitting, handleGoBack,
	);

	return { handleGoBack, handleConfirm };
}

function useConfirmHandler(
	role: Role | undefined,
	selectedEntitlements: Entitlement[],
	selectedScopeRefs: Record<string, string>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
	handleGoBack: () => void,
) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	return React.useCallback(async () => {
		if (!role) return;

		setIsSubmitting(true);
		const inputs = buildEntitlementInputs(selectedEntitlements, selectedScopeRefs);
		const result = await dispatch(roleActions.addEntitlementsToRole({
			roleId: role.id, etag: role.etag || '', entitlementInputs: inputs,
		}));

		if (result.meta.requestStatus === 'fulfilled') {
			notification.showInfo(translate('nikki.authorize.role.messages.add_entitlements_success'), translate('nikki.general.messages.success'));
			dispatch(roleActions.getRole(role.id));
			handleGoBack();
		}
		else {
			const msg = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.update_failed');
			notification.showError(msg, translate('nikki.general.messages.error'));
		}

		setIsSubmitting(false);
	}, [dispatch, notification, role, selectedEntitlements, selectedScopeRefs, translate, handleGoBack]);
}
