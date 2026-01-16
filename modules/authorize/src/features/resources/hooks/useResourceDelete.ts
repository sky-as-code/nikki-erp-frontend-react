import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AuthorizeDispatch, resourceActions, selectDeleteResource } from '@/appState';
import { type Resource } from '@/features/resources';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


export function useResourceDelete(onRefresh?: () => void) {
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const deleteState = useMicroAppSelector(selectDeleteResource);
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const confirmDelete = React.useCallback(
		(resource: Resource) => {
			dispatch(resourceActions.deleteResource({ name: resource.name }));
		},
		[dispatch],
	);

	React.useEffect(() => {
		if (deleteState.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.resource.messages.delete_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(resourceActions.resetDeleteResource());
			onRefresh?.();
		}
		else if (deleteState.status === 'error') {
			notification.showError(
				deleteState.error ?? translate('nikki.general.errors.delete_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(resourceActions.resetDeleteResource());
		}
	}, [deleteState]);

	return confirmDelete;
}
