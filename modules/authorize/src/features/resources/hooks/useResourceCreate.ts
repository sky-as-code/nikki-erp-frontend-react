import { useSubmit } from '@nikkierp/ui/hooks';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { AuthorizeDispatch, resourceActions, selectCreateResource } from '@/appState';
import { Resource } from '@/features/resources';
import { validateResourceForm } from '@/features/resources/helpers';
import { handleGoBack } from '@/utils';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


export function useResourceCreate() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const createResource = useMicroAppSelector(selectCreateResource);

	// eslint-disable-next-line @stylistic/max-len
	const handleSubmit = useSubmit<Resource>({submitAction: resourceActions.createResource, validate: validateResourceForm});

	const isSubmitting = createResource.status === 'pending';

	React.useEffect(() => {
		if (createResource.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.resource.messages.create_success', { name: createResource.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(resourceActions.resetCreateResource());
			dispatch(resourceActions.listResources());
			handleGoBack(navigate, location);
		}

		if (createResource.status === 'error') {
			notification.showError(
				createResource.error ?? translate('nikki.general.errors.create_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(resourceActions.resetCreateResource());
		}
	}, [createResource, location.pathname]);

	return { isSubmitting, handleSubmit };
}
