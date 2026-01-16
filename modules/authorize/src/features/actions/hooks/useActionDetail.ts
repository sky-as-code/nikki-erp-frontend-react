import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import { AuthorizeDispatch, actionActions, selectActionState, selectUpdateAction } from '@/appState';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Action } from '@/features/actions';


function useActionDetailData() {
	const { actionId } = useParams<{ actionId: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { actions, list, actionDetail } = useMicroAppSelector(selectActionState);

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

	return { action, isLoading: list.isLoading, actionId };
}

function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

function validateDescriptionChange(
	newDescription: string | null,
	originalDescription: string | null,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
): boolean {
	if (newDescription === originalDescription) {
		notification.showError(
			translate('nikki.authorize.resource.errors.description_not_changed'),
			translate('nikki.general.messages.no_changes'),
		);
		return false;
	}
	return true;
}

function useSubmitHandler(
	action: Action | undefined,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
) {
	return React.useCallback((data: unknown) => {
		if (!action) return;

		const formData = cleanFormData(data as Partial<Action>);
		const newDescription = formData.description ?? null;
		const originalDescription = action.description ?? null;

		if (!validateDescriptionChange(newDescription, originalDescription, notification, translate)) {
			return;
		}

		dispatch(actionActions.updateAction({
			actionId: action.id,
			etag: action.etag || '',
			description: newDescription ?? undefined,
		}));
	}, [dispatch, notification, action, translate]);
}

// eslint-disable-next-line max-lines-per-function
function useActionDetailHandlers(action: Action | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const updateCommand = useMicroAppSelector(selectUpdateAction);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(
		action,
		dispatch,
		notification,
		translate,
	);

	const isSubmitting = updateCommand.status === 'pending';

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.action.messages.update_success', { name: updateCommand.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(actionActions.resetUpdateAction());
			const parent = resolvePath('..', location.pathname).pathname;
			navigate(parent);
		}

		if (updateCommand.status === 'error') {
			notification.showError(
				updateCommand.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(actionActions.resetUpdateAction());
		}
	// eslint-disable-next-line @stylistic/max-len
	}, [updateCommand.status, updateCommand.data, updateCommand.error, notification, translate, dispatch, navigate, location]);

	return { isSubmitting, handleCancel, handleSubmit };
}

export const useActionDetail = {
	detail: useActionDetailData,
	handlers: useActionDetailHandlers,
};

