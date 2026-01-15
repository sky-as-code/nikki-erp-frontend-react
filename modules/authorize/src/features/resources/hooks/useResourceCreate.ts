import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate } from 'react-router';

import { AuthorizeDispatch, resourceActions, selectCreateResource } from '@/appState';
import { Resource } from '@/features/resources';
import { validateResourceForm } from '@/features/resources/helpers';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


type FormType = Parameters<typeof validateResourceForm>[2];


function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

function useSubmitHandler(
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
) {
	return React.useCallback((data: Partial<Resource>, form: FormType) => {
		const formData = cleanFormData(data);

		if (!validateResourceForm(formData, true, form)) {
			return;
		}

		dispatch(resourceActions.createResource(
			formData as Omit<Resource, 'id' | 'createdAt' | 'etag' | 'actions' | 'actionsCount'>,
		));
	}, [dispatch, notification, translate]);
}

export function useResourceCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createCommand = useMicroAppSelector(selectCreateResource);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(dispatch, notification, translate);

	const isSubmitting = createCommand.status === 'pending';

	React.useEffect(() => {
		if (createCommand.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.resource.messages.create_success', { name: createCommand.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(resourceActions.resetCreateResource());
			const parent = resolvePath('..', location.pathname).pathname;
			navigate(parent);
		}

		if (createCommand.status === 'error') {
			notification.showError(
				createCommand.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(resourceActions.resetCreateResource());
		}
	// eslint-disable-next-line @stylistic/max-len
	}, [createCommand.status, createCommand.data, createCommand.error, notification, translate, dispatch, navigate, location]);

	return { isSubmitting, handleCancel, handleSubmit };
}
