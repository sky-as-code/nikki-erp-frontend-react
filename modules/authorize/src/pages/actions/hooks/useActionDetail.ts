import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import { AuthorizeDispatch, actionActions, selectActionState } from '@/appState';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Action } from '@/features/actions';


function useActionDetailData() {
	const { actionId } = useParams<{ actionId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { actions, isLoadingList, actionDetail, isLoadingDetail } = useMicroAppSelector(selectActionState);

	const action = React.useMemo(() => {
		if (!actionId) return undefined;
		const fromList = actions.find((a: Action) => a.id === actionId);

		if (fromList) return fromList;

		return actionDetail?.id === actionId ? actionDetail : undefined;
	}, [actionId, actions, actionDetail]);

	React.useEffect(() => {
		if (actionId && !action) {
			dispatch(actionActions.getAction({ actionId }));
		}
	}, [dispatch, actionId, action]);

	React.useEffect(() => {
		if (actions.length === 0) {
			dispatch(actionActions.listActions(undefined));
		}
	}, [dispatch, actions.length]);

	return { action, isLoading: isLoadingList || isLoadingDetail, actionId };
}

function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

function handleUpdateResult(
	result: Awaited<ReturnType<ReturnType<typeof actionActions.updateAction>>>,
	action: Action,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	if (result.meta.requestStatus === 'fulfilled') {
		notification.showInfo(
			translate('nikki.authorize.action.messages.update_success', { name: action.name }),
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

function validateDescriptionChange(
	newDescription: string | null,
	originalDescription: string | null,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
): boolean {
	if (newDescription === originalDescription) {
		notification.showError(
			translate('nikki.authorize.resource.errors.description_not_changed'),
			translate('nikki.general.messages.no_changes'),
		);
		setIsSubmitting(false);
		return false;
	}
	return true;
}

function performActionUpdate(
	action: Action,
	formData: Partial<Action>,
	newDescription: string | null,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
) {
	return dispatch(actionActions.updateAction({
		actionId: action.id,
		etag: action.etag || '',
		description: newDescription ?? undefined,
	})).then((result) => {
		handleUpdateResult(result, action, notification, translate, navigate, location);
	});
}

async function executeActionUpdate(
	data: unknown,
	action: Action,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	const formData = cleanFormData(data as Partial<Action>);
	setIsSubmitting(true);

	const newDescription = formData.description ?? null;
	const originalDescription = action.description ?? null;

	if (!validateDescriptionChange(newDescription, originalDescription, notification, translate, setIsSubmitting)) {
		return;
	}

	await performActionUpdate(
		action,
		formData,
		newDescription,
		dispatch,
		notification,
		translate,
		navigate,
		location,
	);
	setIsSubmitting(false);
}

function useSubmitHandler(
	action: Action | undefined,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
	navigate: ReturnType<typeof useNavigate>,
	location: ReturnType<typeof useLocation>,
	setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
) {
	return React.useCallback(async (data: unknown) => {
		if (!action) return;
		await executeActionUpdate(data, action, dispatch, notification, translate, navigate, location, setIsSubmitting);
	}, [dispatch, notification, action, navigate, location, translate, setIsSubmitting]);
}

function useActionDetailHandlers(action: Action | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(
		action,
		dispatch,
		notification,
		translate,
		navigate,
		location,
		setIsSubmitting,
	);

	return { isSubmitting, handleCancel, handleSubmit };
}

export const useActionDetail = {
	detail: useActionDetailData,
	handlers: useActionDetailHandlers,
};

