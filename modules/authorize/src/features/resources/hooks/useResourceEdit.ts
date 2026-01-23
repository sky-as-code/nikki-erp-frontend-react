import { AuthorizeDispatch, resourceActions, selectUpdateResource } from '@/appState';
import { cleanFormData } from '@nikkierp/common/utils';
import { useUIState } from '@nikkierp/shell/contexts';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { Resource } from '@/features/resources';
import { validateResourceForm } from '@/features/resources/helpers';
import { handleGoBack } from '@/utils';



function validateDescriptionChange(
	newDescription: string | null | undefined,
	originalDescription: string | null | undefined,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
): boolean {
	const newDesc = newDescription ?? null;
	const originalDesc = originalDescription ?? null;

	if (newDesc === originalDesc) {
		notification.showError(
			translate('nikki.authorize.resource.errors.description_not_changed'),
			translate('nikki.general.messages.no_changes'),
		);
		return false;
	}

	if (originalDesc !== null && originalDesc !== undefined && originalDesc !== '' && newDesc === null) {
		notification.showError(
			translate('nikki.authorize.resource.errors.description_cannot_remove'),
			translate('nikki.general.messages.invalid_change'),
		);
		return false;
	}

	return true;
}

function useSubmitHandler(
	resource: Resource | undefined,
	dispatch: AuthorizeDispatch,
	notification: ReturnType<typeof useUIState>['notification'],
	translate: ReturnType<typeof useTranslation>['t'],
) {
	return (data: Resource, form: UseFormReturn<Resource>) => {
		if (!resource) return;
		const formData = cleanFormData<Resource>(data);

		if (!validateResourceForm(formData, form)) return;

		const newDescription = formData.description ?? null;
		if (!validateDescriptionChange(newDescription, resource.description, notification, translate)) return;

		dispatch(resourceActions.updateResource({
			id: resource.id,
			etag: resource.etag,
			description: newDescription ?? undefined,
		}));
	};
}

export function useResourceEdit(resource: Resource | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const updateCommand = useMicroAppSelector(selectUpdateResource);

	const handleSubmit = useSubmitHandler(resource, dispatch, notification, translate);

	const isSubmitting = updateCommand.status === 'pending';

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.resource.messages.update_success'),
				translate('nikki.general.messages.success'),
			);
			dispatch(resourceActions.resetUpdateResource());
			dispatch(resourceActions.listResources());
			handleGoBack(navigate, location);
		}

		if (updateCommand.status === 'error') {
			notification.showError(
				updateCommand.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(resourceActions.resetUpdateResource());
		}

	}, [updateCommand, location.pathname]);

	return { isSubmitting, handleSubmit };
}
