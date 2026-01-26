import { cleanFormData } from '@nikkierp/common/utils';
import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import type { Entitlement } from '@/features/entitlements';

import {
	AuthorizeDispatch,
	actionActions,
	entitlementActions,
	resourceActions,
	selectActionState,
	selectEntitlementState,
	selectResourceList,
	selectUpdateEntitlement,
} from '@/appState';


function useEntitlementData(
	entitlementId: string | undefined,
	entitlements: Entitlement[],
	entitlementDetail: Entitlement | undefined,
) {
	return React.useMemo(() => {
		if (!entitlementId) return undefined;

		const fromList = entitlements.find((e: Entitlement) => e.id === entitlementId);
		if (fromList) return fromList;

		return entitlementDetail?.id === entitlementId ? entitlementDetail : undefined;
	}, [entitlementId, entitlements, entitlementDetail]);
}

function useEntitlementEffects(
	entitlementId: string | undefined,
	entitlement: Entitlement | undefined,
	entitlements: Entitlement[],
	dispatch: AuthorizeDispatch,
) {
	React.useEffect(() => {
		if (entitlementId && !entitlement) {
			dispatch(entitlementActions.getEntitlement(entitlementId));
		}
	}, [dispatch, entitlementId, entitlement]);

	React.useEffect(() => {
		if (entitlements.length === 0) {
			dispatch(entitlementActions.listEntitlements());
		}
	}, [dispatch, entitlements.length]);
}

function useResourcesAndActionsEffects(
	resourceListState: ReturnType<typeof selectResourceList>,
	actionState: ReturnType<typeof selectActionState>,
	dispatch: AuthorizeDispatch,
) {
	const resources = resourceListState.data ?? [];
	const actions = actionState.actions ?? [];

	React.useEffect(() => {
		if (resourceListState.status === 'idle' || (resourceListState.status === 'success' && resources.length === 0)) {
			dispatch(resourceActions.listResources());
		}
		if (!actionState.list.isLoading && actions.length === 0) {
			dispatch(actionActions.listActions(undefined));
		}
	}, [resourceListState.status, resources.length, actionState.list.isLoading, actions.length]);
}

function useEntitlementDetailData() {
	const { entitlementId } = useParams<{ entitlementId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const {
		entitlements,
		list,
		entitlementDetail,
	} = useMicroAppSelector(selectEntitlementState);

	const entitlement = useEntitlementData(entitlementId, entitlements, entitlementDetail);
	useEntitlementEffects(entitlementId, entitlement, entitlements, dispatch);

	const resourceListState = useMicroAppSelector(selectResourceList);
	const actionState = useMicroAppSelector(selectActionState);
	useResourcesAndActionsEffects(resourceListState, actionState, dispatch);

	const resources = resourceListState.data ?? [];
	const actions = actionState.actions ?? [];

	return { entitlement, isLoading: list.isLoading, resources, actions };
}

function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

function validateEntitlementChanges(
	newDescription: string | null,
	originalDescription: string | null,
	newName: string,
	originalName: string,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
): boolean {
	if (newDescription === originalDescription && newName === originalName) {
		notification.showError(
			translate('nikki.general.messages.no_changes'),
			translate('nikki.general.messages.error'),
		);
		return false;
	}

	if (originalDescription !== null && newDescription === null) {
		notification.showError(
			translate('nikki.general.messages.invalid_change'),
			translate('nikki.general.messages.error'),
		);
		return false;
	}

	return true;
}


function useSubmitHandler(
	entitlement: Entitlement | undefined,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
) {
	return React.useCallback((data: unknown) => {
		if (!entitlement) return;

		const formData = cleanFormData(data as Partial<Entitlement>);

		const newDescription = formData.description ?? null;
		const originalDescription = entitlement.description ?? null;
		const newName = formData.name ?? entitlement.name;
		const originalName = entitlement.name;

		if (!validateEntitlementChanges(
			newDescription,
			originalDescription,
			newName,
			originalName,
			notification,
			translate,
		)) {
			return;
		}

		dispatch(entitlementActions.updateEntitlement({
			id: entitlement.id,
			etag: entitlement.etag || '',
			name: newName !== originalName ? newName : undefined,
			description: newDescription !== originalDescription
				? (newDescription ?? undefined)
				: undefined,
		}));
	}, [dispatch, notification, entitlement, translate]);
}


function useEntitlementDetailHandlers(entitlement: Entitlement | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const updateCommand = useMicroAppSelector(selectUpdateEntitlement);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(
		entitlement,
		dispatch,
		notification,
		translate,
	);

	const isSubmitting = updateCommand.status === 'pending';

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.entitlement.messages.update_success', { name: updateCommand.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(entitlementActions.resetUpdateEntitlement());
			const parent = resolvePath('..', location.pathname).pathname;
			navigate(parent);
		}

		if (updateCommand.status === 'error') {
			notification.showError(
				updateCommand.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(entitlementActions.resetUpdateEntitlement());
		}
	}, [updateCommand, location.pathname]);

	return { isSubmitting, handleCancel, handleSubmit };
}

export const useEntitlementDetail = {
	detail: useEntitlementDetailData,
	handlers: useEntitlementDetailHandlers,
};

