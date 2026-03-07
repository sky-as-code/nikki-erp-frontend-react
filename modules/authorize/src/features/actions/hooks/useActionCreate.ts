import { cleanFormData } from '@nikkierp/common/utils';
import { useUIState } from '@nikkierp/shell/contexts';
import { useUserContext } from '@nikkierp/shell/userContext';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import type { Action } from '@/features/actions';

import { AuthorizeDispatch, actionActions, selectCreateAction } from '@/appState';


function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

function useSubmitHandler(
	dispatch: AuthorizeDispatch,
	userId: string,
) {
	return React.useCallback((data: Action) => {
		const formData = cleanFormData(data) as Action;
		formData.createdBy = userId;
		dispatch(actionActions.createAction(formData));
	}, [dispatch]);
}

export function useActionCreate() {
	const userContext = useUserContext();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createCommand = useMicroAppSelector(selectCreateAction);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(dispatch, userContext.user!.id);

	const isSubmitting = createCommand.status === 'pending';

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.action.messages.create_success', { name: createCommand.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(actionActions.resetCreateAction());
			const parent = resolvePath('..', location.pathname).pathname;
			navigate(parent);
		}

		if (createCommand.status === 'error') {
			notification.showError(
				createCommand.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(actionActions.resetCreateAction());
		}
	// eslint-disable-next-line @stylistic/max-len
	}, [createCommand.status, createCommand.data, createCommand.error, notification, translate, dispatch, navigate, location]);

	return { isSubmitting, handleSubmit, handleCancel };
}

