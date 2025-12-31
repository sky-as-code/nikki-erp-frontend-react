import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import {
	AuthorizeDispatch,
	actionActions,
	entitlementActions,
	resourceActions,
	selectActionState,
	selectEntitlementState,
	selectResourceState,
} from '@/appState';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Entitlement } from '@/features/entitlements';


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
	resources: unknown[],
	actions: unknown[],
	dispatch: AuthorizeDispatch,
) {
	React.useEffect(() => {
		if (resources.length === 0) {
			dispatch(resourceActions.listResources());
		}
		if (actions.length === 0) {
			dispatch(actionActions.listActions(undefined));
		}
	}, [dispatch, resources.length, actions.length]);
}

function useEntitlementDetailData() {
	const { entitlementId } = useParams<{ entitlementId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const {
		entitlements,
		isLoadingList,
		entitlementDetail,
		isLoadingDetail,
	} = useMicroAppSelector(selectEntitlementState);

	const entitlement = useEntitlementData(entitlementId, entitlements, entitlementDetail);
	useEntitlementEffects(entitlementId, entitlement, entitlements, dispatch);

	const { resources } = useMicroAppSelector(selectResourceState);
	const { actions } = useMicroAppSelector(selectActionState);
	useResourcesAndActionsEffects(resources, actions, dispatch);

	return { entitlement, isLoading: isLoadingList || isLoadingDetail, resources, actions };
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
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): boolean {
	if (newDescription === originalDescription && newName === originalName) {
		notification.showError(
			translate('nikki.general.messages.no_changes'),
			translate('nikki.general.messages.error'),
		);
		setIsSubmitting(false);
		return false;
	}

	if (originalDescription !== null && newDescription === null) {
		notification.showError(
			translate('nikki.general.messages.invalid_change'),
			translate('nikki.general.messages.error'),
		);
		setIsSubmitting(false);
		return false;
	}

	return true;
}

function handleUpdateResult(
	result: Awaited<ReturnType<ReturnType<typeof entitlementActions.updateEntitlement>>>,
	entitlement: Entitlement,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	if (result.meta.requestStatus === 'fulfilled') {
		notification.showInfo(
			translate('nikki.authorize.entitlement.messages.update_success', { name: entitlement.name }),
			translate('nikki.general.messages.success'),
		);
		const parent = resolvePath('..', location.pathname).pathname;
		navigate(parent);
	}
	else {
		const errorMessage = typeof result.payload === 'string' ? result.payload : translate('nikki.general.errors.update_failed');
		notification.showError(errorMessage, translate('nikki.general.messages.error'));
	}
}

function prepareUpdatePayload(
	entitlement: Entitlement,
	formData: Partial<Entitlement>,
) {
	const newDescription = formData.description ?? null;
	const originalDescription = entitlement.description ?? null;
	const newName = formData.name ?? entitlement.name;
	const originalName = entitlement.name;

	return {
		newDescription,
		originalDescription,
		newName,
		originalName,
		updatePayload: {
			id: entitlement.id,
			etag: entitlement.etag || '',
			name: newName !== originalName ? newName : undefined,
			description: newDescription !== originalDescription
				? (newDescription ?? undefined)
				: undefined,
		},
	};
}

function performEntitlementUpdate(
	entitlement: Entitlement,
	updatePayload: {
		id: string;
		etag: string;
		name?: string;
		description?: string;
	},
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	return dispatch(entitlementActions.updateEntitlement(updatePayload)).then((result) => {
		handleUpdateResult(result, entitlement, notification, translate, navigate, location);
	});
}

function checkValidation(
	entitlement: Entitlement,
	formData: Partial<Entitlement>,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): boolean {
	const {
		newDescription,
		originalDescription,
		newName,
		originalName,
	} = prepareUpdatePayload(entitlement, formData);

	return validateEntitlementChanges(
		newDescription,
		originalDescription,
		newName,
		originalName,
		notification,
		translate,
		setIsSubmitting,
	);
}

function validateAndPrepareUpdate(
	entitlement: Entitlement,
	formData: Partial<Entitlement>,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): {
	updatePayload: {
		id: string;
		etag: string;
		name?: string;
		description?: string;
	};
} | null {
	if (!checkValidation(entitlement, formData, notification, translate, setIsSubmitting)) {
		return null;
	}

	const { updatePayload } = prepareUpdatePayload(entitlement, formData);
	return { updatePayload };
}

async function processEntitlementUpdate(
	entitlement: Entitlement,
	formData: Partial<Entitlement>,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	const validated = validateAndPrepareUpdate(
		entitlement,
		formData,
		notification,
		translate,
		setIsSubmitting,
	);

	if (!validated) {
		return;
	}

	await performEntitlementUpdate(
		entitlement,
		validated.updatePayload,
		dispatch,
		notification,
		translate,
		navigate,
		location,
	);
}

function handleUpdateError(
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
) {
	notification.showError(
		translate('nikki.general.errors.update_failed'),
		translate('nikki.general.messages.error'),
	);
}

async function handleEntitlementUpdate(
	entitlement: Entitlement,
	formData: Partial<Entitlement>,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	setIsSubmitting(true);
	try {
		await processEntitlementUpdate(
			entitlement,
			formData,
			dispatch,
			notification,
			translate,
			navigate,
			location,
			setIsSubmitting,
		);
	}
	catch {
		handleUpdateError(notification, translate);
	}
	finally {
		setIsSubmitting(false);
	}
}

async function executeEntitlementUpdate(
	data: unknown,
	entitlement: Entitlement,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	const formData = cleanFormData(data as Partial<Entitlement>);
	await handleEntitlementUpdate(
		entitlement,
		formData,
		dispatch,
		notification,
		translate,
		navigate,
		location,
		setIsSubmitting,
	);
}

function useSubmitHandler(
	entitlement: Entitlement | undefined,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	return React.useCallback(async (data: unknown) => {
		if (!entitlement) return;
		await executeEntitlementUpdate(
			data,
			entitlement,
			dispatch,
			notification,
			translate,
			navigate,
			location,
			setIsSubmitting,
		);
	}, [dispatch, notification, entitlement, navigate, location, translate, setIsSubmitting]);
}

function useEntitlementDetailHandlers(entitlement: Entitlement | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(
		entitlement,
		dispatch,
		notification,
		translate,
		navigate,
		location,
		setIsSubmitting,
	);

	return { isSubmitting, handleCancel, handleSubmit };
}

export const useEntitlementDetail = {
	detail: useEntitlementDetailData,
	handlers: useEntitlementDetailHandlers,
};

