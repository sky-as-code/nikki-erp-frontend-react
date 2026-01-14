import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { useUIState } from '../../../../../shell/src/context/UIProviders';

import type { Action } from '@/features/actions';

import { AuthorizeDispatch, actionActions, selectCreateAction } from '@/appState';


function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

function useSubmitHandler(
	dispatch: AuthorizeDispatch,
) {
	return React.useCallback((data: unknown) => {
		// Thay doi lai as type
		const formData = cleanFormData(data as Partial<Action>);
		formData.createdBy = '01JWNNJGS70Y07MBEV3AQ0M526';

		dispatch(actionActions.createAction(
			formData as Omit<Action, 'id' | 'createdAt' | 'etag' | 'resources' | 'entitlementsCount'>,
		));
	}, [dispatch]);
}

export function useActionCreateHandlers() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createCommand = useMicroAppSelector(selectCreateAction);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(dispatch);

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

