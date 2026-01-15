import { cleanFormData } from '@nikkierp/common/utils';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePath, useLocation, useNavigate, useParams } from 'react-router';

import { AuthorizeDispatch, resourceActions, selectResourceState, selectUpdateResource } from '@/appState';
import { Resource } from '@/features/resources';
import { validateResourceForm } from '@/features/resources/helpers';

import { useUIState } from '../../../../../shell/src/context/UIProviders';


type FormType = Parameters<typeof validateResourceForm>[2];

function useResourceDetailData() {
	const { resourceName } = useParams<{ resourceName: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { resources, list } = useMicroAppSelector(selectResourceState);

	const resource = React.useMemo(() => {
		if (!resourceName) return undefined;
		return resources.find((r: Resource) => r.name === resourceName);
	}, [resourceName, resources]);

	React.useEffect(() => {
		if (resources.length === 0) {
			dispatch(resourceActions.listResources());
		}
	}, [dispatch, resources.length]);

	return { resource, isLoading: list.isLoading };
}

function useCancelHandler(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	return React.useCallback(() => {
		navigate(resolvePath('..', location.pathname).pathname);
	}, [navigate, location]);
}

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
	return React.useCallback((data: unknown, form: FormType) => {
		if (!resource) return;

		const formData = cleanFormData(data as Partial<Resource>);

		if (!validateResourceForm(formData, false, form)) {
			return;
		}

		const newDescription = formData.description ?? null;
		if (!validateDescriptionChange(
			newDescription,
			resource.description,
			notification,
			translate,
		)) {
			return;
		}

		dispatch(resourceActions.updateResource({
			id: resource.id,
			etag: resource.etag,
			description: newDescription ?? undefined,
		}));
	}, [dispatch, notification, resource, translate]);
}

// eslint-disable-next-line max-lines-per-function
function useResourceDetailHandlers(resource: Resource | undefined) {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const { notification } = useUIState();
	const { t: translate } = useTranslation();

	const updateCommand = useMicroAppSelector(selectUpdateResource);

	const handleCancel = useCancelHandler(navigate, location);
	const handleSubmit = useSubmitHandler(
		resource,
		dispatch,
		notification,
		translate,
	);

	const isSubmitting = updateCommand.status === 'pending';

	React.useEffect(() => {
		if (updateCommand.status === 'success') {
			notification.showInfo(
				translate('nikki.authorize.resource.messages.update_success', { name: updateCommand.data?.name }),
				translate('nikki.general.messages.success'),
			);
			dispatch(resourceActions.resetUpdateResource());
			const parent = resolvePath('..', location.pathname).pathname;
			navigate(parent);
		}

		if (updateCommand.status === 'error') {
			notification.showError(
				updateCommand.error ?? translate('nikki.general.errors.update_failed'),
				translate('nikki.general.messages.error'),
			);
			dispatch(resourceActions.resetUpdateResource());
		}
	// eslint-disable-next-line @stylistic/max-len
	}, [updateCommand.status, updateCommand.data, updateCommand.error, notification, translate, dispatch, navigate, location]);

	return { isSubmitting, handleCancel, handleSubmit };
}

export const useResourceDetail = {
	detail: useResourceDetailData,
	handlers: useResourceDetailHandlers,
};
