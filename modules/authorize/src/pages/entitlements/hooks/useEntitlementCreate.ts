import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import {
	AuthorizeDispatch,
	actionActions,
	entitlementActions,
	resourceActions,
	selectActionState,
	selectResourceState,
} from '@/appState';
import {
	buildActionExpr,
	validateEntitlementForm,
} from '@/features/entitlements/validation/entitlementFormValidation';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Action } from '@/features/actions';
import type { Entitlement } from '@/features/entitlements';
import type { Resource } from '@/features/resources';


type FormType = Parameters<typeof validateEntitlementForm>[2];

function useEntitlementCreateData() {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { resources } = useMicroAppSelector(selectResourceState);
	const { actions } = useMicroAppSelector(selectActionState);

	React.useEffect(() => {
		if (resources.length === 0) {
			dispatch(resourceActions.listResources());
		}
		if (actions.length === 0) {
			dispatch(actionActions.listActions(undefined));
		}
	}, [dispatch, resources.length, actions.length]);

	return { resources, actions };
}

function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

function handleCreateResult(
	result: Awaited<ReturnType<ReturnType<typeof entitlementActions.createEntitlement>>>,
	formData: Partial<Entitlement>,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	if (result.meta.requestStatus === 'fulfilled') {
		notification.showInfo(
			translate('nikki.authorize.entitlement.messages.create_success', { name: formData.name }),
			translate('nikki.general.messages.success'),
		);
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}
	else {
		const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.create_failed');
		notification.showError(errorMessage, translate('nikki.general.messages.error'));
	}
}

function useSubmitHandler(
	resources: Resource[],
	actions: Action[],
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	return React.useCallback(async (data: unknown, form: FormType) => {
		const formData = cleanFormData(data as Partial<Entitlement>);
		setIsSubmitting(true);

		if (!validateEntitlementForm(formData, true, form)) {
			setIsSubmitting(false);
			return;
		}

		formData.actionExpr = buildActionExpr(formData, resources, actions);
		formData.createdBy = '01JWNNJGS70Y07MBEV3AQ0M526';

		const result = await dispatch(entitlementActions.createEntitlement(
			formData as Omit<Entitlement, 'id' | 'createdAt' | 'etag' | 'assignmentsCount' | 'rolesCount'>,
		));

		handleCreateResult(result, formData, notification, translate, navigate, location);
		setIsSubmitting(false);
	}, [dispatch, notification, location, translate, navigate, resources, actions, setIsSubmitting]);
}

export function useEntitlementCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const { resources, actions } = useEntitlementCreateData();

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(
		resources,
		actions,
		dispatch,
		notification,
		translate,
		navigate,
		location,
		setIsSubmitting,
	);

	return { isSubmitting, handleCancel, handleSubmit, resources, actions };
}

