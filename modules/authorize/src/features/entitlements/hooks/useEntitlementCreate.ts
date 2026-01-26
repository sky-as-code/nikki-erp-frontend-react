import { cleanFormData } from '@nikkierp/common/utils';
import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import type { Action } from '@/features/actions';
import type { Entitlement } from '@/features/entitlements';
import type { Resource } from '@/features/resources';

import {
	AuthorizeDispatch,
	actionActions,
	entitlementActions,
	resourceActions,
	selectActionState,
	selectResourceList,
	selectCreateEntitlement,
} from '@/appState';
import {
	buildActionExpr,
	validateEntitlementForm,
} from '@/features/entitlements/helpers/entitlementFormValidation';


type FormType = Parameters<typeof validateEntitlementForm>[2];

function useEntitlementCreateData() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const resourceListState = useMicroAppSelector(selectResourceList);
	const actionState = useMicroAppSelector(selectActionState);
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

	return { resources, actions };
}

function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

function useSubmitHandler(
	resources: Resource[],
	actions: Action[],
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
) {
	return React.useCallback((data: unknown, form: FormType) => {
		const formData = cleanFormData(data as Partial<Entitlement>);

		if (!validateEntitlementForm(formData, true, form)) {
			return;
		}

		formData.actionExpr = buildActionExpr(formData, resources, actions);
		formData.createdBy = '01JWNNJGS70Y07MBEV3AQ0M526';

		dispatch(entitlementActions.createEntitlement(
			formData as Omit<Entitlement, 'id' | 'createdAt' | 'etag' | 'assignmentsCount' | 'rolesCount'>,
		));
	}, [dispatch, notification, translate, resources, actions]);
}


export function useEntitlementCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const { resources, actions } = useEntitlementCreateData();

	const createCommand = useMicroAppSelector(selectCreateEntitlement);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(
		resources,
		actions,
		dispatch,
		notification,
		translate,
	);

	const isSubmitting = createCommand.status === 'pending';

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.entitlement.messages.create_success', { name: createCommand.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(entitlementActions.resetCreateEntitlement());
			const parent = resolvePath('..', location.pathname).pathname;
			navigate(parent);
		}

		if (createCommand.status === 'error') {
			notification.showError(
				createCommand.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(entitlementActions.resetCreateEntitlement());
		}
	}, [createCommand, location.pathname]);

	return { isSubmitting, handleCancel, handleSubmit, resources, actions };
}

