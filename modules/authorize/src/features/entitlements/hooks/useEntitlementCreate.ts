import { cleanFormData } from '@nikkierp/common/utils';
import { useUIState } from '@nikkierp/shell/contexts';
import { useUserContext } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import type { Action } from '@/features/actions';
import type { Entitlement } from '@/features/entitlements';
import type { Resource } from '@/features/resources';

import {
	AuthorizeDispatch,
	entitlementActions,
	resourceActions,
	selectResourceList,
	selectCreateEntitlement,
} from '@/appState';
import {
	buildActionExpr,
	validateEntitlementForm,
} from '@/features/entitlements/helpers/entitlementFormValidation';


type FormType = Parameters<typeof validateEntitlementForm>[2];

function extractActionsFromResources(resources: Resource[]): Action[] {
	return resources.flatMap((resource) => resource.actions ?? []);
}

function useEntitlementCreateData() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const resourceListState = useMicroAppSelector(selectResourceList);
	const resources = resourceListState.data ?? [];

	React.useEffect(() => {
		if (resourceListState.status === 'idle' || (resourceListState.status === 'success' && resources.length === 0)) {
			dispatch(resourceActions.listResources());
		}
	}, [resourceListState.status, resources.length]);

	return { resources };
}

function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [location]);
}

function useSubmitHandler(
	resources: Resource[],
	actions: Action[],
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	userId: string,
) {
	return React.useCallback((data: unknown, form: FormType) => {
		const formData = cleanFormData(data as Partial<Entitlement>);

		if (!validateEntitlementForm(formData, true, form)) {
			return;
		}

		formData.actionExpr = buildActionExpr(formData, resources, actions);
		formData.createdBy = userId;

		dispatch(entitlementActions.createEntitlement(
			formData as Entitlement,
		));
	}, [notification, translate, resources, actions]);
}

export function useEntitlementCreate() {
	const userContext = useUserContext();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const { resources } = useEntitlementCreateData();
	const actions = React.useMemo(() => extractActionsFromResources(resources), [resources]);

	const createCommand = useMicroAppSelector(selectCreateEntitlement);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(
		resources,
		actions,
		dispatch,
		notification,
		translate,
		userContext.user!.id,
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
	}, [createCommand, location]);

	return { isSubmitting, handleCancel, handleSubmit, resources };
}

